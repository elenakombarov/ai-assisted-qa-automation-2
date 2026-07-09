# Worked Example: DS-2 program list shows stale name after edit

End-to-end walkthrough of the jira-bug-reporter skill after a Playwright failure in `tests/ds2-edit-program.spec.ts`.

## 1. Failure observed

```
Running 1 test using 1 worker

  ✘  1 tests/ds2-edit-program.spec.ts:201:3 › DS-2: Edit Existing Program Details › DS-2-TC-005: Program list updates after renaming (12.4s)

  1) tests/ds2-edit-program.spec.ts:201:3 › DS-2: Edit Existing Program Details › DS-2-TC-005: Program list updates after renaming

    Error: expect(locator).toBeVisible() failed

    Locator: getByText('Renamed Program Alpha', { exact: true })
    Expected: visible
    Received: <element(s) not found>
    Timeout: 10000ms

    Call log:
      - Expect "toBeVisible" with timeout 10000ms
      - waiting for getByText('Renamed Program Alpha', { exact: true })

      215 |     await saveEdit(page);
      216 |     await goToProgramsPage(page);
    > 217 |     await expect(page.getByText('Renamed Program Alpha', { exact: true })).toBeVisible();
          |                                                                              ^
      218 |   });

    attachment #1: screenshot (image/png) ───────────────────────────────────────
    test-results/ds2-edit-program-DS-2-Edi-abc12-DS-2-TC-005-Program-list/test-failed-1.png
```

## 2. Root cause analysis

- **Parent story:** `DS-2` — from `test.describe('DS-2: Edit Existing Program Details')` and `features/DS-2.feature`
- **Test intent:** After saving an edited program name, the Programs list should show the new name without a full page refresh
- **Likely defect:** UI list is not re-fetched or re-rendered after the edit modal closes; the row still shows the old name
- **Not a setup issue:** Login and navigation succeed; failure is an assertion on post-save UI state

## 3. Reproduce before filing

```bash
npx playwright test tests/ds2-edit-program.spec.ts -g "DS-2-TC-005: Program list updates after renaming" --workers=1
```

Second run confirms the same failure (not flaky):

```bash
npx playwright test tests/ds2-edit-program.spec.ts -g "DS-2-TC-005: Program list updates after renaming" --workers=1
```

Collect screenshot paths:

```bash
node scripts/collect-failure-screenshots.mjs --latest
# test-results/ds2-edit-program-DS-2-Edi-abc12-DS-2-TC-005-Program-list/test-failed-1.png
```

Optional archive:

```bash
node scripts/archive-failure-evidence.mjs DS-2 --latest
```

## 4. Duplicate check

Search Jira before creating:

```
parent = DS-2 AND issuetype = Sub-task AND text ~ "stale" AND text ~ "program list"
```

No open match → proceed with new sub-task.

If `DS-173` already existed with summary `[Composer] Program list shows stale data after editing program name`, attach new screenshots instead:

```bash
node scripts/jira-attach-screenshots.mjs DS-173 $(node scripts/collect-failure-screenshots.mjs --latest)
```

## 5. Draft bug report

**Severity:** High  
**Priority:** High

```markdown
**Title:** Program list shows stale data after editing program name

**Playwright Error:**
```
Error: expect(locator).toBeVisible() failed
Locator: getByText('Renamed Program Alpha', { exact: true })
Expected: visible
Received: <element(s) not found>
Timeout: 10000ms
```

**Steps to Reproduce:**
1. Log in as admin at https://test.didaxis.studio/login
2. Navigate to Programs page
3. Create a program named "Original Program Alpha" (or use an existing test program)
4. Click Edit on that program row
5. Change Program Name to "Renamed Program Alpha"
6. Click Save
7. Observe the Programs list without refreshing the page

**Expected Result:** The program row displays "Renamed Program Alpha" immediately after save.

**Actual Result:** The list still shows "Original Program Alpha" (or the renamed text is missing). Playwright cannot find `Renamed Program Alpha` within 10s.

**Environment:**
- URL: https://test.didaxis.studio
- Browser: Chromium (Playwright)
- Account: admin@didaxis.studio

**Evidence:**
- Screenshot: test-results/ds2-edit-program-DS-2-Edi-abc12-DS-2-TC-005-Program-list/test-failed-1.png (attached to ticket)
- Trace: test-results/ds2-edit-program-DS-2-Edi-abc12-DS-2-TC-005-Program-list/trace.zip (if retry occurred)

**Linked Story:** DS-2
```

## 6. Create Jira sub-task via MCP

Resolve `cloudId` with `getAccessibleAtlassianResources`, then call `createJiraIssue`:

```json
{
  "cloudId": "legionqaschool.atlassian.net",
  "projectKey": "DS",
  "issueTypeName": "Sub-task",
  "parent": "DS-2",
  "summary": "[Composer] Program list shows stale data after editing program name",
  "description": "<full bug report markdown from step 5>",
  "additional_fields": {
    "priority": { "name": "High" }
  }
}
```

Confirm with `getJiraIssue` → returns `DS-173`.

## 7. Attach screenshots (required)

MCP cannot upload files. Run after issue creation:

```bash
node scripts/jira-attach-screenshots.mjs DS-173 $(node scripts/collect-failure-screenshots.mjs --latest)
```

Verify exit code 0. Workflow is **not** complete until upload succeeds.

## 8. Report back to user

```
Created DS-173 as sub-task of DS-2
https://legionqaschool.atlassian.net/browse/DS-173

Summary: [Composer] Program list shows stale data after editing program name
Priority: High
Screenshot attached: test-failed-1.png
```

## Checklist (skill completion criteria)

- [x] Failure reproduced at least twice
- [x] Parent story DS-2 resolved from test.describe / feature file
- [x] Duplicate Jira search performed
- [x] Exact Playwright error included in description
- [x] Summary prefixed with `[Composer]`
- [x] Sub-task created under DS-2
- [x] Screenshot uploaded via `jira-attach-screenshots.mjs` (not description-only paths)
