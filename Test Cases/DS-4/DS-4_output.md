# DS-4 — Test Plan: Delete Program with Confirmation

| Field | Value |
|-------|-------|
| **Feature** | Delete program with confirmation |
| **Ticket** | DS-4 |
| **Author** | QA |
| **Last Updated** | 2026-06-22 |

---

## Test Case Summary

| ID | Title | Group | Priority |
|----|-------|-------|----------|
| DS-4-TC-001 | Delete program with confirmation | Positive | P1 |
| DS-4-TC-002 | Cancel program deletion | Positive | P1 |
| DS-4-TC-003 | Program list updates without page refresh after delete | Positive | P2 |
| DS-4-TC-004 | Delete program with special characters in name | Positive | P2 |
| DS-4-TC-005 | Delete program with maximum length name | Positive | P2 |
| DS-4-TC-006 | Delete program with Unicode and emoji in name | Positive | P3 |
| DS-4-TC-007 | Confirmation dialog displays program name | Positive | P2 |
| DS-4-TC-008 | Non-admin user cannot delete a program | Negative | P1 |
| DS-4-TC-009 | Unauthenticated user cannot delete a program | Negative | P1 |
| DS-4-TC-010 | Delete fails gracefully on server error | Negative | P1 |
| DS-4-TC-011 | Cannot delete program already deleted by another user | Negative | P2 |
| DS-4-TC-012 | Dismiss confirmation dialog via Esc or close control | Negative | P2 |
| DS-4-TC-013 | Delete blocked when program has dependent curriculum | Negative | P2 |
| DS-4-TC-014 | Rapid double-click on confirm does not cause errors | Edge | P2 |
| DS-4-TC-015 | Delete last remaining program in list | Edge | P2 |
| DS-4-TC-016 | Delete one program when multiple programs exist | Edge | P2 |
| DS-4-TC-017 | Delete program with duplicate display name in list | Edge | P3 |
| DS-4-TC-018 | Delete program with HTML/script characters in name | Edge | P1 |
| DS-4-TC-019 | Delete program with minimum length name (1 character) | Edge | P3 |
| DS-4-TC-020 | Re-open delete dialog after cancel | Edge | P3 |
| DS-4-TC-021 | Confirm deletion via keyboard | Edge | P3 |
| DS-4-TC-022 | Delete program with leading/trailing whitespace in name | Edge | P2 |

---

## Positive Flows

### DS-4-TC-001 — Delete program with confirmation

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; program "Test Program" exists and appears on the Programs page |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete program with confirmation
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list
```

**Expected Result**

- Confirmation dialog appears before deletion proceeds.
- After confirmation, program is permanently removed from the list (per deletion policy).
- No accidental deletion occurs without explicit confirmation.

---

### DS-4-TC-002 — Cancel program deletion

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; at least one program exists on the Programs page |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Cancel program deletion
    Given I am logged in as admin
    And I am on the Programs page
    And a program exists in the list
    When I click the delete icon for a program
    Then I see a confirmation dialog
    When I click Cancel
    Then the program still exists in the list
```

**Expected Result**

- Program is not deleted when Cancel is clicked.
- Dialog closes and list remains unchanged.
- User can continue working with the program.

---

### DS-4-TC-003 — Program list updates without page refresh after delete

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program "No Refresh Delete Test" exists |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: List updates in place after deletion
    Given I am logged in as admin
    And a program "No Refresh Delete Test" exists
    When I click the delete icon for "No Refresh Delete Test"
    And I confirm deletion
    Then "No Refresh Delete Test" is removed from the program list
    And I have not reloaded the page
```

**Expected Result**

- List reflects deletion immediately without full page reload.

---

### DS-4-TC-004 — Delete program with special characters in name

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program "Informatique & IA - Niveau 2" exists |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete program with special characters in name
    Given I am logged in as admin
    And a program "Informatique & IA - Niveau 2" exists
    When I click the delete icon for "Informatique & IA - Niveau 2"
    And I confirm deletion
    Then "Informatique & IA - Niveau 2" is removed from the program list
```

**Expected Result**

- Special characters in the name do not break delete flow or confirmation matching.
- Program is removed successfully.

---

### DS-4-TC-005 — Delete program with maximum length name

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive / Boundary |
| **Preconditions** | User is logged in as admin; program with a 255-character name exists (`MAX_NAME_LENGTH` placeholder) |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete program with maximum length name
    Given I am logged in as admin
    And a program with a name of exactly 255 characters exists
    When I click the delete icon for that program
    And I confirm deletion
    Then the program is removed from the program list
```

**Expected Result**

- Long names display correctly in confirmation dialog (or truncated with full name identifiable).
- Deletion completes successfully.

---

### DS-4-TC-006 — Delete program with Unicode and emoji in name

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program "プログラム 🎓 2026" exists |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete program with Unicode and emoji name
    Given I am logged in as admin
    And a program "プログラム 🎓 2026" exists
    When I click the delete icon for "プログラム 🎓 2026"
    And I confirm deletion
    Then "プログラム 🎓 2026" is removed from the program list
```

**Expected Result**

- Unicode and emoji render correctly in list, dialog, and delete targeting.
- Program is removed without encoding errors.

---

### DS-4-TC-007 — Confirmation dialog displays program name

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program "Test Program" exists |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Confirmation dialog identifies program being deleted
    Given I am logged in as admin
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    And the dialog references "Test Program" by name
```

**Expected Result**

- User can clearly identify which program will be deleted before confirming.
- Reduces risk of accidental deletion of the wrong program.

---

## Negative Flows

### DS-4-TC-008 — Non-admin user cannot delete a program

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in with a non-admin role; at least one program exists |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Non-admin cannot delete a program
    Given I am logged in as a non-admin user
    And I am on the Programs page
    And a program "Test Program" exists
    Then I do not see a delete icon for "Test Program"
```

**Expected Result**

- Delete control is hidden or disabled for non-admin users.
- Direct delete API/URL access returns 403 or equivalent.

---

### DS-4-TC-009 — Unauthenticated user cannot delete a program

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | No active user session; a program exists in the system |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Unauthenticated user cannot delete a program
    Given I am not logged in
    When I attempt to delete a program via direct API or URL
    Then I am denied access
    And the program is not deleted
```

**Expected Result**

- Deletion requires authentication.
- Unauthenticated requests are rejected.

---

### DS-4-TC-010 — Delete fails gracefully on server error

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; program "Test Program" exists; server configured to return error on delete |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Server error during deletion
    Given I am logged in as admin
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion
    And the server returns an error
    Then I see an error message indicating deletion failed
    And "Test Program" still exists in the program list
```

**Expected Result**

- User is informed of failure.
- Program remains in list; no partial or inconsistent state.

---

### DS-4-TC-011 — Cannot delete program already deleted by another user

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; confirmation dialog is open; program was deleted by another session before confirm |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Confirm deletion of already-deleted program
    Given I am logged in as admin
    And I clicked the delete icon for "Test Program"
    And I see the confirmation dialog
    And "Test Program" was deleted by another admin
    When I confirm deletion
    Then I see an error indicating the program no longer exists
    And the program list does not show "Test Program"
```

**Expected Result**

- Stale delete action handled with clear feedback (404 or equivalent).
- No application crash or duplicate delete side effects.

---

### DS-4-TC-012 — Dismiss confirmation dialog via Esc or close control

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; program "Test Program" exists; confirmation dialog is open |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Dismiss dialog without deleting
    Given I am logged in as admin
    And a program "Test Program" exists
    And I see the confirmation dialog for "Test Program"
    When I press Esc
    Or I click the dialog close control
    Then the confirmation dialog closes
    And "Test Program" still exists in the program list
```

**Expected Result**

- Dismissing dialog behaves same as Cancel — no deletion occurs.

---

### DS-4-TC-013 — Delete blocked when program has dependent curriculum

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; program "Test Program" exists with linked curriculum or child records |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Block deletion when dependencies exist
    Given I am logged in as admin
    And a program "Test Program" exists with linked curriculum
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then deletion is blocked or a warning requires additional confirmation
    And "Test Program" still exists in the program list
```

**Expected Result**

- Data integrity preserved when dependencies exist (behavior per product rules).
- User receives clear explanation if delete is blocked.

---

## Edge Cases

### DS-4-TC-014 — Rapid double-click on confirm does not cause errors

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program "Double Click Delete Test" exists; confirmation dialog is open |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Prevent duplicate delete on double-click confirm
    Given I am logged in as admin
    And a program "Double Click Delete Test" exists
    And I see the confirmation dialog for "Double Click Delete Test"
    When I double-click the confirm button quickly
    Then "Double Click Delete Test" is removed from the program list exactly once
    And no error occurs
```

**Expected Result**

- Confirm button disabled or request idempotent after first click.
- No duplicate API calls causing server errors.

---

### DS-4-TC-015 — Delete last remaining program in list

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; exactly one program exists on the Programs page |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete the only program in the list
    Given I am logged in as admin
    And only one program "Sole Program" exists
    When I click the delete icon for "Sole Program"
    And I confirm deletion
    Then "Sole Program" is removed from the program list
    And the program list shows an empty state
```

**Expected Result**

- Empty list state displayed appropriately (empty message, no broken layout).
- User can still create a new program.

---

### DS-4-TC-016 — Delete one program when multiple programs exist

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; programs "Program A", "Program B", and "Program C" exist |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete one program from a multi-item list
    Given I am logged in as admin
    And programs "Program A", "Program B", and "Program C" exist
    When I click the delete icon for "Program B"
    And I confirm deletion
    Then "Program B" is removed from the program list
    And "Program A" and "Program C" remain in the list
```

**Expected Result**

- Only targeted program is deleted.
- Other programs unaffected.

---

### DS-4-TC-017 — Delete program with duplicate display name in list

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; two distinct programs cannot share same name per DS-3 — test uses visually similar names if duplicates disallowed |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete correct program when names are visually similar
    Given I am logged in as admin
    And programs "Web Development 2026" and "Web Development 2026 " exist
    When I click the delete icon for "Web Development 2026"
    And I confirm deletion
    Then "Web Development 2026" is removed from the program list
    And "Web Development 2026 " remains if it is a distinct record
```

**Expected Result**

- Delete targets the correct program record by ID, not display string alone.
- If duplicate names are impossible per DS-3, test validates delete icon is tied to unique row.

---

### DS-4-TC-018 — Delete program with HTML/script characters in name

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Edge / Security |
| **Preconditions** | User is logged in as admin; program "<script>alert('xss')</script>" exists as stored literal name |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete program with HTML in name safely
    Given I am logged in as admin
    And a program named "<script>alert('xss')</script>" exists
    When I click the delete icon for that program
    Then I see a confirmation dialog
    And no script executes in the dialog
    When I confirm deletion
    Then the program is removed from the program list
```

**Expected Result**

- Confirmation dialog safely escapes HTML in program name.
- Deletion completes without XSS vulnerability.

---

### DS-4-TC-019 — Delete program with minimum length name (1 character)

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge / Boundary |
| **Preconditions** | User is logged in as admin; program "A" exists |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete program with single-character name
    Given I am logged in as admin
    And a program "A" exists
    When I click the delete icon for "A"
    And I confirm deletion
    Then "A" is removed from the program list
```

**Expected Result**

- Minimum-length names are handled correctly in delete flow.

---

### DS-4-TC-020 — Re-open delete dialog after cancel

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program "Test Program" exists |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete after cancelling previous attempt
    Given I am logged in as admin
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I click Cancel
    And I click the delete icon for "Test Program" again
    And I confirm deletion
    Then "Test Program" is removed from the program list
```

**Expected Result**

- Cancel does not lock or corrupt subsequent delete attempts.
- Second delete flow works normally.

---

### DS-4-TC-021 — Confirm deletion via keyboard

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program "Keyboard Delete Test" exists; confirmation dialog is open |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Confirm deletion using keyboard
    Given I am logged in as admin
    And a program "Keyboard Delete Test" exists
    When I click the delete icon for "Keyboard Delete Test"
    And I see the confirmation dialog
    When I confirm deletion using the keyboard
    Then "Keyboard Delete Test" is removed from the program list
```

**Expected Result**

- Keyboard-accessible confirm action works (Enter on focused confirm button or documented shortcut).

---

### DS-4-TC-022 — Delete program with leading/trailing whitespace in name

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program stored as "Test Program" (trimmed); list may display consistently |

**Steps (Gherkin)**

```gherkin
Feature: Delete program with confirmation

  Scenario: Delete targets trimmed program name correctly
    Given I am logged in as admin
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then "Test Program" is removed from the program list
```

**Expected Result**

- Delete icon association works regardless of how whitespace was stored or displayed.
- Consistent with DS-3 trim rules.

---

## Traceability Matrix

| Acceptance Criterion | Covered By |
|---------------------|------------|
| Delete program with confirmation | DS-4-TC-001, DS-4-TC-003, DS-4-TC-007 |
| Cancel program deletion | DS-4-TC-002, DS-4-TC-012, DS-4-TC-020 |

---

## Ambiguities and Gaps in Acceptance Criteria

1. **Admin role not explicit** — Scenarios do not state admin login; implied by feature description but not in Given/When steps.

2. **Confirmation dialog content** — AC requires a dialog but does not specify message text, whether program name is shown, or destructive styling (e.g., red Confirm button).

3. **Confirm button label** — "Confirm deletion" is described in prose but exact button text (Delete, Confirm, Yes) is unspecified.

4. **Soft delete vs hard delete** — Unclear whether program is permanently removed or archived/recoverable.

5. **Dependent data** — No criteria for programs with linked curriculum, enrollments, or other references (DS-4-TC-013 inferred).

6. **Empty program list** — No AC for UI state after deleting the last program.

7. **Success feedback** — No requirement for toast, audit log, or undo after deletion.

8. **Dismiss behaviors** — Cancel is specified; Esc, click-outside, and close (X) behavior are not defined.

9. **List update timing** — AC says program is removed from list but does not require immediate update without reload.

10. **Server/network errors** — No AC for failed delete API calls or timeouts.

11. **Concurrent deletion** — No criteria for two admins deleting the same program simultaneously.

12. **Accessibility** — No requirements for focus trap in dialog, focus return after close, or screen reader announcements.

13. **Programs page context** — AC does not state user must be on Programs page to initiate delete.

14. **Deletion scope** — Unclear whether associated description and curriculum data are cascade-deleted.

15. **"Empty inputs" relevance** — Delete flow has no text inputs in AC; edge cases for empty/special/max-length names apply to program identity display only.

16. **Duplicate program names** — If duplicate names are prevented (DS-3), DS-4-TC-017 scenario may be invalid; delete should always target unique records by ID.
