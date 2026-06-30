# TodoMVC Playwright Test Result Report

| Field | Value |
|-------|-------|
| **Application** | React • TodoMVC (Playwright demo) |
| **URL** | `https://demo.playwright.dev/todomvc/#/` |
| **Test file** | `tests/todo.spec.ts` |
| **Test plan** | `TODO_MVC/test_plan.md` |
| **Run date** | 2026-06-26 23:51:22 UTC |
| **Playwright version** | 1.61.0 |
| **Browser** | Chromium |
| **Workers** | 4 |
| **Trace mode** | `on` (full trace for every test) |
| **Total duration** | 42.3s |

---

## Executive Summary

| Metric | Count |
|--------|------:|
| **Total tests** | 22 |
| **Passed** | 22 |
| **Failed** | 0 |
| **Skipped** | 0 |
| **Flaky** | 0 |

**Overall result:** **All tests passed.**

All 22 test cases from the test plan (TC-001 through TC-022) were executed against the TodoMVC demo application. Each test ran independently with a clean `localStorage` state. Playwright traces were captured for every test run.

---

## Results by Group

| Group | Tests | Passed | Failed |
|-------|------:|-------:|-------:|
| Positive flows | 7 | 7 | 0 |
| Negative flows | 5 | 5 | 0 |
| Edge flows | 10 | 10 | 0 |

---

## Detailed Test Results

| ID | Title | Group | Priority | Status | Duration | Trace |
|----|-------|-------|----------|--------|----------|-------|
| TC-001 | Add a single todo item to the list | Positive | High | ✅ Passed | 9.99s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-022f3-ingle-todo-item-to-the-list-chromium/trace.zip) |
| TC-002 | Add multiple todo items sequentially | Positive | High | ✅ Passed | 10.90s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-17f70-ple-todo-items-sequentially-chromium/trace.zip) |
| TC-003 | Mark a todo item as complete | Positive | High | ✅ Passed | 10.58s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-defc3-ark-a-todo-item-as-complete-chromium/trace.zip) |
| TC-004 | Delete a todo item from the list | Positive | High | ✅ Passed | 10.27s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-6b37b-e-a-todo-item-from-the-list-chromium/trace.zip) |
| TC-005 | Complete one item while others remain active | Positive | Medium | ✅ Passed | 4.48s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-6b28e--while-others-remain-active-chromium/trace.zip) |
| TC-006 | Delete one item from a list of multiple todos | Positive | Medium | ✅ Passed | 3.55s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-85c2f-om-a-list-of-multiple-todos-chromium/trace.zip) |
| TC-007 | Delete a completed todo item | Positive | Medium | ✅ Passed | 3.76s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-5db96-elete-a-completed-todo-item-chromium/trace.zip) |
| TC-008 | Empty todo is not added when pressing Enter | Negative | High | ✅ Passed | 2.11s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-97aed-t-added-when-pressing-Enter-chromium/trace.zip) |
| TC-009 | Whitespace-only input is not added as a todo | Negative | High | ✅ Passed | 1.84s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-b9c85-nput-is-not-added-as-a-todo-chromium/trace.zip) |
| TC-010 | Whitespace-only submission does not affect existing todos | Negative | Medium | ✅ Passed | 1.60s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-cff6f-s-not-affect-existing-todos-chromium/trace.zip) |
| TC-011 | Delete button is not available when list is empty | Negative | Medium | ✅ Passed | 1.30s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-ee869-vailable-when-list-is-empty-chromium/trace.zip) |
| TC-012 | Completing a todo does not remove it from the All view | Negative | Low | ✅ Passed | 3.23s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-01f2d-remove-it-from-the-All-view-chromium/trace.zip) |
| TC-013 | Trim leading and trailing whitespace when adding a todo | Edge | Medium | ✅ Passed | 2.50s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-9f495-itespace-when-adding-a-todo-chromium/trace.zip) |
| TC-014 | Todo text with special characters is stored and displayed | Edge | Medium | ✅ Passed | 2.72s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-26323-ers-is-stored-and-displayed-chromium/trace.zip) |
| TC-015 | Todo text with Unicode and emoji is stored and displayed | Edge | Low | ✅ Passed | 3.70s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-31f2c-oji-is-stored-and-displayed-chromium/trace.zip) |
| TC-016 | Add two todos with identical text | Edge | Medium | ✅ Passed | 5.76s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-83fdd-o-todos-with-identical-text-chromium/trace.zip) |
| TC-017 | Very long todo text (500 characters) is accepted and displayed | Edge | Low | ✅ Passed | 5.93s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-5bc4b-s-is-accepted-and-displayed-chromium/trace.zip) |
| TC-018 | Rapid double Enter does not duplicate the same todo | Edge | Medium | ✅ Passed | 5.68s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-85477-not-duplicate-the-same-todo-chromium/trace.zip) |
| TC-019 | Uncomplete a previously completed todo | Edge | Medium | ✅ Passed | 6.13s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-4e006-a-previously-completed-todo-chromium/trace.zip) |
| TC-020 | Counter updates correctly when adding, completing, and deleting | Edge | High | ✅ Passed | 4.79s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-fd83f-ing-completing-and-deleting-chromium/trace.zip) |
| TC-021 | Footer is hidden when the list is empty | Edge | Low | ✅ Passed | 2.49s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-a60fa-dden-when-the-list-is-empty-chromium/trace.zip) |
| TC-022 | Todos persist in localStorage after page reload | Edge | Medium | ✅ Passed | 3.69s | [trace.zip](test-results/todo-TodoMVC---Add-Complet-1c940-alStorage-after-page-reload-chromium/trace.zip) |

---

## Trace Viewer Instructions

Each test produced a Playwright trace (`trace.zip`) under `test-results/`. Traces include DOM snapshots, network activity, console logs, and step-by-step actions.

### Open a single trace

```bash
npx playwright show-trace test-results/<test-output-folder>/trace.zip
```

### Example — TC-001

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-022f3-ingle-todo-item-to-the-list-chromium/trace.zip
```

### Re-run tests with traces

```bash
npx playwright test tests/todo.spec.ts --trace on
```

### View HTML report (includes trace links)

```bash
npx playwright test tests/todo.spec.ts --trace on --reporter=html
npx playwright show-report
```

---

## Per-Test Trace Details

### TC-001: Add a single todo item to the list

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Positive |
| **Priority** | High |
| **Duration** | 9.99s |
| **Source line** | `tests/todo.spec.ts:53` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-022f3-ingle-todo-item-to-the-list-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-022f3-ingle-todo-item-to-the-list-chromium/trace.zip
```

### TC-002: Add multiple todo items sequentially

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Positive |
| **Priority** | High |
| **Duration** | 10.90s |
| **Source line** | `tests/todo.spec.ts:70` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-17f70-ple-todo-items-sequentially-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-17f70-ple-todo-items-sequentially-chromium/trace.zip
```

### TC-003: Mark a todo item as complete

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Positive |
| **Priority** | High |
| **Duration** | 10.58s |
| **Source line** | `tests/todo.spec.ts:93` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-defc3-ark-a-todo-item-as-complete-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-defc3-ark-a-todo-item-as-complete-chromium/trace.zip
```

### TC-004: Delete a todo item from the list

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Positive |
| **Priority** | High |
| **Duration** | 10.27s |
| **Source line** | `tests/todo.spec.ts:105` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-6b37b-e-a-todo-item-from-the-list-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-6b37b-e-a-todo-item-from-the-list-chromium/trace.zip
```

### TC-005: Complete one item while others remain active

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Positive |
| **Priority** | Medium |
| **Duration** | 4.48s |
| **Source line** | `tests/todo.spec.ts:117` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-6b28e--while-others-remain-active-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-6b28e--while-others-remain-active-chromium/trace.zip
```

### TC-006: Delete one item from a list of multiple todos

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Positive |
| **Priority** | Medium |
| **Duration** | 3.55s |
| **Source line** | `tests/todo.spec.ts:135` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-85c2f-om-a-list-of-multiple-todos-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-85c2f-om-a-list-of-multiple-todos-chromium/trace.zip
```

### TC-007: Delete a completed todo item

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Positive |
| **Priority** | Medium |
| **Duration** | 3.76s |
| **Source line** | `tests/todo.spec.ts:150` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-5db96-elete-a-completed-todo-item-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-5db96-elete-a-completed-todo-item-chromium/trace.zip
```

### TC-008: Empty todo is not added when pressing Enter

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Negative |
| **Priority** | High |
| **Duration** | 2.11s |
| **Source line** | `tests/todo.spec.ts:165` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-97aed-t-added-when-pressing-Enter-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-97aed-t-added-when-pressing-Enter-chromium/trace.zip
```

### TC-009: Whitespace-only input is not added as a todo

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Negative |
| **Priority** | High |
| **Duration** | 1.84s |
| **Source line** | `tests/todo.spec.ts:177` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-b9c85-nput-is-not-added-as-a-todo-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-b9c85-nput-is-not-added-as-a-todo-chromium/trace.zip
```

### TC-010: Whitespace-only submission does not affect existing todos

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Negative |
| **Priority** | Medium |
| **Duration** | 1.60s |
| **Source line** | `tests/todo.spec.ts:188` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-cff6f-s-not-affect-existing-todos-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-cff6f-s-not-affect-existing-todos-chromium/trace.zip
```

### TC-011: Delete button is not available when list is empty

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Negative |
| **Priority** | Medium |
| **Duration** | 1.30s |
| **Source line** | `tests/todo.spec.ts:202` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-ee869-vailable-when-list-is-empty-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-ee869-vailable-when-list-is-empty-chromium/trace.zip
```

### TC-012: Completing a todo does not remove it from the All view

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Negative |
| **Priority** | Low |
| **Duration** | 3.23s |
| **Source line** | `tests/todo.spec.ts:210` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-01f2d-remove-it-from-the-All-view-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-01f2d-remove-it-from-the-All-view-chromium/trace.zip
```

### TC-013: Trim leading and trailing whitespace when adding a todo

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Edge |
| **Priority** | Medium |
| **Duration** | 2.50s |
| **Source line** | `tests/todo.spec.ts:221` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-9f495-itespace-when-adding-a-todo-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-9f495-itespace-when-adding-a-todo-chromium/trace.zip
```

### TC-014: Todo text with special characters is stored and displayed

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Edge |
| **Priority** | Medium |
| **Duration** | 2.72s |
| **Source line** | `tests/todo.spec.ts:231` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-26323-ers-is-stored-and-displayed-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-26323-ers-is-stored-and-displayed-chromium/trace.zip
```

### TC-015: Todo text with Unicode and emoji is stored and displayed

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Edge |
| **Priority** | Low |
| **Duration** | 3.70s |
| **Source line** | `tests/todo.spec.ts:241` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-31f2c-oji-is-stored-and-displayed-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-31f2c-oji-is-stored-and-displayed-chromium/trace.zip
```

### TC-016: Add two todos with identical text

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Edge |
| **Priority** | Medium |
| **Duration** | 5.76s |
| **Source line** | `tests/todo.spec.ts:256` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-83fdd-o-todos-with-identical-text-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-83fdd-o-todos-with-identical-text-chromium/trace.zip
```

### TC-017: Very long todo text (500 characters) is accepted and displayed

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Edge |
| **Priority** | Low |
| **Duration** | 5.93s |
| **Source line** | `tests/todo.spec.ts:267` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-5bc4b-s-is-accepted-and-displayed-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-5bc4b-s-is-accepted-and-displayed-chromium/trace.zip
```

### TC-018: Rapid double Enter does not duplicate the same todo

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Edge |
| **Priority** | Medium |
| **Duration** | 5.68s |
| **Source line** | `tests/todo.spec.ts:284` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-85477-not-duplicate-the-same-todo-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-85477-not-duplicate-the-same-todo-chromium/trace.zip
```

### TC-019: Uncomplete a previously completed todo

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Edge |
| **Priority** | Medium |
| **Duration** | 6.13s |
| **Source line** | `tests/todo.spec.ts:297` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-4e006-a-previously-completed-todo-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-4e006-a-previously-completed-todo-chromium/trace.zip
```

### TC-020: Counter updates correctly when adding, completing, and deleting

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Edge |
| **Priority** | High |
| **Duration** | 4.79s |
| **Source line** | `tests/todo.spec.ts:312` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-fd83f-ing-completing-and-deleting-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-fd83f-ing-completing-and-deleting-chromium/trace.zip
```

### TC-021: Footer is hidden when the list is empty

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Edge |
| **Priority** | Low |
| **Duration** | 2.49s |
| **Source line** | `tests/todo.spec.ts:330` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-a60fa-dden-when-the-list-is-empty-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-a60fa-dden-when-the-list-is-empty-chromium/trace.zip
```

### TC-022: Todos persist in localStorage after page reload

| Field | Value |
|-------|-------|
| **Status** | ✅ Passed |
| **Group** | Edge |
| **Priority** | Medium |
| **Duration** | 3.69s |
| **Source line** | `tests/todo.spec.ts:344` |
| **Trace file** | `test-results/todo-TodoMVC---Add-Complet-1c940-alStorage-after-page-reload-chromium/trace.zip` |

**View trace:**

```bash
npx playwright show-trace test-results/todo-TodoMVC---Add-Complet-1c940-alStorage-after-page-reload-chromium/trace.zip
```

---

## Acceptance Criteria Coverage

| Acceptance Criterion | Result | Covered by |
|---------------------|--------|------------|
| User can add a todo item to the list | ✅ Pass | TC-001, TC-002 |
| User can complete an item | ✅ Pass | TC-003, TC-005 |
| User can delete an item from the list | ✅ Pass | TC-004, TC-006, TC-007 |

---

## Environment

| Component | Version / Detail |
|-----------|------------------|
| Node.js | v24.12.0 |
| @playwright/test | 1.61.0 |
| OS | Windows |
| Test runner config | `playwright.config.ts` |

---

*Report generated from `playwright-results.json` after a full test run with `--trace on`.*
