# DS-2 — Test Plan: Edit Existing Program Details

| Field | Value |
|-------|-------|
| **Feature** | Edit existing program details |
| **Ticket** | [DS-2](https://legionqaschool.atlassian.net/browse/DS-2) |
| **Type** | Story |
| **Priority** | High |
| **Labels** | mvp, program-setup, tests-generated |
| **Author** | QA |
| **Last Updated** | 2026-07-03 |
| **Source docs** | [Field Definitions](https://legionqaschool.atlassian.net/wiki/spaces/DS/pages/233078785), [UI Behavior](https://legionqaschool.atlassian.net/wiki/spaces/DS/pages/233111568), [Validation Rules](https://legionqaschool.atlassian.net/wiki/spaces/DS/pages/233111553) |

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
| DS-2-TC-011 | Viewer role cannot edit a program | Negative | P1 |
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
| DS-2-TC-031 | Editor role can edit an existing program | Positive | P1 |
| DS-2-TC-032 | Close edit modal via X button discards changes | Positive | P2 |
| DS-2-TC-033 | Close edit modal by clicking outside discards changes | Positive | P2 |
| DS-2-TC-034 | Edit form pre-populates AI Generation Config fields | Positive | P2 |

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
    And the Program Name field is pre-populated with "Web Development 2026"
    And the Description field is pre-populated with the program's current description
    And any saved AI Generation Config values are pre-populated in the collapsible section
```

**Expected Results**

- Edit form opens (modal titled "Edit Program").
- Program Name and Description reflect the program's stored values.
- AI Generation Config fields reflect stored values when the program has them.
- Fields are editable by users with ADMIN or EDITOR role.

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
    When I change the Program Name to "Web Development 2026 - Updated"
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
    And I leave the Program Name unchanged
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
    When I change the Program Name to "Cybersecurity Essentials"
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
    When I change the Program Name to "No Refresh Edit Test - Saved"
    And I click Save
    Then the modal closes
    And the program list shows "No Refresh Edit Test - Saved"
    And I have not reloaded the page
```

**Expected Results**

- List is re-fetched from the server after successful save (per UI Behavior).
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
    When I change the Program Name to "Should Not Be Saved"
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
    When I clear the Program Name field
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
    When I change the Program Name to "Data Science Fundamentals"
    And I click Save
    Then the program is not updated
    And I see an error message indicating the program name already exists
    And the modal remains open
```

**Expected Results**

- Duplicate name is rejected with HTTP 400 or 409.
- A visible error message is displayed to the user (per Validation Rules).
- User input is preserved in the form.
- Original program name remains in the list.

---

### DS-2-TC-011 — Viewer role cannot edit a program

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in with VIEWER role; at least one program exists |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Viewer cannot edit a program
    Given I am logged in as a viewer
    And I am on the Programs page
    And a program "Web Development 2026" exists
    Then I do not see an edit icon on "Web Development 2026"
```

**Expected Results**

- Edit control is hidden or disabled for VIEWER role.
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
| **Preconditions** | User is logged in as admin; edit form is open; max Program Name length is 100 characters per product spec |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Program name over maximum length rejected on edit
    Given I am editing a program
    And the maximum allowed Program Name length is 100 characters
    When I change the Program Name to a string of 101 characters
    Then the Save button is disabled
    Or I see a validation message indicating the name exceeds the maximum length
```

**Expected Results**

- Over-length name cannot be saved.
- Server returns 400 with a visible error message (per Validation Rules).
- Original program name remains unchanged if edit is abandoned.

---

### DS-2-TC-014 — Reject description exceeding maximum length

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative / Boundary |
| **Preconditions** | User is logged in as admin; edit form is open; max Description length is 500 characters per product spec |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Description over maximum length rejected on edit
    Given I am editing a program
    And the maximum allowed Description length is 500 characters
    When I change the Description to a string of 501 characters
    Then the Save button is disabled
    Or I see a validation message indicating the description exceeds the maximum length
```

**Expected Results**

- Over-length description cannot be saved.
- Server returns 400 with a visible error message (per Validation Rules).
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
    When I change the Program Name to "   "
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
    When I change the Program Name to "<script>alert('xss')</script>"
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
    When I change the Program Name to "Valid Updated Name"
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
    When I change the Program Name to "Web Development 2026 - Updated"
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
    When I change the Program Name to "A"
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
| **Preconditions** | User is logged in as admin; edit form is open; max Program Name length is 100 characters |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Maximum length name accepted on edit
    Given I am editing a program
    And the maximum allowed Program Name length is 100 characters
    When I change the Program Name to a string of exactly 100 characters
    And I click Save
    Then the modal closes
    And the program list shows the 100-character name
```

**Expected Results**

- Name at exactly max length is saved successfully.

---

### DS-2-TC-021 — Description at maximum length boundary

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge / Boundary |
| **Preconditions** | User is logged in as admin; edit form is open; max Description length is 500 characters |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Maximum length description accepted on edit
    Given I am editing a program
    And the maximum allowed Description length is 500 characters
    When I change the Description to a string of exactly 500 characters
    And I click Save
    Then the modal closes
    And the saved description is 500 characters long
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
    When I change the Program Name to "  Web Development 2026 - Updated  "
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
    When I change the Program Name to "C++ & C# — Advanced (2026)"
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
    When I change the Program Name to "プログラム 🎓 2026"
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
    And I leave the Program Name as "Web Development 2026"
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
    When I change the Program Name to "data science fundamentals"
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
    And I have changed the Program Name to "Double Click Save Test"
    When I double-click the Save button quickly
    Then exactly one program named "Double Click Save Test" exists
    And no duplicate records or errors occur
```

**Expected Results**

- Only one update request is processed.
- Save button is disabled during submission.
- Modal closes on successful save.

---

### DS-2-TC-031 — Editor role can edit an existing program

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive |
| **Preconditions** | User is logged in with EDITOR role; program "Web Development 2026" exists |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Editor can edit a program
    Given I am logged in as an editor
    And I am on the Programs page
    And a program "Web Development 2026" exists
    When I click the edit icon on "Web Development 2026"
    And I change the Program Name to "Web Development 2026 - Editor Update"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Editor Update"
```

**Expected Results**

- EDITOR role has the same edit access as ADMIN per Program Setup UI Behavior.
- Changes persist and the list refreshes without a page reload.

---

### DS-2-TC-032 — Close edit modal via X button discards changes

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; edit form is open for "Web Development 2026" |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Close edit modal with X without saving
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Should Not Be Saved"
    And I click the X button on the modal
    Then the modal closes
    And the program list shows "Web Development 2026"
```

**Expected Results**

- No changes are persisted when closing via X.
- Original program data remains intact.

---

### DS-2-TC-033 — Close edit modal by clicking outside discards changes

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; edit form is open for "Web Development 2026" |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: Close edit modal by clicking outside without saving
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Should Not Be Saved"
    And I click outside the modal
    Then the modal closes
    And the program list shows "Web Development 2026"
```

**Expected Results**

- Click-outside dismiss behaves the same as Cancel per UI Behavior.
- No changes are persisted.

---

### DS-2-TC-034 — Edit form pre-populates AI Generation Config fields

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program exists with non-default AI Generation Config values |

**Steps (Gherkin)**

```gherkin
Feature: Edit existing program details

  Scenario: AI Generation Config fields are pre-populated on edit
    Given I am on the Programs page
    And a program exists with Total Hours 120 and Default Session Hours 4
    When I click the edit icon on that program
    Then I see the edit form
    And the collapsible "AI Generation Config" section shows Total Hours 120
    And Default Session Hours is pre-populated with 4
```

**Expected Results**

- All stored program fields — not only Program Name and Description — are available for review and edit.
- Covers Jira AC "pre-populated with the program's current data" for optional config fields.

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
    When I clear the Program Name field
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
| Open program for editing | DS-2-TC-001, DS-2-TC-034 |
| Successfully edit a program name | DS-2-TC-002, DS-2-TC-005, DS-2-TC-006, DS-2-TC-031 |
| Edit preserves unchanged fields | DS-2-TC-003, DS-2-TC-004, DS-2-TC-026, DS-2-TC-029 |
| Admin user (story persona) | DS-2-TC-001, DS-2-TC-002, DS-2-TC-003 |
| List refreshes immediately after save | DS-2-TC-002, DS-2-TC-006 |

### Confluence Requirements Traceability

| Requirement (Confluence) | Covered By |
|--------------------------|------------|
| ADMIN and EDITOR can edit | DS-2-TC-031, DS-2-TC-011 (VIEWER denied) |
| Name max 100 / Description max 500 | DS-2-TC-013, DS-2-TC-014, DS-2-TC-020, DS-2-TC-021 |
| Duplicate name → 400/409 + error | DS-2-TC-010 |
| Modal close via X / outside click | DS-2-TC-032, DS-2-TC-033 |
| Save disabled when Program Name empty | DS-2-TC-009, DS-2-TC-015, DS-2-TC-030 |
| List re-fetched after mutation | DS-2-TC-006 |

---

## Ambiguities and Gaps in Acceptance Criteria

### Resolved (via Confluence / Jira sync on 2026-07-03)

1. **Field lengths** — Confluence Field Definitions specify Name max **100** and Description max **500** characters. Boundary tests updated from placeholder 255/2000.

2. **Role access** — Confluence UI Behavior grants edit to **ADMIN** and **EDITOR**; **VIEWER** is read-only. TC-011 now targets VIEWER; TC-031 covers EDITOR.

3. **Duplicate names on edit** — Validation Rules specify HTTP 400/409 with error displayed. TC-010 updated accordingly.

4. **Modal dismiss** — UI Behavior documents X button and click-outside dismiss. TC-032 and TC-033 added.

5. **Complete field list** — Field Definitions include AI Generation Config fields. TC-001 and TC-034 cover pre-population.

### Remaining Open Questions

1. **Admin vs Editor in Jira AC** — Jira story says "admin user" but Confluence allows EDITOR. Tests follow Confluence; confirm with product owner.

2. **Field naming** — Jira AC uses "Name"; UI label is "Program Name". Tests use UI label.

3. **Rename to same name** — Unclear whether saving without changing the name should succeed silently or be blocked as a no-op (TC-008, TC-026).

4. **Case sensitivity for duplicates** — Duplicate detection rules not specified (TC-027).

5. **Success feedback** — No requirement for toast notification, audit log, or "last updated" timestamp after save.

6. **Concurrent edits** — No criteria for two admins editing the same program simultaneously.

7. **Deleted or archived programs** — TC-018 covers deletion during edit; archived state not specified.

8. **List sort order after rename** — Unclear whether the list re-sorts or keeps position.

9. **Network failure** — TC-017 covers server error; timeout/offline behavior not specified.

10. **Accessibility** — No requirements for focus management or screen reader announcements.

11. **Curriculum impact** — Unclear whether renaming affects linked curriculum structure, URLs, or exports.
