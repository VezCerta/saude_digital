#!/usr/bin/env node
// Aguarda os checks do SonarQube apenas dos módulos alterados no Pull Request.
// Permite configurar um único Status Check obrigatório ("Quality Gate") no GitHub,
// sem travar PRs que alteram apenas parte do monorepo.

import { execFileSync } from 'node:child_process';

const GIT_BIN = '/usr/bin/git';
const POLL_INTERVAL_MS = 15_000;
const MAX_WAIT_MS = 15 * 60 * 1000;

const {
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  BASE_SHA,
  HEAD_SHA,
  GITHUB_API_URL = 'https://api.github.com',
} = process.env;

const MODULES = [
  {
    name: 'backend',
    pattern: /^(backend\/|\.github\/workflows\/backend\.yml$)/,
    checkName: 'SonarQube Quality Gate (NestJS)',
  },
  {
    name: 'web',
    pattern: /^(web\/|\.github\/workflows\/web\.yml$)/,
    checkName: 'SonarQube Quality Gate (React Router + Vite)',
  },
  {
    name: 'mobile',
    pattern: /^(mobile\/|\.github\/workflows\/mobile\.yml$)/,
    checkName: 'SonarQube Quality Gate (Android Jetpack Compose)',
  },
];

function fail(msg) {
  console.error(`::error::${msg}`);
  process.exit(1);
}

function getChangedFiles() {
  const out = execFileSync(
    GIT_BIN,
    ['diff', '--name-only', `${BASE_SHA}...${HEAD_SHA}`],
    { encoding: 'utf8' },
  );
  return out.split('\n').map((l) => l.trim()).filter(Boolean);
}

async function fetchCheckRuns() {
  const runs = [];
  for (let page = 1; ; page++) {
    const url = `${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/check-runs?per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!res.ok) {
      fail(`GitHub API check-runs -> HTTP ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    runs.push(...(data.check_runs ?? []));
    if ((data.check_runs?.length ?? 0) < 100) break;
  }
  return runs;
}

async function main() {
  for (const [k, v] of Object.entries({ GITHUB_TOKEN, GITHUB_REPOSITORY, BASE_SHA, HEAD_SHA })) {
    if (!v) fail(`Variável de ambiente ${k} não definida.`);
  }

  const changedFiles = getChangedFiles();
  const expected = MODULES.filter((m) => changedFiles.some((f) => m.pattern.test(f)));

  if (expected.length === 0) {
    console.log('Nenhum módulo (backend/web/mobile) alterado. Quality Gate aprovado.');
    return;
  }

  console.log(`Módulos alterados: ${expected.map((m) => m.name).join(', ')}`);
  console.log(`Aguardando checks: ${expected.map((m) => m.checkName).join(', ')}`);

  const deadline = Date.now() + MAX_WAIT_MS;
  while (Date.now() < deadline) {
    const runs = await fetchCheckRuns();
    const pending = [];
    const failed = [];

    for (const mod of expected) {
      const matching = runs
        .filter((r) => r.name === mod.checkName)
        .sort((a, b) => b.id - a.id);
      const latest = matching[0];

      if (!latest || latest.status !== 'completed') {
        pending.push(mod.checkName);
      } else if (latest.conclusion !== 'success') {
        failed.push(`${mod.checkName} (${latest.conclusion})`);
      }
    }

    if (failed.length > 0) {
      fail(`Quality Gate reprovado: ${failed.join(', ')}`);
    }

    if (pending.length === 0) {
      console.log('✅ Todos os Quality Gates dos módulos alterados passaram.');
      return;
    }

    console.log(`Aguardando conclusão: ${pending.join(', ')}...`);
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  fail('Timeout aguardando os checks do SonarQube.');
}

main().catch((err) => fail(err.stack || String(err)));
