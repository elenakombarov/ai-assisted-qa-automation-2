# TodoMVC — Test Plan: Add, Complete, and Delete Todo Items

| Field | Value |
|-------|-------|
| **Feature** | Todo list — add, complete, and delete items |
| **Application** | React • TodoMVC (Playwright demo) |
| **URL** | `https://demo.playwright.dev/todomvc/#/` |
| **Author** | QA |
| **Last Updated** | 2026-06-25 |

---

## Acceptance Criteria

1. User can add a todo item to the list
2. User can complete an item
3. User can delete an item from the list

---

## Test Case Summary

| ID | Title | Group | Priority |
|----|-------|-------|----------|
| TC-001 | Add a single todo item to the list | Positive | High |
| TC-002 | Add multiple todo items sequentially | Positive | High |
| TC-003 | Mark a todo item as complete | Positive | High |
| TC-004 | Delete a todo item from the list | Positive | High |
| TC-005 | Complete one item while others remain active | Positive | Medium |
| TC-006 | Delete one item from a list of multiple todos | Positive | Medium |
| TC-007 | Delete a completed todo item | Positive | Medium |
| TC-008 | Empty todo is not added when pressing Enter | Negative | High |
| TC-009 | Whitespace-only input is not added as a todo | Negative | High |
| TC-010 | Whitespace-only submission does not affect existing todos | Negative | Medium |
| TC-011 | Delete button is not available when list is empty | Negative | Medium |
| TC-012 | Completing a todo does not remove it from the All view | Negative | Low |
| TC-013 | Trim leading and trailing whitespace when adding a todo | Edge | Medium |
| TC-014 | Todo text with special characters is stored and displayed | Edge | Medium |
| TC-015 | Todo text with Unicode and emoji is stored and displayed | Edge | Low |
| TC-016 | Add two todos with identical text | Edge | Medium |
| TC-017 | Very long todo text (500 characters) is accepted and displayed | Edge | Low |
| TC-018 | Rapid double Enter does not duplicate the same todo | Edge | Medium |
| TC-019 | Uncomplete a previously completed todo | Edge | Medium |
| TC-020 | Counter updates correctly when adding, completing, and deleting | Edge | High |
| TC-021 | Footer is hidden when the list is empty | Edge | Low |
| TC-022 | Todos persist in localStorage after page reload | Edge | Medium |

---

## Positive Flows

### TC-001 — Add a single todo item to the list

| Field | Value |
|-------|-------|
| **ID** | TC-001 |
| **Priority** | High |

**Preconditions**

- Browser is open.
- User navigates to `https://demo.playwright.dev/todomvc/#/`.
- Page heading displays **todos**.
- The **What needs to be done?** input field is visible and empty.
- The todo list is empty (no list items with a **Toggle Todo** checkbox).

**Steps**

1. Click the **What needs to be done?** input field.
2. Type `Buy groceries`.
3. Press **Enter**.

**Expected Result**

- `Buy groceries` appears in the todo list as an active (unchecked) item.
- The **Toggle Todo** checkbox next to `Buy groceries` is unchecked.
- The **What needs to be done?** input field is cleared.
- The footer shows **1 item left**.
- Filter links **All**, **Active**, and **Completed** become visible.

---

### TC-002 — Add multiple todo items sequentially

| Field | Value |
|-------|-------|
| **ID** | TC-002 |
| **Priority** | High |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Type `Buy milk` into **What needs to be done?** and press **Enter**.
2. Observe the list and footer counter.
3. Type `Walk the dog` into **What needs to be done?** and press **Enter**.
4. Observe the list and footer counter.
5. Type `Finish report` into **What needs to be done?** and press **Enter**.
6. Observe the list and footer counter.

**Expected Result**

- After step 1: list shows `Buy milk`; footer shows **1 item left**.
- After step 3: list shows `Buy milk` and `Walk the dog` in that order; footer shows **2 items left**.
- After step 5: list shows `Buy milk`, `Walk the dog`, and `Finish report` in that order; footer shows **3 items left**.
- All three items have unchecked **Toggle Todo** checkboxes.

---

### TC-003 — Mark a todo item as complete

| Field | Value |
|-------|-------|
| **ID** | TC-003 |
| **Priority** | High |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- Todo `Buy groceries` exists in the list and is active (unchecked).

**Steps**

1. Locate the list item labeled `Buy groceries`.
2. Click the **Toggle Todo** checkbox next to `Buy groceries`.
3. Observe the item state, footer counter, and footer actions.

**Expected Result**

- The **Toggle Todo** checkbox for `Buy groceries` is checked.
- `Buy groceries` remains visible in the list with completed styling (strikethrough).
- The footer shows **0 items left**.
- The **Clear completed** button is visible in the footer.

---

### TC-004 — Delete a todo item from the list

| Field | Value |
|-------|-------|
| **ID** | TC-004 |
| **Priority** | High |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- Todo `Task to delete` exists in the list.
- Footer shows **1 item left**.

**Steps**

1. Hover over the list item labeled `Task to delete`.
2. Click the delete button (×) that appears on the row.
3. Observe the list and footer.

**Expected Result**

- `Task to delete` is no longer visible in the list.
- The todo list is empty (zero items with **Toggle Todo** checkboxes).
- The footer (counter, filters, **Clear completed**) is hidden.

---

### TC-005 — Complete one item while others remain active

| Field | Value |
|-------|-------|
| **ID** | TC-005 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- Todos `Buy milk`, `Walk the dog`, and `Finish report` exist and are all active.
- Footer shows **3 items left**.

**Steps**

1. Click the **Toggle Todo** checkbox next to `Walk the dog`.
2. Verify the state of all three todos and the footer counter.

**Expected Result**

- `Walk the dog` is checked (completed).
- `Buy milk` and `Finish report` remain unchecked (active).
- All three labels are still visible in the list.
- Footer shows **2 items left**.

---

### TC-006 — Delete one item from a list of multiple todos

| Field | Value |
|-------|-------|
| **ID** | TC-006 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- Todos `Task 1`, `Task 2`, and `Task 3` exist and are active.
- Footer shows **3 items left**.

**Steps**

1. Hover over `Task 2`.
2. Click the delete button (×) for `Task 2`.
3. Observe the remaining list items and footer counter.

**Expected Result**

- `Task 2` is no longer visible.
- `Task 1` and `Task 3` remain visible in their original order.
- Footer shows **2 items left**.

---

### TC-007 — Delete a completed todo item

| Field | Value |
|-------|-------|
| **ID** | TC-007 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- Todo `Done task` exists and is marked complete (checked).
- Footer shows **0 items left**.
- **Clear completed** button is visible.

**Steps**

1. Hover over the completed list item labeled `Done task`.
2. Click the delete button (×) for `Done task`.
3. Observe the list and footer.

**Expected Result**

- `Done task` is removed from the list.
- The list is empty.
- The footer is hidden.
- **Clear completed** button is no longer visible.

---

## Negative Flows

### TC-008 — Empty todo is not added when pressing Enter

| Field | Value |
|-------|-------|
| **ID** | TC-008 |
| **Priority** | High |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.
- **What needs to be done?** input is empty.

**Steps**

1. Click the **What needs to be done?** input field without typing any text.
2. Press **Enter**.
3. Observe the list and footer.

**Expected Result**

- No todo items appear in the list.
- The footer is not visible.
- The input field remains empty and usable.

---

### TC-009 — Whitespace-only input is not added as a todo

| Field | Value |
|-------|-------|
| **ID** | TC-009 |
| **Priority** | High |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Type three spaces (`   `) into **What needs to be done?**.
2. Press **Enter**.
3. Observe the list and footer.

**Expected Result**

- No todo item is created.
- The list remains empty.
- The footer is not visible.

---

### TC-010 — Whitespace-only submission does not affect existing todos

| Field | Value |
|-------|-------|
| **ID** | TC-010 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- Todo `Buy groceries` exists in the list.
- Footer shows **1 item left**.

**Steps**

1. Type five spaces (`     `) into **What needs to be done?**.
2. Press **Enter**.
3. Observe the list and footer counter.

**Expected Result**

- The list still contains only `Buy groceries`.
- No blank or whitespace-only todo is added.
- Footer still shows **1 item left**.

---

### TC-011 — Delete button is not available when list is empty

| Field | Value |
|-------|-------|
| **ID** | TC-011 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Confirm there are no list items with **Toggle Todo** checkboxes.
2. Attempt to locate any delete button (×) on the page.

**Expected Result**

- No delete buttons are visible or interactable.
- The footer is not visible.
- No delete action can be performed.

---

### TC-012 — Completing a todo does not remove it from the All view

| Field | Value |
|-------|-------|
| **ID** | TC-012 |
| **Priority** | Low |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- Todo `Buy groceries` exists and is active.
- **All** filter link is selected (default view).

**Steps**

1. Click the **Toggle Todo** checkbox next to `Buy groceries`.
2. Observe whether `Buy groceries` is still present in the list under the **All** filter.

**Expected Result**

- `Buy groceries` remains visible in the list (not deleted).
- The checkbox is checked, indicating completed state.
- Completing an item is distinct from deleting it.

---

## Edge Cases

### TC-013 — Trim leading and trailing whitespace when adding a todo

| Field | Value |
|-------|-------|
| **ID** | TC-013 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Type `  Todo with spaces  ` (two leading and two trailing spaces) into **What needs to be done?**.
2. Press **Enter**.
3. Observe the displayed label in the list.

**Expected Result**

- The list shows `Todo with spaces` without leading or trailing spaces.
- Footer shows **1 item left**.
- Stored value in the UI matches the trimmed text exactly.

---

### TC-014 — Todo text with special characters is stored and displayed

| Field | Value |
|-------|-------|
| **ID** | TC-014 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Type `Pay rent — $1,200 (due 6/30)` into **What needs to be done?**.
2. Press **Enter**.
3. Observe the list item label.

**Expected Result**

- The list displays `Pay rent — $1,200 (due 6/30)` exactly.
- Special characters (em dash, dollar sign, comma, parentheses) render correctly.
- No broken HTML or script execution occurs.

---

### TC-015 — Todo text with Unicode and emoji is stored and displayed

| Field | Value |
|-------|-------|
| **ID** | TC-015 |
| **Priority** | Low |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Type `買い物 🛒` into **What needs to be done?**.
2. Press **Enter**.
3. Reload the page.
4. Observe the list item label.

**Expected Result**

- Before and after reload, the list shows `買い物 🛒`.
- Unicode and emoji characters display correctly.

---

### TC-016 — Add two todos with identical text

| Field | Value |
|-------|-------|
| **ID** | TC-016 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Type `Buy milk` into **What needs to be done?** and press **Enter**.
2. Type `Buy milk` into **What needs to be done?** and press **Enter** again.
3. Count the list items labeled `Buy milk`.

**Expected Result**

- Two separate todo rows both labeled `Buy milk` exist in the list.
- Footer shows **2 items left**.
- Each row has its own independent **Toggle Todo** checkbox and delete button.

---

### TC-017 — Very long todo text (500 characters) is accepted and displayed

| Field | Value |
|-------|-------|
| **ID** | TC-017 |
| **Priority** | Low |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Type a string of 500 letter `A` characters into **What needs to be done?**.
2. Press **Enter**.
3. Observe the list item display.
4. Click the **Toggle Todo** checkbox for the long item.
5. Hover over the item and click the delete button (×).

**Expected Result**

- The full 500-character label appears in the list without truncation on add.
- The item can be marked complete without UI breakage.
- The item can be deleted successfully.
- After deletion, the footer is hidden.

---

### TC-018 — Rapid double Enter does not duplicate the same todo

| Field | Value |
|-------|-------|
| **ID** | TC-018 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Type `Double Enter Test` into **What needs to be done?**.
2. Press **Enter** twice in quick succession without typing again.
3. Count list items labeled `Double Enter Test`.

**Expected Result**

- Exactly one todo labeled `Double Enter Test` exists.
- Footer shows **1 item left**.
- The input field is empty after the first **Enter**; the second **Enter** on an empty field does not create a duplicate or blank row.

---

### TC-019 — Uncomplete a previously completed todo

| Field | Value |
|-------|-------|
| **ID** | TC-019 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- Todo `Buy groceries` exists and is marked complete.
- Footer shows **0 items left**.
- **Clear completed** button is visible.

**Steps**

1. Click the **Toggle Todo** checkbox next to `Buy groceries` again.
2. Observe item state, counter, and footer actions.

**Expected Result**

- `Buy groceries` returns to active state (checkbox unchecked, no strikethrough).
- Footer shows **1 item left**.
- **Clear completed** button is no longer visible.

---

### TC-020 — Counter updates correctly when adding, completing, and deleting

| Field | Value |
|-------|-------|
| **ID** | TC-020 |
| **Priority** | High |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Add `Buy milk` and press **Enter**; note the footer counter.
2. Add `Walk the dog` and press **Enter**; note the footer counter.
3. Click the **Toggle Todo** checkbox next to `Buy milk`; note the footer counter.
4. Hover over `Walk the dog` and click its delete button (×); note the footer counter.
5. Verify `Buy milk` is still in the list.

**Expected Result**

- After step 1: footer shows **1 item left**.
- After step 2: footer shows **2 items left**.
- After step 3: footer shows **1 item left**.
- After step 4: footer shows **0 items left**.
- `Buy milk` remains in the list as a completed item.

---

### TC-021 — Footer is hidden when the list is empty

| Field | Value |
|-------|-------|
| **ID** | TC-021 |
| **Priority** | Low |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.

**Steps**

1. Confirm the list is empty; observe footer visibility.
2. Add `First task` and press **Enter**; observe footer visibility.
3. Hover over `First task` and click its delete button (×); observe footer visibility.

**Expected Result**

- Step 1: footer with counter and filters is not visible.
- Step 2: footer shows **1 item left**; **All**, **Active**, and **Completed** links are visible.
- Step 3: footer is hidden again.

---

### TC-022 — Todos persist in localStorage after page reload

| Field | Value |
|-------|-------|
| **ID** | TC-022 |
| **Priority** | Medium |

**Preconditions**

- User is on `https://demo.playwright.dev/todomvc/#/`.
- The todo list is empty.

**Steps**

1. Add `Persistent 1`, `Persistent 2`, and `Persistent 3` (one at a time, pressing **Enter** after each).
2. Click the **Toggle Todo** checkbox next to `Persistent 2`.
3. Reload the browser page (`F5` or refresh).
4. Observe the list items, completion state, and footer counter.

**Expected Result**

- All three todos are restored: `Persistent 1`, `Persistent 2`, and `Persistent 3`.
- `Persistent 2` is marked complete (checked).
- Footer shows **2 items left**.

---

## Traceability Matrix

| Acceptance Criterion | Covered By |
|---------------------|------------|
| User can add a todo item to the list | TC-001, TC-002 |
| User can complete an item | TC-003, TC-005 |
| User can delete an item from the list | TC-004, TC-006, TC-007 |

---

## Ambiguities and Gaps in Acceptance Criteria

1. **Target application not specified** — The acceptance criteria describe generic todo behavior but do not name the application URL, page title (`React • TodoMVC`), or input placeholder (`What needs to be done?`). This plan assumes the Playwright TodoMVC demo at `https://demo.playwright.dev/todomvc/#/`.

2. **Complete vs delete** — "Complete an item" does not state whether completed items remain visible, move to a separate section, or are hidden by default. TodoMVC keeps completed items in the list under the **All** filter with strikethrough styling (TC-012).

3. **Uncomplete / toggle behavior** — No criteria for reversing completion (unchecking a completed item). Covered as edge case TC-019 but outside explicit AC scope.

4. **Delete interaction pattern** — Criteria do not specify how delete is triggered. TodoMVC requires hovering over a row to reveal a × delete button; keyboard-only or touch delete paths are undefined.

5. **Empty and whitespace validation** — No explicit rule that empty or whitespace-only input is rejected. TodoMVC trims input and rejects empty strings after trim (TC-008, TC-009, TC-013).

6. **Maximum todo length** — No maximum length is defined. TC-017 probes with 500 characters; whether a hard limit exists is unknown.

7. **Duplicate todo labels** — Unclear whether two todos with the same text are allowed or should be deduplicated. TodoMVC allows duplicates (TC-016); product intent is unspecified.

8. **Persistence** — ACs do not mention localStorage, session storage, or server sync. Persistence after reload is unspecified (TC-022 covers observed demo behavior).

9. **Filtering (All / Active / Completed)** — Not in scope of the three ACs but present in TodoMVC. Behavior when completing or deleting while on **Active** or **Completed** filters is undefined.

10. **Bulk operations** — **Mark all as complete** (toggle-all checkbox) and **Clear completed** exist in TodoMVC but are not mentioned in the ACs.

11. **Editing todos** — Double-click to edit, **Escape** to cancel, and delete-on-empty-edit are not covered by the ACs.

12. **Accessibility** — No requirements for keyboard-only add/complete/delete, focus management, or screen reader labels (e.g., **Toggle Todo**).

13. **Counter copy** — Expected footer text (`N item left` vs `N items left`) is not specified in the ACs.

14. **Visual completion indicator** — ACs do not define how users recognize a completed item (checkbox only, strikethrough, color change, or combination).

15. **Error handling** — No criteria for localStorage quota exceeded, private browsing restrictions, or concurrent-tab conflicts.

16. **Delete scope** — ACs say "delete an item" but do not clarify whether deleting the last active item while completed items remain should hide the footer or keep **Clear completed** visible.
