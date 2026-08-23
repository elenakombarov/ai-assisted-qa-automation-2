#!/usr/bin/env node
/**
 * Refresh eval-report.md from gh run footers. Fail open (exit 0).
 * Invoked by Cursor stop / subagentStop / afterShellExecution hooks
 * and by qa-orchestration after local or CI follow-up.
 * Does not invent heal, generation-gate, or ask-vs-guess numbers.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const reportPath = join(root, 'eval-report.md');
const repoUrl = 'https://github.com/elenakombarov/ai-assisted-qa-automation-2';

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function runGh(args) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 45_000,
  });
}

function footerFromLog(log) {
  const failed = [...log.matchAll(/^\s*(\d+) failed\b/gm)].map((m) => Number(m[1]));
  const flaky = [...log.matchAll(/^\s*(\d+) flaky\b/gm)].map((m) => Number(m[1]));
  const passed = [...log.matchAll(/^\s*(\d+) passed\b/gm)].map((m) => Number(m[1]));
  if (failed.length === 0 && passed.length === 0) {
    return null;
  }
  return {
    failed: failed.at(-1) ?? 0,
    flaky: flaky.at(-1) ?? 0,
    passed: passed.at(-1) ?? 0,
  };
}

function formatFooter(footer) {
  const parts = [];
  if (footer.failed) {
    parts.push(`${footer.failed} failed`);
  }
  if (footer.flaky) {
    parts.push(`${footer.flaky} flaky`);
  }
  parts.push(`${footer.passed} passed`);
  return parts.join(', ');
}

function collectRuns() {
  const raw = runGh([
    'run',
    'list',
    '--workflow=E2E Tests',
    '--limit=20',
    '--json',
    'databaseId,conclusion,status,createdAt,url',
  ]);
  const rows = JSON.parse(raw);
  const completed = rows.filter(
    (run) => run.status === 'completed' && run.conclusion !== 'cancelled',
  );
  return completed.slice(0, 10);
}

function measureFlake(runs) {
  const rows = [];
  let flakyTotal = 0;
  let executed = 0;

  for (const run of runs) {
    const when = String(run.createdAt ?? '').slice(0, 10);
    let footerLabel = 'no summary footer in log';
    try {
      const log = runGh(['run', 'view', String(run.databaseId), '--log']);
      const footer = footerFromLog(log);
      if (footer) {
        flakyTotal += footer.flaky;
        executed += footer.failed + footer.flaky + footer.passed;
        footerLabel = formatFooter(footer);
        if (footer.flaky) {
          footerLabel = footerLabel.replace(
            `${footer.flaky} flaky`,
            `**${footer.flaky} flaky**`,
          );
        }
      }
    } catch {
      footerLabel = 'log unavailable';
    }
    rows.push(
      `| [${run.databaseId}](${run.url ?? `${repoUrl}/actions/runs/${run.databaseId}`}) | ${when} | ${footerLabel} |`,
    );
  }

  return { flakyTotal, executed, rows };
}

function replaceFlakeSection(existing, flakeMarkdown) {
  if (!existing.includes('## Flake rate')) {
    return `${existing.trim()}\n\n${flakeMarkdown}\n`;
  }
  if (!existing.includes('## Heal success rate')) {
    return existing.replace(/## Flake rate[\s\S]*$/, `${flakeMarkdown}\n`);
  }
  return existing.replace(
    /## Flake rate[\s\S]*?(?=## Heal success rate)/,
    `${flakeMarkdown}\n\n`,
  );
}

function writeReport({ existing, flakeMarkdown, note }) {
  const generated = stamp();
  let next = existing;
  if (next.includes('**Generated:**')) {
    next = next.replace(/\*\*Generated:\*\*[^\n]*/, `**Generated:** ${generated}  `);
  } else {
    next = `# Suite reliability report\n\n**Generated:** ${generated}  \n\n${next}`;
  }
  next = replaceFlakeSection(next, flakeMarkdown);
  if (note && !next.includes(note)) {
    next = next.replace(
      /(\*\*Generated:\*\*[^\n]*\n)/,
      `$1**Last regeneration note:** ${note}  \n`,
    );
  }
  writeFileSync(reportPath, next, 'utf8');
}

const stub = `# Suite reliability report

**Generated:** ${stamp()}  
**Repo:** [${repoUrl.replace('https://github.com/', '')}](${repoUrl})  
**Workflow measured:** \`.github/workflows/e2e.yml\` (\`E2E Tests\`)  
**Not measured:** \`.github/workflows/test-generation.yml\` — file does not exist; no headless-generation runs.

Cursor has no built-in telemetry for these metrics. Numbers below come only from \`gh run\` logs, GitHub PR/commit history, and this session’s agent transcript. Where that is not enough, the metric is **unavailable**.

---

## Flake rate

## Heal success rate

**Number:** **unavailable** (no heal telemetry in this regeneration).

## Generation-gate pass rate

**Number:** **unavailable** (regeneration does not invent gate scores).

## Ask-vs-guess

**Number:** **Suite-wide: unavailable.**

## Top reliability risk

**unavailable** until the next orchestrated session records it.

## Next action

Re-run this script after \`.github/workflows/test-generation.yml\` or after the QA orchestrator finishes.
`;

try {
  const existing = existsSync(reportPath) ? readFileSync(reportPath, 'utf8') : stub;
  let flakeMarkdown = '';
  let note = '';

  try {
    const runs = collectRuns();
    const { flakyTotal, executed, rows } = measureFlake(runs);
    const pct = executed > 0 ? ((flakyTotal / executed) * 100).toFixed(2) : 'n/a';
    const howMeasured =
      existing.match(/\*\*How measured:\*\*[\s\S]*?(?=\n\*\*What it tells us:\*\*)/)?.[0] ??
      '**How measured:** `gh run list` then `gh run view <id> --log` Playwright footer (`N flaky` = failed then passed on retry). Regenerated automatically by `.cursor/hooks/regenerate-eval-report.mjs`.';
    const whatItTells =
      existing.match(/\*\*What it tells us:\*\*[^\n]*/)?.[0] ??
      '**What it tells us:** See the table; do not invent retry-pass test titles here if the HTML report was not downloaded.';
    flakeMarkdown = `## Flake rate

**Number:** **${flakyTotal} / ${executed} executions (≈ ${pct}%)** over the last **N = ${runs.length}** completed \`E2E Tests\` runs (cancelled runs excluded). Denominator is failed + passed + flaky (skipped excluded).

| Run | When | Footer |
|-----|------|--------|
${rows.join('\n')}

${howMeasured.trim()}

${whatItTells.trim()}
`;
  } catch (error) {
    note = `flake window unchanged (${error.message.split('\n')[0]})`;
    const preserved = existing.match(/## Flake rate[\s\S]*?(?=## Heal success rate)/);
    flakeMarkdown = preserved
      ? preserved[0].trim()
      : `## Flake rate\n\n**Number:** **unavailable** (${note}).\n`;
  }

  writeReport({ existing, flakeMarkdown, note });
  process.exit(0);
} catch {
  process.exit(0);
}
