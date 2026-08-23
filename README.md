# Didaxis Playwright tests

End-to-end Playwright coverage for Didaxis Studio. Feature specs use the `setup` project `storageState` session. Copy `.env.example` to `.env` and fill in real values locally — never commit secrets.

## Install

```bash
npm ci
npx playwright install chromium
cp .env.example .env
```

Edit `.env` with your Didaxis credentials. The **Run tests** variables are required for `npx playwright test`. The **Agent / CI setup** variables are only for the headless agent and Jira automation.

## Run tests

```bash
npx playwright test
```

Tagged slice (exactly one tag per test):

```bash
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:api
npm run test:e2e
npm run test:destructive
```

## Agent / CI

- Playwright CI: `.github/workflows/e2e.yml` (Didaxis secrets only).
- Headless agent: `.github/workflows/test-generation.yml` (`CURSOR_API_KEY` and Atlassian vars).
- MCP tokens (Atlassian and others) live in Cursor settings, not `.env`.

## `.cursor/` agents and skills

Project Cursor config loads when the workspace is trusted. No extra install.

| Path | Role |
|------|------|
| `.cursor/rules/constitution.mdc` | Always-on MUST / SHOULD / WON'T |
| `.cursor/agents/` | `test-writer`, `triage`, `bug-reporter` |
| `.cursor/skills/` | `a11y-checks`, `ci-failure-triage`, `didaxis-bulk-cleanup`, `didaxis-ds-qa`, `jira-bug-reporter`, `jira-ticket-to-gherkin`, `network-mocked-edge-cases`, `playwright-test-cleanup`, `pom-conventions` |

Ask the agent to run a DS ticket through QA, write tests from a plan, triage a red run, or file a Jira bug — it will pick the matching agent or skill.
