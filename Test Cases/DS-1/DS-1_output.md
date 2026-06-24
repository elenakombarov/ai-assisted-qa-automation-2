# DS-1 — Test Plan: Create New Academic Program

| Field | Value |
|-------|-------|
| **Feature** | Create new academic program |
| **Ticket** | DS-1 |
| **Author** | QA |
| **Last Updated** | 2026-06-22 |

---

## Test Case Summary

| ID | Title | Priority |
|----|-------|----------|
| DS-1-TC-001 | Navigate to program creation form as admin | P1 |
| DS-1-TC-002 | Successfully create a program with valid data | P1 |
| DS-1-TC-003 | Create button disabled when Program Name is empty | P1 |
| DS-1-TC-004 | Create program with description only (name provided) | P2 |
| DS-1-TC-005 | Create program with empty description | P2 |
| DS-1-TC-006 | Cancel or dismiss program creation modal | P2 |
| DS-1-TC-007 | Non-admin user cannot access program creation | P1 |
| DS-1-TC-008 | Unauthenticated user redirected from Programs page | P1 |
| DS-1-TC-009 | Duplicate program name rejected | P1 |
| DS-1-TC-010 | Program name with leading and trailing whitespace trimmed | P2 |
| DS-1-TC-011 | Program name with special characters accepted | P2 |
| DS-1-TC-012 | Description with special characters and line breaks | P2 |
| DS-1-TC-013 | Program name at minimum length boundary (1 character) | P2 |
| DS-1-TC-014 | Program name at maximum length boundary | P2 |
| DS-1-TC-015 | Program name exceeding maximum length rejected | P1 |
| DS-1-TC-016 | Description at maximum length boundary | P2 |
| DS-1-TC-017 | Description exceeding maximum length rejected | P2 |
| DS-1-TC-018 | Program name with only whitespace treated as empty | P1 |
| DS-1-TC-019 | Create button re-enabled after clearing invalid name | P2 |
| DS-1-TC-020 | New program appears in list without page refresh | P2 |
| DS-1-TC-021 | Program name case sensitivity for duplicates | P3 |
| DS-1-TC-022 | SQL injection and XSS strings handled safely | P1 |
| DS-1-TC-023 | Unicode and emoji characters in program name | P3 |
| DS-1-TC-024 | Rapid double-click on Create does not duplicate program | P2 |

---

## Test Cases

### DS-1-TC-001 — Navigate to program creation form as admin

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive — Acceptance Criterion |
| **Preconditions** | User exists with admin role; user is logged in; at least one program may or may not exist in the system |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Navigate to program creation form
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form
    And the form displays a "Program Name" field
    And the form displays a "Description" field
```

**Expected Results**

- Programs page loads successfully for the admin user.
- Clicking "+ New Program" opens the program creation form (modal or dedicated page per implementation).
- Both required fields from the acceptance criteria are visible and editable.

---

### DS-1-TC-002 — Successfully create a program with valid data

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; program creation form is open; no existing program named "Web Development 2026" |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Successfully create a program
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"
```

**Expected Results**

- Program is persisted in the system.
- Modal (or form view) closes after successful creation.
- "Web Development 2026" appears in the program list.
- Description is stored and retrievable (e.g., on program detail or edit view).

---

### DS-1-TC-003 — Create button disabled when Program Name is empty

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Validation prevents empty program name
    Given I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled
```

**Expected Results**

- Create button is not clickable while Program Name is empty.
- No program is created.
- No error toast or inline validation is required unless specified elsewhere (button disabled state is sufficient per AC).

---

### DS-1-TC-004 — Create program with description only (name provided)

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Create program with name and description
    Given I am on the program creation form
    When I fill in Program Name with "Data Science Fundamentals"
    And I fill in Description with "Introductory data science curriculum"
    And I click Create
    Then the modal closes
    And the program list shows "Data Science Fundamentals"
```

**Expected Results**

- Program is created with both fields saved.
- Confirms happy path beyond the single example in the acceptance criteria.

---

### DS-1-TC-005 — Create program with empty description

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive / Edge |
| **Preconditions** | User is logged in as admin; program creation form is open; Program Name is a valid non-empty value |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Create program without description
    Given I am on the program creation form
    When I fill in Program Name with "Cybersecurity Basics"
    And I leave the Description field empty
    And I click Create
    Then the modal closes
    And the program list shows "Cybersecurity Basics"
```

**Expected Results**

- Program is created when Description is optional.
- If Description is required by implementation, an inline validation message is shown and Create remains disabled or submission is blocked.

---

### DS-1-TC-006 — Cancel or dismiss program creation modal

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; program creation form is open with partially filled fields |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Cancel program creation without saving
    Given I am on the program creation form
    And I have filled in Program Name with "Temporary Program"
    When I click Cancel
    Then the modal closes
    And the program list does not show "Temporary Program"
```

**Expected Results**

- No program is created.
- Form state is discarded.
- User returns to the Programs list view.

---

### DS-1-TC-007 — Non-admin user cannot access program creation

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User exists with a non-admin role (e.g., instructor, viewer); user is logged in |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Non-admin cannot create a program
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then I do not see a "+ New Program" button
```

**Expected Results**

- "+ New Program" control is hidden or disabled for non-admin users.
- Direct navigation to a create URL (if applicable) returns 403 or redirects.

---

### DS-1-TC-008 — Unauthenticated user redirected from Programs page

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | No active user session |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Unauthenticated user cannot access program creation
    Given I am not logged in
    When I navigate to the Programs page
    Then I am redirected to the login page
```

**Expected Results**

- Programs page and creation form are not accessible without authentication.

---

### DS-1-TC-009 — Duplicate program name rejected

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; a program named "Web Development 2026" already exists |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Reject duplicate program name
    Given I am on the program creation form
    And a program named "Web Development 2026" already exists
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Another description"
    And I click Create
    Then the program is not created
    And I see an error message indicating the program name already exists
```

**Expected Results**

- Duplicate names are not allowed (assumed; see Ambiguities).
- Modal remains open with user input preserved.
- Existing program list is unchanged.

---

### DS-1-TC-010 — Program name with leading and trailing whitespace trimmed

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program creation form is open; no program named "Web Development 2026" |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Trim whitespace from program name
    Given I am on the program creation form
    When I fill in Program Name with "  Web Development 2026  "
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"
```

**Expected Results**

- Leading and trailing whitespace is trimmed before save and display.
- Duplicate check uses trimmed value.

---

### DS-1-TC-011 — Program name with special characters accepted

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Program name with allowed special characters
    Given I am on the program creation form
    When I fill in Program Name with "C++ & C# — Advanced (2026)"
    And I fill in Description with "Systems programming track"
    And I click Create
    Then the modal closes
    And the program list shows "C++ & C# — Advanced (2026)"
```

**Expected Results**

- Allowed punctuation and symbols are accepted and displayed correctly.
- Characters are not HTML-escaped in the UI in a way that breaks display.

---

### DS-1-TC-012 — Description with special characters and line breaks

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Description supports special characters and multiline text
    Given I am on the program creation form
    When I fill in Program Name with "Multiline Description Test"
    And I fill in Description with "Line 1: HTML <tags> & symbols\nLine 2: \"quoted\" text"
    And I click Create
    Then the modal closes
    And the program list shows "Multiline Description Test"
    And the saved description preserves line breaks and special characters
```

**Expected Results**

- Description field accepts multiline input.
- Stored value matches input (with safe encoding; no script execution).

---

### DS-1-TC-013 — Program name at minimum length boundary (1 character)

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Boundary |
| **Preconditions** | User is logged in as admin; program creation form is open; no program named "A" |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Minimum length program name
    Given I am on the program creation form
    When I fill in Program Name with "A"
    And I fill in Description with "Single character name boundary test"
    And I click Create
    Then the modal closes
    And the program list shows "A"
```

**Expected Results**

- Single-character names are accepted if minimum length is 1.
- Create button is enabled.

---

### DS-1-TC-014 — Program name at maximum length boundary

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Boundary |
| **Preconditions** | User is logged in as admin; program creation form is open; `MAX_NAME_LENGTH` is defined by product spec (placeholder: 255 characters) |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Maximum length program name accepted
    Given I am on the program creation form
    And the maximum allowed Program Name length is 255 characters
    When I fill in Program Name with a string of exactly 255 characters
    And I fill in Description with "Max length boundary test"
    And I click Create
    Then the modal closes
    And the program list shows the 255-character program name
```

**Expected Results**

- Name at exactly max length is accepted.
- Full name is visible in list or truncated with tooltip per UI spec.

---

### DS-1-TC-015 — Program name exceeding maximum length rejected

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative / Boundary |
| **Preconditions** | User is logged in as admin; program creation form is open; `MAX_NAME_LENGTH` = 255 (placeholder) |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Program name over maximum length rejected
    Given I am on the program creation form
    And the maximum allowed Program Name length is 255 characters
    When I fill in Program Name with a string of 256 characters
    Then the Create button is disabled
    Or I see a validation message indicating the name exceeds the maximum length
```

**Expected Results**

- Program is not created with an over-length name.
- User receives clear feedback (disabled button, inline error, or character counter).

---

### DS-1-TC-016 — Description at maximum length boundary

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Boundary |
| **Preconditions** | User is logged in as admin; program creation form is open; `MAX_DESC_LENGTH` placeholder: 2000 characters |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Maximum length description accepted
    Given I am on the program creation form
    And the maximum allowed Description length is 2000 characters
    When I fill in Program Name with "Max Description Boundary"
    And I fill in Description with a string of exactly 2000 characters
    And I click Create
    Then the modal closes
    And the program list shows "Max Description Boundary"
```

**Expected Results**

- Description at exactly max length is accepted and stored in full.

---

### DS-1-TC-017 — Description exceeding maximum length rejected

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative / Boundary |
| **Preconditions** | User is logged in as admin; program creation form is open; `MAX_DESC_LENGTH` = 2000 (placeholder) |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Description over maximum length rejected
    Given I am on the program creation form
    When I fill in Program Name with "Over Max Description"
    And I fill in Description with a string of 2001 characters
    Then the Create button is disabled
    Or I see a validation message indicating the description exceeds the maximum length
```

**Expected Results**

- Over-length description cannot be submitted.
- User receives validation feedback.

---

### DS-1-TC-018 — Program name with only whitespace treated as empty

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative / Edge |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Whitespace-only program name is invalid
    Given I am on the program creation form
    When I fill in Program Name with "   "
    Then the Create button is disabled
```

**Expected Results**

- Whitespace-only input is treated as empty after trim.
- No program is created.

---

### DS-1-TC-019 — Create button re-enabled after clearing invalid name

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Create button state updates when name becomes valid
    Given I am on the program creation form
    And the Program Name field is empty
    And the Create button is disabled
    When I fill in Program Name with "Valid Program Name"
    Then the Create button is enabled
    When I clear the Program Name field
    Then the Create button is disabled
```

**Expected Results**

- Button enabled/disabled state reacts dynamically to field validity.

---

### DS-1-TC-020 — New program appears in list without page refresh

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Program list updates after creation without reload
    Given I am on the program creation form
    When I fill in Program Name with "No Refresh Test Program"
    And I fill in Description with "Verify list updates in place"
    And I click Create
    Then the modal closes
    And the program list shows "No Refresh Test Program"
    And I have not reloaded the page
```

**Expected Results**

- List updates optimistically or after API success without full page reload.

---

### DS-1-TC-021 — Program name case sensitivity for duplicates

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program "Web Development 2026" exists |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Duplicate check is case-insensitive
    Given I am on the program creation form
    And a program named "Web Development 2026" already exists
    When I fill in Program Name with "web development 2026"
    And I click Create
    Then the program is not created
    And I see an error message indicating the program name already exists
```

**Expected Results**

- Behavior matches product rule: case-insensitive duplicate rejection (recommended) or case-sensitive allowance (must be documented).

---

### DS-1-TC-022 — SQL injection and XSS strings handled safely

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative / Security |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Malicious input is sanitized and does not execute
    Given I am on the program creation form
    When I fill in Program Name with "<script>alert('xss')</script>"
    And I fill in Description with "'; DROP TABLE programs; --"
    And I click Create
    Then the modal closes or validation occurs per security policy
    And no script is executed in the browser
    And the database remains intact
    And displayed values are safely escaped
```

**Expected Results**

- Input is stored and rendered safely.
- No injection or XSS vulnerability.

---

### DS-1-TC-023 — Unicode and emoji characters in program name

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Unicode and emoji in program name
    Given I am on the program creation form
    When I fill in Program Name with "プログラム 🎓 2026"
    And I fill in Description with "International characters test"
    And I click Create
    Then the modal closes
    And the program list shows "プログラム 🎓 2026"
```

**Expected Results**

- Unicode and emoji render correctly in form and list.
- No encoding corruption in storage.

---

### DS-1-TC-024 — Rapid double-click on Create does not duplicate program

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program creation form is open with valid data |

**Steps (Gherkin)**

```gherkin
Feature: Create new academic program

  Scenario: Prevent duplicate submission on double-click
    Given I am on the program creation form
    And I have filled in Program Name with "Double Click Test"
    And I have filled in Description with "Idempotency check"
    When I double-click the Create button quickly
    Then exactly one program named "Double Click Test" exists in the program list
```

**Expected Results**

- Only one program record is created.
- Create button is disabled or request is debounced during submission.

---

## Traceability Matrix

| Acceptance Criterion | Covered By |
|---------------------|------------|
| Navigate to program creation form | DS-1-TC-001 |
| Successfully create a program | DS-1-TC-002, DS-1-TC-004, DS-1-TC-005, DS-1-TC-020 |
| Validation prevents empty program name | DS-1-TC-003, DS-1-TC-018, DS-1-TC-019 |

---

## Ambiguities and Gaps in Acceptance Criteria

1. **Maximum field lengths** — No specification for Program Name or Description max/min length. Test cases DS-1-TC-013 through DS-1-TC-017 use placeholder values (255 / 2000) that must be confirmed with product/engineering.

2. **Description required vs optional** — Acceptance criteria only mandate validation on Program Name. It is unclear whether Description is optional (DS-1-TC-005 outcome depends on this).

3. **Duplicate program names** — No explicit rule on whether duplicate names are allowed. DS-1-TC-009 and DS-1-TC-021 assume duplicates are rejected; this should be confirmed.

4. **Case sensitivity** — Unclear whether "Web Development 2026" and "web development 2026" are considered the same program name.

5. **Whitespace handling** — No guidance on trimming leading/trailing spaces in Program Name or Description.

6. **UI pattern** — Acceptance criteria refer to a "modal" but do not specify Cancel/Close behavior, keyboard shortcuts (Esc), or click-outside-to-dismiss.

7. **Non-admin and unauthenticated access** — Story scope is admin-only; no criteria define behavior for other roles or logged-out users (covered as inferred negative tests).

8. **Success feedback** — No requirement for toast notification, success message, or audit log entry after creation.

9. **List sort order** — Unclear where newly created program appears in the list (top, alphabetical, created date).

10. **Program Name character set** — No list of allowed or disallowed characters (e.g., slashes, quotes, HTML tags).

11. **Error message copy** — Validation and duplicate-name error messages are not specified.

12. **Network/API failure** — No acceptance criteria for server errors, timeouts, or offline behavior during Create.

13. **Concurrent creation** — No criteria for two admins creating programs with the same name simultaneously.

14. **Accessibility** — No requirements for form labels, focus management on modal open/close, or screen reader announcements.

15. **Localization** — No guidance on whether program names/descriptions support all locales or RTL text.
