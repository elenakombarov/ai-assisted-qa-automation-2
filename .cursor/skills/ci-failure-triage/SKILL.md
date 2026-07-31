---
name: ci-failure-triage
description: Investigates failed GitHub Actions runs for this repo — pulls workflow logs and Playwright artifacts, cross-references traces and screenshots with source code, classifies the failure, and reports root cause with source location. Use when the user says the build is red, CI is failing, GitHub Actions failed, asks why a workflow failed, or asks to investigate a failed run — even if they don't say "triage".
---

# CI Failure Triage

You are the CI failure investigator for this Playwright test suite. Your job is to determine **why** a GitHub Actions run failed, **where** the problem originates in the codebase, and whether it is an **application bug** or a **test issue**.

Do not stop at the failed assertion line. Always trace back to the originating source — Page Object, test setup, fixture, config, workflow, or application UI/API behavior.

## Workflow

Copy and track:

```
- [ ] 1. Identify the failed run (GitHub MCP or gh CLI)
- [ ] 2. Pull workflow logs — focus on the failing step
- [ ] 3. Download Playwright artifacts if available
- [ ] 4. Parse failure details (test name, error, stack, retries)
- [ ] 5. Cross-reference logs, report, traces, screenshots, and source code
- [ ] 6. Classify: Application bug | Test issue
- [ ] 7. Identify root cause and source location
- [ ] 8. Produce concise triage report
```

## Step 1 — Identify the failed run

Resolve the target run from what the user provided:

| User input | How to resolve |
|------------|----------------|
| PR URL or number | Use GitHub MCP `pull_request_read` with `method: get_check_runs` |
| Actions run URL | Extract run ID from URL |
| Branch name | `gh run list --branch <branch> --workflow=e2e.yml --limit 5` |
| "Latest failed run" | `gh run list --workflow=e2e.yml --status failure --limit 1` |
| Local `ci-artifacts/` folder | Use if already downloaded; note run ID from folder name |

**This repo's CI:**

| Item | Value |
|------|-------|
| Workflow file | `.github/workflows/e2e.yml` |
| Workflow name | `E2E Tests` |
| Job | `test` |
| Test command | `npx playwright test` |
| Artifact name | `playwright-report` |
| Artifact path | `playwright-report/` (HTML report, traces, screenshots) |

Read GitHub MCP tool schemas before calling (`GetMcpTools` on `user-github`).

For PRs:

```
pull_request_read
  method: get_check_runs   # find failed E2E check + run URL
  method: get_status       # combined commit status
```

For direct run lookup, prefer **gh CLI** (MCP has no workflow-log download):

```bash
gh run list --repo <owner>/<repo> --workflow=e2e.yml --limit 10
gh run view <run-id> --repo <owner>/<repo>
```

## Step 2 — Pull workflow logs

Download failed-step logs first; expand only if the failure is unclear.

```bash
# Failed steps only (preferred)
gh run view <run-id> --log-failed > ci-artifacts/run-<run-id>-failed.log

# Full log (when failure is in setup/install or multiple jobs)
gh run view <run-id> --log > ci-artifacts/run-<run-id>.log
```

**What to extract from logs:**

- Which step failed (`npm ci`, `playwright install`, `playwright test`, artifact upload)
- Playwright summary line: `Running N tests using M worker(s)`
- Per-test result markers: `×` (failed), `±` (flaky), `°` (skipped)
- GitHub Actions annotations from the `github` reporter (file:line links)
- Retry count — CI retries twice (`retries: 2` in `playwright.config.ts`)
- Environment hints: missing secrets, auth failures, timeout messages

Filter noise: ignore runner provisioning, apt installs, and browser download progress unless the install step itself failed.

## Step 3 — Download Playwright artifacts

Artifacts upload on every run (`if: !cancelled()`), including failures.

```bash
mkdir -p ci-artifacts/run-<run-id>
gh run download <run-id> -n playwright-report -D ci-artifacts/run-<run-id>
```

If download fails (expired artifact, upload step failed), rely on workflow logs and GitHub annotations. Note the gap in the triage report.

**Artifact layout after download:**

| Path | Contents |
|------|----------|
| `ci-artifacts/run-<id>/index.html` | Playwright HTML report — start here |
| `ci-artifacts/run-<id>/data/*.md` | Per-test failure summaries with error details |
| `ci-artifacts/run-<id>/data/*.png` | Failure screenshots |
| `ci-artifacts/run-<id>/data/*.zip` | Playwright trace archives |
| `ci-artifacts/run-<id>/trace/` | Unpacked trace viewer assets |

Open `index.html` or read the matching `data/*.md` for the failed test. For traces:

```bash
npx playwright show-trace ci-artifacts/run-<run-id>/data/<trace>.zip
```

Inspect traces and screenshots when the log alone does not explain the failure state.

## Step 4 — Parse failure details

From logs and/or HTML report, capture for **each** failed test:

- **Test title** and **spec file** (e.g. `tests/programs.a11y.spec.ts:6:3`)
- **Exact assertion error** (message, expected vs received)
- **Stack trace** — note which frames are test code vs Playwright vs node_modules
- **Retry behavior** — failed all 3 attempts (initial + 2 retries) or flaky?
- **Project/browser** — `chromium`, `setup`, etc.
- **Tags** — e.g. `@regression`

If multiple tests failed, triage each one but lead the report with the **first root failure** (others may be cascading).

## Step 5 — Cross-reference with source code

Read the failing spec and trace the execution path:

1. **Spec file** — what is being asserted and why?
2. **Page Objects** (`pages/`) — locators and actions used before the assertion
3. **Fixtures** (`fixtures/cleanup.fixture.ts`, `*.setup.ts`) — auth, cleanup, env
4. **Config** (`playwright.config.ts`) — base URL, retries, trace/screenshot settings
5. **Application behavior** — for UI failures, identify the DOM element, visible text, and which app styling/component causes the defect

**Root-cause tracing rules:**

- Do not cite only `expect(...)` at the failure line as the source location.
- For **locator/timeouts**, find whether the selector is wrong (test issue) or the element is missing/wrong (app bug).
- For **a11y failures**, identify the violating DOM node and the UI text/component — the bug is in application styling, not in the assertion.
- For **API/auth failures**, check setup project (`tests/auth.setup.ts`), secrets in CI, and `DIDAXIS_*` env vars.
- For **data-dependent failures**, check whether prior tests left dirty state (test issue) or the app mishandles data (app bug).

## Step 6 — Classify the failure

Every failure must be classified as exactly one primary type:

### Application bug

The product under test behaves incorrectly. Fix belongs in the application (or is a known defect being surfaced correctly).

Examples:

- UI shows wrong text, stale data, or missing elements the spec correctly expects
- Accessibility violations in production UI (color contrast, missing headings, empty table headers)
- API returns wrong status or payload
- Validation rules not enforced in the app

### Test issue

The test (or test infrastructure) is wrong, outdated, or unreliable — the app may be fine.

Examples:

- Incorrect locator, assertion, or test data
- Missing `await`, race condition, or insufficient wait in test/POM code
- Outdated allowlist or snapshot not updated after intentional UI change
- Missing/skipped cleanup causing false failures (`fixtures/cleanup.fixture.ts`)
- Flaky test with no reproducible app defect
- CI misconfiguration (wrong secret name, missing env, workflow change needed)
- Test assumes behavior not in acceptance criteria

When uncertain, state what evidence would confirm each classification.

## Step 7 — Triage report

Return a concise report using this template:

```markdown
## CI Triage Report

**Run:** [<workflow> #<run-id>](<run-url>)
**Branch / PR:** <branch or PR #>
**Commit:** <sha short>
**Failed job/step:** test → `npx playwright test`

### Summary
<One sentence: what failed and why>

### Classification
**<Application bug | Test issue>**

### Failed test(s)
| Test | Spec | Result |
|------|------|--------|
| <title> | `<path>:<line>` | failed (retry N/2) |

### Root cause
<Plain-language explanation of the underlying problem — not just the assertion message>

### Source location
| Layer | Location | Why |
|-------|----------|-----|
| **Origin** | `<file>:<line>` or `<UI component/description>` | <what is wrong here> |
| Assertion | `<spec>:<line>` | where the failure surfaced |

### Evidence
- Log: `ci-artifacts/run-<id>-failed.log` — <relevant excerpt>
- Report: `ci-artifacts/run-<id>/data/<hash>.md`
- Screenshot: `ci-artifacts/run-<id>/data/<hash>.png` (if available)
- Trace: `ci-artifacts/run-<id>/data/<hash>.zip` (if available)

### Recommended fix
- **If application bug:** <what to change in the app>
- **If test issue:** <what to change in the test/POM/fixture/CI>

### Confidence
<High | Medium | Low> — <one line on what was verified vs inferred>
```

Keep the report short. Omit empty evidence rows. Include log excerpts only when they add clarity.

## Rules

- Always investigate — do not guess from the user's description alone.
- Always download artifacts when available before concluding.
- Always identify root cause; "assertion failed" is not a root cause.
- Always report the **origin** source location, separate from the assertion line.
- Triage only — do not fix code or open Jira tickets unless the user asks.
- For multiple failures, produce one report with a primary failure and list secondary failures briefly.
- If CI failed for non-test reasons (npm ci, install, timeout), classify as **Test issue** (infrastructure/CI) and identify the failing step.
- Prefer `gh run view --log-failed` over reading entire logs.
- After downloading, use local artifact paths in the report so the user can inspect them.

## Playwright defaults for this project

| Setting | Value |
|---------|-------|
| Base URL | `process.env.DIDAXIS_URL` |
| CI workers | `1` |
| CI retries | `2` |
| Trace | `on-first-retry` |
| Screenshot | `only-on-failure` |
| Reporter (CI) | `html` + `github` |
| Auth setup | `tests/auth.setup.ts` → `playwright/.auth/user.json` |

## Related skills

- File Jira bugs after triage → [jira-bug-reporter](../jira-bug-reporter/SKILL.md)
- Fix PR CI in a loop → babysit skill (Cursor built-in)
- POM/test conventions → [pom-conventions](../pom-conventions/SKILL.md)

## GitHub MCP quick reference

Read schemas before calling.

| Goal | Tool |
|------|------|
| PR check runs | `pull_request_read` → `get_check_runs` |
| PR combined status | `pull_request_read` → `get_status` |
| PR commits / changed files | `pull_request_read` → `get_commits`, `get_files` |
| Repo context | `get_me` |

Workflow logs and artifact download: use **gh CLI** (see steps 2–3).
