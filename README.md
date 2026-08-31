# AI-Assisted QA Automation — Playwright Portfolio

End-to-end test automation for **Didaxis Studio** (Programs module), built with **Playwright**, **TypeScript**, and a **Cursor-native AI QA workflow** — from Jira acceptance criteria through automated specs, CI execution, failure triage, and bug reporting.

**112 Playwright tests** · **Chromium** · **Page Object Model** · **storageState auth** · **GitHub Actions** · **Axe accessibility scans**

---

## Core Capabilities

| Capability | Implementation |
|------------|----------------|
| **E2E automation** | Program create, edit, delete, and list flows with validation boundaries, RBAC, security input handling, and network error paths |
| **Test architecture** | Custom fixtures, self-cleaning data (`uniqueName` + `trackProgram`), tagged suites, Jira-traceable test IDs (DS-1–DS-5) |
| **Quality engineering** | Markdown test plans (`Test Cases/`), Gherkin features, known defects documented with `test.skip` |
| **Accessibility** | `@axe-core/playwright` scans with known-issue partitioning — unexpected violations fail the build |
| **AI-assisted QA** | Cursor agents, skills, constitution rules, and hooks for test authoring, CI triage, and Jira filing |
| **CI/CD** | GitHub Actions with event-based tag slices and Playwright HTML report artifacts |

---

## Application Under Test

**Didaxis Studio** — academic program management.

| Ticket | Feature | Spec |
|--------|---------|------|
| DS-1 | Create new academic program | `tests/programs.spec.ts` |
| DS-2 | Edit existing program details | `tests/ds2-edit-program.spec.ts` |
| DS-4 | Delete program with confirmation | `tests/ds4-delete-program.spec.ts` |
| DS-5 | Program list display | `tests/ds5-program-list.spec.ts` |
| — | Accessibility (Programs page + modal) | `tests/programs.a11y.spec.ts` |

Supporting artifacts: Markdown plans in `Test Cases/DS-N/`, Gherkin in `features/`.

---

## Tech Stack

Playwright Test 1.61 · TypeScript 6 (ES modules, strict mode) · `@axe-core/playwright` · GitHub Actions (Node 20) · Cursor agents/skills/rules

---

## Project Structure

```
├── tests/                  # Playwright specs
├── pages/                  # Page Object Models
├── fixtures/               # Custom fixture (auth + program cleanup)
├── Test Cases/DS-N/        # Jira-aligned Markdown test plans
├── features/               # Gherkin scenarios (DS-1, DS-2)
├── scripts/                # Failure screenshot collection + Jira attachment
├── .github/workflows/      # CI pipeline
├── .cursor/                # AI agents, skills, rules, hooks
├── playwright.config.ts
└── auth-strategy.md
```

---

## Framework Design

### Authentication — `storageState` setup project

Feature tests reuse a persisted session instead of logging in per test:

1. **`setup` project** runs `tests/auth.setup.ts` once — UI login, session saved to `playwright/.auth/user.json`
2. **`chromium` project** depends on `setup` and loads `storageState` for authenticated tests
3. **`unauthenticatedTest`** fixture clears session for auth-negative scenarios

Optional role accounts (`DIDAXIS_VIEWER_*`, `DIDAXIS_EDITOR_*`, `DIDAXIS_NON_ADMIN_*`) enable RBAC tests when configured; tests skip when credentials are absent. See [`auth-strategy.md`](auth-strategy.md).

### Self-cleaning test data

Programs created during tests use unique names (`uniqueName()` + timestamp), register UUIDs via `trackProgram`, and are deleted by a worker-scoped fixture via `DELETE /api/programs/{id}`.

### Page Object Model

| Page Object | Responsibility |
|-------------|----------------|
| `ProgramsPage` | Programs list, navigation, row actions |
| `NewProgramModal` | Create dialog |
| `DeleteProgramModal` | Delete confirmation dialog |
| `LoginPage` | Sign-in form |

Locators are role-based (`getByRole`, `getByLabel`, `getByText`) with `.filter({ hasText })` for disambiguation. **Partial:** DS-2 edit flow uses inline helpers rather than a dedicated edit-modal POM.

### Test tagging

Exactly one tag per test — enables targeted CI slices:

| Tag | Purpose | Tests |
|-----|---------|------:|
| `@smoke` | Critical happy path | 4 |
| `@sanity` | Core happy paths | 16 |
| `@regression` | Validation, boundaries, accessibility | 81 |
| `@e2e` | Auth and role-based access | 10 |
| `@api` | API contract checks | 0 *(tag reserved; scripts exist)* |
| `@destructive` | Shared/global state mutation | 0 *(tag reserved; scripts exist)* |

### Accessibility testing

`tests/programs.a11y.spec.ts` runs Axe scans on the Programs page and New Program modal. Known product issues are attached as artifacts and excluded from failure assertions. **Partial:** no WCAG-tagged scans (`.withTags`) or keyboard navigation tests yet — conventions live in `.cursor/skills/a11y-checks/`.

### API usage

API supports test infrastructure, not a standalone API test layer: program teardown, cleanup auth (`POST /api/auth/login`), and one auth-negative check (unauthenticated DELETE expects 401+). **Partial:** no `@api`-tagged contract tests yet.

### Network resilience

Selected error paths use `page.route` to mock 500 responses on PATCH (edit) and DELETE (delete).

---

## AI-Assisted QA Workflow

Project Cursor config loads when the workspace is trusted. No extra install. Atlassian MCP tokens live in **Cursor settings**, not `.env`.

### Agents (`.cursor/agents/`)

| Agent | Role |
|-------|------|
| `test-writer` | Test plan / Jira ticket → Playwright spec |
| `triage` | CI failure diagnosis (read-only) |
| `bug-reporter` | Jira DS sub-tasks with screenshot evidence |

### Skills & rules

| Path | Role |
|------|------|
| `.cursor/rules/constitution.mdc` | Always-on MUST / SHOULD / WON'T |
| `.cursor/rules/playwright-conventions.mdc` | Locator, wait, tag, and assertion standards |
| `.cursor/rules/qa-orchestration.mdc` | End-to-end DS ticket QA coordinator |
| `.cursor/skills/` | `didaxis-ds-qa`, `jira-ticket-to-gherkin`, `jira-bug-reporter`, `pom-conventions`, `playwright-test-cleanup`, `a11y-checks`, `network-mocked-edge-cases`, `ci-failure-triage`, `didaxis-bulk-cleanup`, `exploratory-charter` |
| `.cursor/hooks/block-wont-violations.mjs` | Blocks forbidden patterns (`waitForTimeout`, CSS/XPath locators) |

Ask the agent to run a DS ticket through QA, write tests from a plan, triage a red run, or file a Jira bug — it picks the matching agent or skill.

---

## Install

```bash
npm ci
npx playwright install chromium
cp .env.example .env
```

Edit `.env` with your Didaxis credentials. **Never commit real secrets.**

**Run tests** — required for `npx playwright test`:

| Variable | Purpose |
|----------|---------|
| `DIDAXIS_URL` | Playwright `baseURL` |
| `DIDAXIS_EMAIL` | Admin login for `auth.setup.ts` |
| `DIDAXIS_PASSWORD` | Admin login for `auth.setup.ts` |
| `DIDAXIS_API_TOKEN` | Bearer token for API teardown (CI) |

**Agent / Jira automation** — only for Cursor agent workflows and Jira scripts:

| Variable | Purpose |
|----------|---------|
| `CURSOR_API_KEY` | Cursor API |
| `ATLASSIAN_API_TOKEN` | Atlassian API |
| `ATLASSIAN_BASE_URL` | Atlassian site origin |
| `ATLASSIAN_EMAIL` | Atlassian account email |

Optional: `DIDAXIS_ALT_EMAIL/PASSWORD`, `DIDAXIS_VIEWER_*`, `DIDAXIS_EDITOR_*`, `DIDAXIS_NON_ADMIN_*` for role-based tests.

---

## Run tests

```bash
npx playwright test
```

Tagged slices (exactly one tag per test):

```bash
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:e2e
npm run test:api          # no @api tests yet
npm run test:destructive  # no @destructive tests yet
```

Debug and reporting:

```bash
npm run test:headed
npm run test:debug
npm run test:ui
npm run report
```

---

## CI — GitHub Actions

Workflow: [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml) (Didaxis secrets only).

| Trigger | Suite |
|---------|-------|
| Pull request | `@smoke` |
| Push | `@sanity` |
| Manual dispatch | `@regression` |

Chromium with deps, 2 retries, 1 worker, HTML + GitHub reporters, 7-day report artifact.

**Secrets:** `DIDAXIS_URL`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD`, `DIDAXIS_API_TOKEN`

---

## Demo Specs

Separate from Didaxis coverage:

| Spec | App | Tests |
|------|-----|------:|
| `tests/todo.spec.ts` | TodoMVC (public demo) | 22 |
| `tests/example.spec.ts` | playwright.dev | 2 |
