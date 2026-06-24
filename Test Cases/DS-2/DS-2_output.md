# DS-2 — Test Plan: Edit Existing Program Details

| Field | Value |
|-------|-------|
| **Feature** | Edit existing program details |
| **Ticket** | DS-2 |
| **Author** | QA |
| **Last Updated** | 2026-06-22 |

---

## Test Case Summary

| ID | Title | Group | Priority |
|----|-------|-------|----------|
| DS-2-TC-001 | Open program for editing with pre-populated form | Positive | P1 |
| DS-2-TC-002 | Successfully edit program name | Positive | P1 |
| DS-2-TC-003 | Edit preserves unchanged fields when only Description changes | Positive | P1 |
| DS-2-TC-004 | Successfully edit description only | Positive | P2 |
| DS-2-TC-005 | Successfully edit both name and description | Positive | P2 |
| DS-2-TC-006 | Program list updates without page refresh after save | Positive | P2 |
| DS-2-TC-007 | Cancel edit discards changes | Positive | P2 |
| DS-2-TC-008 | Save with no changes keeps existing data | Positive | P3 |
| DS-2-TC-009 | Save button disabled when program name is cleared | Negative | P1 |
| DS-2-TC-010 | Reject duplicate program name on edit | Negative | P1 |
| DS-2-TC-011 | Non-admin user cannot edit a program | Negative | P1 |
| DS-2-TC-012 | Unauthenticated user cannot access edit form | Negative | P1 |
| DS-2-TC-013 | Reject program name exceeding maximum length | Negative | P1 |
| DS-2-TC-014 | Reject description exceeding maximum length | Negative | P2 |
| DS-2-TC-015 | Whitespace-only program name treated as empty | Negative | P1 |
| DS-2-TC-016 | Malicious input (XSS/SQL) handled safely on save | Negative | P1 |
| DS-2-TC-017 | Edit fails gracefully on server error | Negative | P2 |
| DS-2-TC-018 | Cannot edit a program that was deleted by another user | Negative | P2 |
| DS-2-TC-019 | Program name at minimum length boundary (1 character) | Edge | P2 |
| DS-2-TC-020 | Program name at maximum length boundary | Edge | P2 |
| DS-2-TC-021 | Description at maximum length boundary | Edge | P2 |
| DS-2-TC-022 | Program name with leading and trailing whitespace trimmed | Edge | P2 |
| DS-2-TC-023 | Program name with special characters | Edge | P2 |
| DS-2-TC-024 | Description with special characters and line breaks | Edge | P2 |
| DS-2-TC-025 | Unicode and emoji characters in edited fields | Edge | P3 |
| DS-2-TC-026 | Rename to same name (no-op) allowed | Edge | P3 |
| DS-2-TC-027 | Case-only name change and duplicate detection | Edge | P3 |
| DS-2-TC-028 | Rapid double-click on Save does not corrupt data | Edge | P2 |
| DS-2-TC-029 | Clear description to empty string | Edge | P2 |
| DS-2-TC-030 | Save button re-enabled after correcting invalid name | Edge | P2 |

---

## Positive Flows

### DS-2-TC-001 — Open program for editing with pre-populated form

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; program "Web Development 2026" exists with known Name and Description values |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Open program for editing
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists
    When I click the edit icon on "Web Development 2026"
    Then I see the edit form
    And the Name field is pre-populated with "Web Development 2026"
    And the Description field is pre-populated with the program's current description
```

**Expected Results**

- Edit form opens (modal or dedicated view).
- All editable fields reflect the program's stored values.
- Fields are editable by the admin user.

---

### DS-2-TC-002 — Successfully edit program name

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; program "Web Development 2026" exists; edit form is open for that program |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Successfully edit a program name
    Given I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"
```

**Expected Results**

- Name change is persisted.
- Modal closes on successful save.
- Program list reflects the new name without requiring a page reload.
- Description and other fields retain their previous values.

---

### DS-2-TC-003 — Edit preserves unchanged fields when only Description changes

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; program exists with Name "Web Development 2026" and Description "Full-stack web development program"; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Edit preserves unchanged fields
    Given I am editing a program with Name "Web Development 2026"
    And the program Description is "Full-stack web development program"
    When I only change the Description to "Updated full-stack curriculum"
    And I click Save
    Then the modal closes
    And the program list shows Name "Web Development 2026"
    And the program Description is "Updated full-stack curriculum"
```

**Expected Results**

- Name remains "Web Development 2026".
- Only Description is updated in storage.
- No other program attributes are modified unintentionally.

---

### DS-2-TC-004 — Successfully edit description only

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; at least one program exists; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Update description without changing name
    Given I am editing a program with Name "Data Science Fundamentals"
    When I change the Description to "Revised introductory data science curriculum"
    And I leave the Name unchanged
    And I click Save
    Then the modal closes
    And the program list shows "Data Science Fundamentals"
```

**Expected Results**

- Description update is saved.
- Name displayed in list is unchanged.

---

### DS-2-TC-005 — Successfully edit both name and description

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program "Cybersecurity Basics" exists; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Update both name and description
    Given I am editing "Cybersecurity Basics"
    When I change the Name to "Cybersecurity Essentials"
    And I change the Description to "Foundational security concepts and practices"
    And I click Save
    Then the modal closes
    And the program list shows "Cybersecurity Essentials"
```

**Expected Results**

- Both fields are updated and persisted.
- Old program name no longer appears in the list.

---

### DS-2-TC-006 — Program list updates without page refresh after save

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; edit form is open for an existing program |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: List updates in place after edit
    Given I am editing a program named "No Refresh Edit Test"
    When I change the Name to "No Refresh Edit Test - Saved"
    And I click Save
    Then the modal closes
    And the program list shows "No Refresh Edit Test - Saved"
    And I have not reloaded the page
```

**Expected Results**

- List reflects changes immediately via client-side update or API response handling.
- No full page reload is required.

---

### DS-2-TC-007 — Cancel edit discards changes

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program "Web Development 2026" exists; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Cancel edit without saving
    Given I am editing "Web Development 2026"
    When I change the Name to "Should Not Be Saved"
    And I click Cancel
    Then the modal closes
    And the program list shows "Web Development 2026"
```

**Expected Results**

- No changes are persisted.
- Original program data remains intact.

---

### DS-2-TC-008 — Save with no changes keeps existing data

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; edit form is open with unmodified fields |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Save without modifying any field
    Given I am editing a program with Name "Unchanged Program"
    And I have not modified any field
    When I click Save
    Then the modal closes
    And the program list shows "Unchanged Program"
```

**Expected Results**

- Save succeeds or is a no-op without error.
- Program data remains identical to pre-edit state.

---

## Negative Flows

### DS-2-TC-009 — Save button disabled when program name is cleared

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; edit form is open for an existing program |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Empty program name prevents save
    Given I am editing a program
    When I clear the Name field
    Then the Save button is disabled
    And no changes are persisted
```

**Expected Results**

- Save cannot be submitted with an empty Name.
- Original program data is unchanged if user dismisses the form.

---

### DS-2-TC-010 — Reject duplicate program name on edit

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; programs "Web Development 2026" and "Data Science Fundamentals" exist; edit form is open for "Web Development 2026" |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Reject renaming to an existing program name
    Given I am editing "Web Development 2026"
    And a program named "Data Science Fundamentals" already exists
    When I change the Name to "Data Science Fundamentals"
    And I click Save
    Then the program is not updated
    And I see an error message indicating the program name already exists
    And the modal remains open
```

**Expected Results**

- Duplicate name is rejected (assumed; see Ambiguities).
- User input is preserved in the form.
- Original program name remains in the list.

---

### DS-2-TC-011 — Non-admin user cannot edit a program

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in with a non-admin role; at least one program exists |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Non-admin cannot edit a program
    Given I am logged in as a non-admin user
    And I am on the Programs page
    And a program "Web Development 2026" exists
    Then I do not see an edit icon on "Web Development 2026"
```

**Expected Results**

- Edit control is hidden or disabled for non-admin users.
- Direct navigation to an edit URL returns 403 or redirects.

---

### DS-2-TC-012 — Unauthenticated user cannot access edit form

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | No active user session; a program exists in the system |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Unauthenticated user cannot edit a program
    Given I am not logged in
    When I attempt to navigate to the program edit form directly
    Then I am redirected to the login page
```

**Expected Results**

- Edit form is not accessible without authentication.

---

### DS-2-TC-013 — Reject program name exceeding maximum length

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative / Boundary |
| **Preconditions** | User is logged in as admin; edit form is open; `MAX_NAME_LENGTH` placeholder: 255 characters |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Program name over maximum length rejected on edit
    Given I am editing a program
    And the maximum allowed Name length is 255 characters
    When I change the Name to a string of 256 characters
    Then the Save button is disabled
    Or I see a validation message indicating the name exceeds the maximum length
```

**Expected Results**

- Over-length name cannot be saved.
- Original program name remains unchanged if edit is abandoned.

---

### DS-2-TC-014 — Reject description exceeding maximum length

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative / Boundary |
| **Preconditions** | User is logged in as admin; edit form is open; `MAX_DESC_LENGTH` placeholder: 2000 characters |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Description over maximum length rejected on edit
    Given I am editing a program
    And the maximum allowed Description length is 2000 characters
    When I change the Description to a string of 2001 characters
    Then the Save button is disabled
    Or I see a validation message indicating the description exceeds the maximum length
```

**Expected Results**

- Over-length description cannot be saved.
- Clear validation feedback is shown.

---

### DS-2-TC-015 — Whitespace-only program name treated as empty

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; edit form is open for an existing program |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Whitespace-only name is invalid on edit
    Given I am editing a program
    When I change the Name to "   "
    Then the Save button is disabled
```

**Expected Results**

- Whitespace-only input is treated as empty after trim.
- Program is not updated.

---

### DS-2-TC-016 — Malicious input (XSS/SQL) handled safely on save

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative / Security |
| **Preconditions** | User is logged in as admin; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Malicious input is sanitized on edit
    Given I am editing a program
    When I change the Name to "<script>alert('xss')</script>"
    And I change the Description to "'; DROP TABLE programs; --"
    And I click Save
    Then no script is executed in the browser
    And the database remains intact
    And displayed values are safely escaped
```

**Expected Results**

- Input is stored and rendered without executing scripts or SQL injection.
- Application remains stable.

---

### DS-2-TC-017 — Edit fails gracefully on server error

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; edit form is open; server/API is configured to return an error on save |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Server error during save
    Given I am editing a program
    When I change the Name to "Valid Updated Name"
    And I click Save
    And the server returns an error
    Then the modal remains open or an error message is displayed
    And the program list still shows the original program name
```

**Expected Results**

- User is informed of the failure.
- Data is not partially corrupted.
- User can retry or cancel.

---

### DS-2-TC-018 — Cannot edit a program that was deleted by another user

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; edit form is open; program is deleted by another session before save |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Edit stale program after deletion
    Given I am editing "Web Development 2026"
    And the program is deleted by another admin
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then I see an error indicating the program no longer exists
    And the program list does not show "Web Development 2026 - Updated"
```

**Expected Results**

- Optimistic locking or 404 handling prevents silent failure.
- User receives actionable feedback.

---

## Edge Cases

### DS-2-TC-019 — Program name at minimum length boundary (1 character)

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge / Boundary |
| **Preconditions** | User is logged in as admin; edit form is open; no other program named "A" exists |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Minimum length name on edit
    Given I am editing a program
    When I change the Name to "A"
    And I click Save
    Then the modal closes
    And the program list shows "A"
```

**Expected Results**

- Single-character name is accepted if minimum length is 1.

---

### DS-2-TC-020 — Program name at maximum length boundary

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge / Boundary |
| **Preconditions** | User is logged in as admin; edit form is open; `MAX_NAME_LENGTH` = 255 (placeholder) |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Maximum length name accepted on edit
    Given I am editing a program
    And the maximum allowed Name length is 255 characters
    When I change the Name to a string of exactly 255 characters
    And I click Save
    Then the modal closes
    And the program list shows the 255-character name
```

**Expected Results**

- Name at exactly max length is saved successfully.

---

### DS-2-TC-021 — Description at maximum length boundary

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge / Boundary |
| **Preconditions** | User is logged in as admin; edit form is open; `MAX_DESC_LENGTH` = 2000 (placeholder) |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Maximum length description accepted on edit
    Given I am editing a program
    And the maximum allowed Description length is 2000 characters
    When I change the Description to a string of exactly 2000 characters
    And I click Save
    Then the modal closes
    And the saved description is 2000 characters long
```

**Expected Results**

- Description at exactly max length is stored in full.

---

### DS-2-TC-022 — Program name with leading and trailing whitespace trimmed

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Trim whitespace from edited name
    Given I am editing a program
    When I change the Name to "  Web Development 2026 - Updated  "
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026 - Updated"
```

**Expected Results**

- Leading and trailing whitespace is trimmed before save and display.

---

### DS-2-TC-023 — Program name with special characters

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Edited name with special characters
    Given I am editing a program
    When I change the Name to "C++ & C# — Advanced (2026)"
    And I click Save
    Then the modal closes
    And the program list shows "C++ & C# — Advanced (2026)"
```

**Expected Results**

- Special characters are accepted and displayed correctly.

---

### DS-2-TC-024 — Description with special characters and line breaks

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Edited description with multiline and special characters
    Given I am editing a program
    When I change the Description to "Line 1: HTML <tags> & symbols\nLine 2: \"quoted\" text"
    And I click Save
    Then the modal closes
    And the saved description preserves line breaks and special characters
```

**Expected Results**

- Multiline and special-character description is stored and retrieved accurately.

---

### DS-2-TC-025 — Unicode and emoji characters in edited fields

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Unicode and emoji in edited name
    Given I am editing a program
    When I change the Name to "プログラム 🎓 2026"
    And I click Save
    Then the modal closes
    And the program list shows "プログラム 🎓 2026"
```

**Expected Results**

- Unicode and emoji render correctly without encoding issues.

---

### DS-2-TC-026 — Rename to same name (no-op) allowed

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; edit form is open for "Web Development 2026" |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Saving with unchanged name does not trigger duplicate error
    Given I am editing "Web Development 2026"
    When I change the Description to "Updated description only"
    And I leave the Name as "Web Development 2026"
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026"
```

**Expected Results**

- Saving with the same name does not incorrectly flag a duplicate-of-self error.

---

### DS-2-TC-027 — Case-only name change and duplicate detection

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; programs "Web Development 2026" and "Data Science Fundamentals" exist; edit form open for "Web Development 2026" |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Case-only rename duplicate check
    Given I am editing "Web Development 2026"
    And a program named "Data Science Fundamentals" already exists
    When I change the Name to "data science fundamentals"
    And I click Save
    Then the program is not updated
    And I see an error message indicating the program name already exists
```

**Expected Results**

- Duplicate detection behavior (case-sensitive vs case-insensitive) matches product rules.

---

### DS-2-TC-028 — Rapid double-click on Save does not corrupt data

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; edit form is open with valid changes |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Prevent duplicate submission on double-click Save
    Given I am editing a program
    And I have changed the Name to "Double Click Save Test"
    When I double-click the Save button quickly
    Then exactly one program named "Double Click Save Test" exists
    And no duplicate records or errors occur
```

**Expected Results**

- Only one update request is processed.
- Save button is disabled during submission.

---

### DS-2-TC-029 — Clear description to empty string

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program has a non-empty Description; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Clear description on edit
    Given I am editing a program with a non-empty Description
    When I clear the Description field
    And I click Save
    Then the modal closes
    And the program Description is empty
    And the Name remains unchanged
```

**Expected Results**

- Empty Description is allowed if field is optional.
- If Description is required, Save is blocked with validation feedback.

---

### DS-2-TC-030 — Save button re-enabled after correcting invalid name

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; edit form is open |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Save button state updates when name becomes valid
    Given I am editing a program
    When I clear the Name field
    Then the Save button is disabled
    When I fill in the Name with "Valid Program Name"
    Then the Save button is enabled
```

**Expected Results**

- Button enabled/disabled state reacts dynamically to field validity during edit.

---

## Traceability Matrix

| Acceptance Criterion | Covered By |
|---------------------|------------|
| Open program for editing | DS-2-TC-001 |
| Successfully edit a program name | DS-2-TC-002, DS-2-TC-005, DS-2-TC-006 |
| Edit preserves unchanged fields | DS-2-TC-003, DS-2-TC-004, DS-2-TC-026, DS-2-TC-029 |

---

## Ambiguities and Gaps in Acceptance Criteria

1. **Admin role not stated in AC** — Scenarios assume the user is on the Programs page but do not explicitly require admin login (unlike DS-1). Non-admin behavior is inferred.

2. **Field naming inconsistency** — Acceptance criteria use "Name" in edit scenarios but DS-1 creation uses "Program Name". Unclear if labels differ between create and edit forms.

3. **Complete field list** — AC mentions "other fields" but does not enumerate all editable attributes (e.g., status, dates, curriculum links).

4. **Maximum/minimum field lengths** — No specification for Name or Description limits on edit. Placeholder values (255 / 2000) used in boundary tests must be confirmed.

5. **Empty name validation** — No explicit AC for disabling Save when Name is cleared; inferred from DS-1 create behavior.

6. **Duplicate names on edit** — No rule on renaming to an existing program's name or case-insensitive duplicates.

7. **Rename to same name** — Unclear whether saving without changing the name should succeed silently or be blocked as a no-op.

8. **Description required vs optional** — AC allows changing only Description but does not state whether Description can be cleared to empty.

9. **Cancel/Close behavior** — No acceptance criteria for Cancel, Esc key, or click-outside-to-dismiss on the edit modal.

10. **Success feedback** — No requirement for toast notification, audit log, or "last updated" timestamp after save.

11. **Concurrent edits** — No criteria for two admins editing the same program simultaneously (last-write-wins vs conflict detection).

12. **Deleted or archived programs** — No guidance on editing programs in archived or soft-deleted state.

13. **List sort order after rename** — Unclear whether the list re-sorts alphabetically or keeps position after a name change.

14. **Error message copy** — Validation, duplicate, and server error messages are not specified.

15. **Network failure** — No AC for timeout or offline behavior during Save.

16. **Accessibility** — No requirements for focus management when opening/closing the edit form or screen reader announcements on save.

17. **Curriculum impact** — Unclear whether renaming a program affects linked curriculum structure, URLs, or exports.
