#!/usr/bin/env node
// Bot de code review com Gemini para Pull Requests.
//
// Lê o diff do PR (restrito ao módulo informado), envia para a API do Gemini
// e publica/atualiza um comentário no PR com o feedback.
//
// Variáveis de ambiente:
//   GEMINI_API_KEY   (obrigatória) chave da API do Google AI Studio
//   GITHUB_TOKEN     (obrigatória) token com permissão pull-requests: write
//   GITHUB_REPOSITORY, PR_NUMBER, BASE_SHA, HEAD_SHA (fornecidas pelo workflow)
//   REVIEW_PATH      diretório do módulo (ex.: backend). Vazio = repositório inteiro
//   REVIEW_LABEL     nome amigável do módulo (ex.: Backend NestJS)
//   GEMINI_MODEL     modelo (padrão: gemini-flash-latest)
//   MAX_DIFF_CHARS   limite de caracteres do diff enviado (padrão: 120000)

import { execFileSync } from 'node:child_process';

// Caminho absoluto do git: não depende do PATH (que poderia conter diretórios graváveis).
const GIT_BIN = '/usr/bin/git';

const {
  GEMINI_API_KEY,
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  PR_NUMBER,
  BASE_SHA,
  HEAD_SHA,
  REVIEW_PATH = '',
  REVIEW_LABEL = REVIEW_PATH || 'repositório',
  GEMINI_MODEL = 'gemini-flash-latest',
  MAX_DIFF_CHARS = '120000',
  GITHUB_API_URL = 'https://api.github.com',
} = process.env;

const MARKER = `<!-- gemini-code-review:${REVIEW_PATH || 'root'} -->`;

const IGNORED_FILES = [
  ':(exclude)**/package-lock.json',
  ':(exclude)**/yarn.lock',
  ':(exclude)**/pnpm-lock.yaml',
  ':(exclude)**/*.min.js',
  ':(exclude)**/*.svg',
  ':(exclude)**/*.png',
  ':(exclude)**/*.jpg',
  ':(exclude)**/*.jpeg',
  ':(exclude)**/*.pdf',
  ':(exclude)**/*.zip',
  ':(exclude)**/dist/**',
  ':(exclude)**/build/**',
];

// Remove quebras de linha e caracteres de controle antes de escrever no log,
// evitando log injection / injeção de comandos do GitHub Actions (::comando::).
function sanitizeLog(value) {
  return String(value).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/::/g, ': :');
}

function fail(msg) {
  console.error(`::error::${sanitizeLog(msg)}`);
  process.exit(1);
}

function getDiff() {
  const pathspec = [REVIEW_PATH || '.', ...IGNORED_FILES];
  return execFileSync(
    GIT_BIN,
    ['diff', '--no-color', '--unified=5', `${BASE_SHA}...${HEAD_SHA}`, '--', ...pathspec],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
}

function buildPrompt(diff, truncated) {
  return `Você é um engenheiro de software sênior fazendo code review de um Pull Request
do projeto "Saúde Digital" (sistema para UBS: backend NestJS + TypeORM/PostgreSQL,
web React Router + Vite + Tailwind, mobile Android Kotlin + Jetpack Compose).

Módulo analisado: **${REVIEW_LABEL}**.

Analise APENAS as mudanças do diff abaixo e responda em **português do Brasil**, em Markdown,
com a seguinte estrutura:

### 📝 Resumo
Uma ou duas frases sobre o que o PR faz.

### 🚨 Problemas críticos
Bugs, falhas de segurança (ex.: injeção SQL, exposição de dados sensíveis de pacientes/LGPD,
autenticação/autorização incorreta, segredos no código), perda de dados. Escreva "Nenhum encontrado." se não houver.

### ⚠️ Sugestões de melhoria
Legibilidade, performance, tratamento de erros, testes ausentes, boas práticas do framework.

### ✅ Pontos positivos
O que foi bem feito (breve).

Regras:
- Para cada item cite o arquivo e, quando possível, a linha (ex.: \`src/auth/auth.service.ts:42\`).
- Inclua trechos de código sugeridos quando ajudar.
- Seja objetivo; não invente problemas e não comente código fora do diff.
${truncated ? '- ATENÇÃO: o diff foi truncado por ser muito grande; avalie apenas o que foi enviado.\n' : ''}
\`\`\`diff
${diff}
\`\`\``;
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    fail(`Gemini API respondeu HTTP ${res.status}: ${JSON.stringify(body.error ?? body)}`);
  }
  const text = body.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? '')
    .join('')
    .trim();
  if (!text) fail(`Resposta vazia do Gemini: ${JSON.stringify(body).slice(0, 1000)}`);
  return text;
}

async function github(path, options = {}) {
  const res = await fetch(`${GITHUB_API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) fail(`GitHub API ${options.method ?? 'GET'} ${path} -> HTTP ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

async function upsertComment(body) {
  const comments = [];
  for (let page = 1; ; page++) {
    const batch = await github(`/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments?per_page=100&page=${page}`);
    comments.push(...batch);
    if (batch.length < 100) break;
  }
  const existing = comments.find((c) => c.body?.includes(MARKER));
  if (existing) {
    await github(`/repos/${GITHUB_REPOSITORY}/issues/comments/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ body }),
    });
    console.log(`Comentário atualizado: ${sanitizeLog(existing.html_url)}`);
  } else {
    const created = await github(`/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
    console.log(`Comentário criado: ${sanitizeLog(created.html_url)}`);
  }
}

async function main() {
  for (const [k, v] of Object.entries({ GEMINI_API_KEY, GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, BASE_SHA, HEAD_SHA })) {
    if (!v) fail(`Variável de ambiente ${k} não definida.`);
  }

  let diff = getDiff();
  if (!diff.trim()) {
    console.log(`Nenhuma alteração relevante em "${sanitizeLog(REVIEW_PATH || '.')}". Review ignorado.`);
    return;
  }

  const limit = Number(MAX_DIFF_CHARS);
  const truncated = diff.length > limit;
  if (truncated) diff = diff.slice(0, limit);

  console.log(`Enviando diff (${diff.length} caracteres${truncated ? ', truncado' : ''}) para ${sanitizeLog(GEMINI_MODEL)}...`);
  const review = await callGemini(buildPrompt(diff, truncated));

  const shortSha = HEAD_SHA.slice(0, 7);
  const body = `${MARKER}
## 🤖 Gemini Code Review — ${REVIEW_LABEL}

${review}

---
<sub>Gerado automaticamente por \`${GEMINI_MODEL}\` para o commit ${shortSha}. O feedback é uma sugestão de IA e pode conter imprecisões — a revisão humana continua necessária.</sub>`;

  await upsertComment(body);
}

main().catch((err) => fail(err.stack || String(err)));
