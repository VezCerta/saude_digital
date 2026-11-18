#!/usr/bin/env node
// Gera um relatório com TODOS os problemas (issues + security hotspots) de um
// projeto no SonarQube Cloud / SonarQube Server, via Web API.
//
// Saídas (no diretório OUTPUT_DIR, padrão: ./sonar-report):
//   sonar-report.md   -> relatório legível (também vai para o resumo do job no Actions)
//   sonar-issues.csv  -> planilha com todas as issues
//   sonar-hotspots.csv-> planilha com os security hotspots
//
// Uso local:
//   SONAR_TOKEN=xxx SONAR_PROJECT_KEY=VezCerta_saude_digital_backend \
//     node .github/scripts/sonar-report.mjs
//
// Variáveis de ambiente:
//   SONAR_TOKEN        (obrigatória) token do Sonar (My Account > Security)
//   SONAR_PROJECT_KEY  (obrigatória) chave do projeto
//   SONAR_ORGANIZATION organização (SonarQube Cloud), padrão: vezcerta
//   SONAR_HOST_URL     padrão: https://sonarcloud.io
//   SONAR_PULL_REQUEST número do PR (opcional - filtra os problemas do PR)
//   SONAR_BRANCH       branch (opcional - ignorado se SONAR_PULL_REQUEST for informado)
//   OUTPUT_DIR         padrão: ./sonar-report

import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const {
  SONAR_TOKEN,
  SONAR_PROJECT_KEY,
  SONAR_ORGANIZATION = 'vezcerta',
  SONAR_HOST_URL = 'https://sonarcloud.io',
  SONAR_PULL_REQUEST = '',
  SONAR_BRANCH = '',
  OUTPUT_DIR = 'sonar-report',
  GITHUB_STEP_SUMMARY,
} = process.env;

const PAGE_SIZE = 500; // máximo permitido pela API
const MAX_RESULTS = 10000; // limite da API do Sonar por consulta

const SEVERITY_ORDER = ['BLOCKER', 'CRITICAL', 'HIGH', 'MAJOR', 'MEDIUM', 'MINOR', 'LOW', 'INFO'];
const SEVERITY_ICON = {
  BLOCKER: '🟥', CRITICAL: '🟥', HIGH: '🟥', MAJOR: '🟧', MEDIUM: '🟧', MINOR: '🟨', LOW: '🟨', INFO: '⬜',
};
const TYPE_LABEL = { BUG: 'Bug', VULNERABILITY: 'Vulnerabilidade', CODE_SMELL: 'Code Smell' };

// Remove quebras de linha e caracteres de controle antes de escrever no log,
// evitando log injection / injeção de comandos do GitHub Actions (::comando::).
function sanitizeLog(value) {
  return String(value).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/::/g, ': :');
}

function fail(msg) {
  console.error(`::error::${sanitizeLog(msg)}`);
  process.exit(1);
}

function scopeParams() {
  if (SONAR_PULL_REQUEST) return { pullRequest: SONAR_PULL_REQUEST };
  if (SONAR_BRANCH) return { branch: SONAR_BRANCH };
  return {};
}

async function api(path, params) {
  const url = new URL(path, SONAR_HOST_URL);
  for (const [k, v] of Object.entries(params)) if (v !== '' && v != null) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${SONAR_TOKEN}` } });
  if (!res.ok) fail(`Sonar API ${url.pathname} -> HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchAllIssues() {
  const issues = [];
  let total = 0;
  for (let p = 1; ; p++) {
    const data = await api('/api/issues/search', {
      componentKeys: SONAR_PROJECT_KEY,
      organization: SONAR_ORGANIZATION,
      resolved: 'false',
      additionalFields: 'rules',
      ps: PAGE_SIZE,
      p,
      ...scopeParams(),
    });
    total = data.paging?.total ?? data.total ?? 0;
    issues.push(...data.issues);
    if (data.issues.length < PAGE_SIZE || issues.length >= Math.min(total, MAX_RESULTS)) break;
  }
  return { issues, total };
}

async function fetchAllHotspots() {
  const hotspots = [];
  for (let p = 1; ; p++) {
    const data = await api('/api/hotspots/search', {
      projectKey: SONAR_PROJECT_KEY,
      organization: SONAR_ORGANIZATION,
      status: 'TO_REVIEW',
      ps: PAGE_SIZE,
      p,
      ...scopeParams(),
    });
    hotspots.push(...data.hotspots);
    if (data.hotspots.length < PAGE_SIZE || hotspots.length >= (data.paging?.total ?? 0)) break;
  }
  return hotspots;
}

async function fetchQualityGate() {
  try {
    const data = await api('/api/qualitygates/project_status', {
      projectKey: SONAR_PROJECT_KEY,
      organization: SONAR_ORGANIZATION,
      ...scopeParams(),
    });
    return data.projectStatus;
  } catch {
    return null;
  }
}

const filePath = (component) => component?.split(':').slice(1).join(':') || component || '';
const issueSeverity = (i) =>
  i.severity || i.impacts?.map((x) => x.severity).sort((a, b) => SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b))[0] || 'INFO';
const issueType = (i) => TYPE_LABEL[i.type] || i.impacts?.map((x) => x.softwareQuality).join(', ') || i.type || '';
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
const mdCell = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

function countBy(list, fn) {
  const map = {};
  for (const item of list) map[fn(item)] = (map[fn(item)] ?? 0) + 1;
  return map;
}

function issueLink(i) {
  const url = new URL('/project/issues', SONAR_HOST_URL);
  url.searchParams.set('id', SONAR_PROJECT_KEY);
  url.searchParams.set('open', i.key);
  for (const [k, v] of Object.entries(scopeParams())) url.searchParams.set(k, v);
  return url.toString();
}

async function main() {
  if (!SONAR_TOKEN) fail('Variável SONAR_TOKEN não definida.');
  if (!SONAR_PROJECT_KEY) fail('Variável SONAR_PROJECT_KEY não definida.');

  const scope = SONAR_PULL_REQUEST ? `PR #${SONAR_PULL_REQUEST}` : SONAR_BRANCH ? `branch ${SONAR_BRANCH}` : 'branch principal';
  console.log(`Buscando problemas de ${sanitizeLog(SONAR_PROJECT_KEY)} (${sanitizeLog(scope)})...`);

  const [{ issues, total }, hotspots, gate] = await Promise.all([fetchAllIssues(), fetchAllHotspots(), fetchQualityGate()]);

  issues.sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(issueSeverity(a)) - SEVERITY_ORDER.indexOf(issueSeverity(b)) ||
      filePath(a.component).localeCompare(filePath(b.component)) ||
      (a.line ?? 0) - (b.line ?? 0),
  );

  mkdirSync(OUTPUT_DIR, { recursive: true });

  // ---------- CSV ----------
  const issuesCsv = [
    ['Severidade', 'Tipo', 'Arquivo', 'Linha', 'Mensagem', 'Regra', 'Esforço', 'Tags', 'Link'].map(csvCell).join(','),
    ...issues.map((i) =>
      [issueSeverity(i), issueType(i), filePath(i.component), i.line, i.message, i.rule, i.effort, (i.tags ?? []).join(' '), issueLink(i)]
        .map(csvCell)
        .join(','),
    ),
  ].join('\n');
  writeFileSync(join(OUTPUT_DIR, 'sonar-issues.csv'), '\uFEFF' + issuesCsv); // BOM p/ abrir certo no Excel

  const hotspotsCsv = [
    ['Probabilidade', 'Categoria', 'Arquivo', 'Linha', 'Mensagem', 'Regra'].map(csvCell).join(','),
    ...hotspots.map((h) =>
      [h.vulnerabilityProbability, h.securityCategory, filePath(h.component), h.line, h.message, h.ruleKey].map(csvCell).join(','),
    ),
  ].join('\n');
  writeFileSync(join(OUTPUT_DIR, 'sonar-hotspots.csv'), '\uFEFF' + hotspotsCsv);

  // ---------- Markdown ----------
  const bySeverity = countBy(issues, issueSeverity);
  const byType = countBy(issues, issueType);
  const gateIcon = gate?.status === 'OK' ? '✅ Aprovado' : gate?.status === 'ERROR' ? '❌ Reprovado' : gate?.status ?? 'desconhecido';

  let md = `## 📊 Relatório SonarQube — \`${SONAR_PROJECT_KEY}\` (${scope})\n\n`;
  md += `**Quality Gate:** ${gateIcon}  \n`;
  md += `**Issues abertas:** ${total}${total > issues.length ? ` (exibindo ${issues.length}, limite da API)` : ''}  \n`;
  md += `**Security Hotspots a revisar:** ${hotspots.length}\n\n`;

  const failedConditions = gate?.conditions?.filter((c) => c.status === 'ERROR') ?? [];
  if (failedConditions.length) {
    md += `### ❌ Condições reprovadas no Quality Gate\n\n| Métrica | Valor | Limite |\n|---|---|---|\n`;
    for (const c of failedConditions) md += `| ${c.metricKey} | ${c.actualValue} | ${c.comparator === 'LT' ? '<' : '>'} ${c.errorThreshold} |\n`;
    md += '\n';
  }

  md += `### Resumo\n\n| Severidade | Qtd |\n|---|---|\n`;
  for (const s of SEVERITY_ORDER) if (bySeverity[s]) md += `| ${SEVERITY_ICON[s]} ${s} | ${bySeverity[s]} |\n`;
  md += `\n| Tipo | Qtd |\n|---|---|\n`;
  for (const [t, n] of Object.entries(byType)) md += `| ${t} | ${n} |\n`;

  if (issues.length) {
    md += `\n### Issues\n\n| Sev. | Tipo | Arquivo | Linha | Mensagem | Regra |\n|---|---|---|---|---|---|\n`;
    for (const i of issues) {
      md += `| ${SEVERITY_ICON[issueSeverity(i)] ?? ''} ${issueSeverity(i)} | ${issueType(i)} | \`${mdCell(filePath(i.component))}\` | ${i.line ?? ''} | [${mdCell(i.message)}](${issueLink(i)}) | ${i.rule} |\n`;
    }
  }

  if (hotspots.length) {
    md += `\n### 🔐 Security Hotspots\n\n| Probabilidade | Categoria | Arquivo | Linha | Mensagem |\n|---|---|---|---|---|\n`;
    for (const h of hotspots) {
      md += `| ${h.vulnerabilityProbability} | ${h.securityCategory} | \`${mdCell(filePath(h.component))}\` | ${h.line ?? ''} | ${mdCell(h.message)} |\n`;
    }
  }

  writeFileSync(join(OUTPUT_DIR, 'sonar-report.md'), md);

  // Resumo do job no GitHub Actions (limite de 1 MiB)
  if (GITHUB_STEP_SUMMARY) {
    const summary = md.length > 900_000 ? md.slice(0, 900_000) + '\n\n_(relatório truncado — veja o artefato completo)_\n' : md;
    appendFileSync(GITHUB_STEP_SUMMARY, summary);
  }

  console.log(`✅ ${issues.length} issues e ${hotspots.length} hotspots exportados para ${sanitizeLog(OUTPUT_DIR)}/`);
}

main().catch((err) => fail(err.stack || String(err)));
