---
name: didaxis-ds-qa
description: End-to-end Didaxis Studio DS ticket QA workflow — fetch Jira tickets via Atlassian MCP, compare and update Markdown test plans, create or validate Playwright specs, run tests, and file bugs with sub-tasks. Use when working on DS-N tickets, Didaxis Studio program setup tests, Block 2 test plans, or when the user asks to validate Playwright tests against Jira acceptance criteria.
---

# Didaxis Studio DS Ticket QA

## Project layout

| Artifact | Path pattern |
|----------|--------------|
| Test plan input | `Test Cases/DS-N/DS-N_input.md` |
| Test plan output | `Test Cases/DS-N/DS-N_output.md` |
| Playwright spec | `tests/dsN-<feature>.spec.ts` (e.g. `ds2-edit-program.spec.ts`) |
| Credentials | `TODO_MVC/.env` — `DIDAXIS_URL`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD` |
| Optional role creds | `DIDAXIS_VIEWER_*`, `DIDAXIS_EDITOR_*` |

Test case IDs in plans: `DS-N-TC-001`. Test titles in specs: `DS-N-TC-001: <title>`.

## Workflow

Copy and track:

```
- [ ] 1. Fetch Jira ticket (Atlassian MCP)
- [ ] 2. Compare test plan with Jira + Confluence; update plan if gaps
- [ ] 3. Validate or create Playwright spec against updated plan
- [ ] 4. Run tests (do not fix failures unless asked)
- [ ] 5. File Jira bugs + DS-N sub-tasks for failures (if requested)
```

### Step 1 — Fetch Jira ticket

1. Read MCP tool schemas in `mcps/plugin-atlassian-atlassian/tools/` before calling.
2. Search: `search` with query `DS-N` (no cloudId needed).
3. Full details: `getJiraIssue` with:
   - `cloudId`: `f72d2b24-8968-4705-8538-069e61d5ed43`
   - `issueIdOrKey`: `DS-N`
   - `fields`: `["*all", "comment"]`
   - `responseContentFormat`: `"markdown"`

Supplement with Confluence via `search` + `fetch` on Program Setup pages (Field Definitions, UI Behavior, Validation Rules).

### Step 2 — Compare and update test plan

Compare `Test Cases/DS-N/DS-N_output.md` against:

- Jira acceptance criteria (Gherkin in description)
- Confluence field limits and validation rules

**Authoritative Confluence limits (Program Setup):**

| Field | Max length | Notes |
|-------|------------|-------|
| Program Name | 100 | Unique per organization |
| Description | 500 | Optional |

**Role access (UI Behavior):** ADMIN and EDITOR can edit; VIEWER is read-only.

Update the test plan when Jira/Confluence specify behavior the plan misses. Add traceability matrix rows. Document resolved vs open ambiguities at the end of `DS-N_output.md`.

Do not update the test plan unless gaps are found or the user asks.

### Step 3 — Playwright spec

Follow patterns in `tests/ds1-create-program.spec.ts` and `tests/ds2-edit-program.spec.ts`.

**App locators (verified on test.didaxis.studio):**

| Element | Locator |
|---------|---------|
| Login | `getByLabel('Email')`, `getByLabel('Password')`, `getByRole('button', { name: 'Sign In' })` |
| New Program | `getByRole('button', { name: 'New Program' })` |
| Edit | `getByRole('button', { name: \`Edit ${programName}\` })` |
| Modal | `getByRole('dialog')` with heading `Edit Program` or create modal |
| Program Name | `getByLabel('Program Name')` |
| Description | `getByRole('textbox', { name: 'Description' })` |
| Save / Cancel / Create | `getByRole('button', { name: 'Save' \| 'Cancel' \| 'Create' })` |
| Close X | `.mantine-Modal-close` |
| AI config toggle | `getByRole('button', { name: /Show AI Generation Config/i })` |

**Conventions:**

- Load creds from `process.env`; never hardcode passwords.
- Use `uniqueName()` with timestamp suffix; keep names under 100 chars.
- Scroll to programs in large lists: `getByText(name, { exact: true }).first().scrollIntoViewIfNeeded()`.
- Map every `DS-N-TC-XXX` from the test plan to one Playwright test.
- Skip role tests when env vars missing; skip multi-session tests with explicit reason.
- Use `--workers=1` when running full DS suites (shared app state).

### Step 4 — Run tests

```bash
npx playwright test tests/dsN-<feature>.spec.ts --workers=1 --reporter=line
```

**Unless the user asks to fix failures:** report pass/fail/skip counts only. Do not modify specs or the app.

### Step 5 — File Jira bugs (when requested)

For each **failed** test, create:

1. **Bug** — `createJiraIssue`
   - `projectKey`: `DS`
   - `issueTypeName`: `Bug`
   - `summary`: `{Reporter Name} — {short defect} (DS-N TC-XXX)` — include the reporter's name in every bug title
   - `description`: parent story, test case ID, spec path, steps, expected vs actual, environment
   - `additional_fields`: `{ "priority": { "name": "High" }, "labels": ["program-setup", "playwright", "ds-N"] }`

2. **Sub-task** under the story — `createJiraIssue`
   - `issueTypeName`: `Sub-task`
   - `parent`: `DS-N` (story key)
   - `summary`: `Fix <defect summary> (DS-N-TC-XXX)`
   - Reference the bug key in the description

3. **Link** bug to story — `createIssueLink`
   - `type`: `Relates`
   - `inwardIssue` / `outwardIssue`: story and bug keys

Read `createJiraIssue.json` and `createIssueLink.json` schemas before calling.

## Bug description template

```markdown
## Parent Story
DS-N — <story title>

## Test Case
**DS-N-TC-XXX** — <title>
**Spec:** `tests/dsN-<feature>.spec.ts`

## Environment
- URL: https://test.didaxis.studio/programs
- Browser: Chromium (Playwright)
- User: admin

## Steps to Reproduce
1. ...

## Expected Result
- ...

## Actual Result
- ...
```

## Additional resources

- MCP tool schemas: `mcps/plugin-atlassian-atlassian/tools/`
- Jira site: `https://legionqaschool.atlassian.net`
- Confluence DS space field/UI/validation pages (search via MCP)
