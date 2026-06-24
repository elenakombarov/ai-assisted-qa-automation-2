# DS-3 — Test Plan: Program Name Validation and Duplicate Prevention

| Field | Value |
|-------|-------|
| **Feature** | Program name validation and duplicate prevention |
| **Ticket** | DS-3 |
| **Author** | QA |
| **Last Updated** | 2026-06-22 |

---

## Test Case Summary

| ID | Title | Group | Priority |
|----|-------|-------|----------|
| DS-3-TC-001 | Accept program name with special characters | Positive | P1 |
| DS-3-TC-002 | Accept valid alphanumeric program name | Positive | P1 |
| DS-3-TC-003 | Accept program name with internal whitespace | Positive | P2 |
| DS-3-TC-004 | Accept program name with Unicode and accented characters | Positive | P2 |
| DS-3-TC-005 | Valid name with leading/trailing whitespace trimmed and saved | Positive | P2 |
| DS-3-TC-006 | Reject program name with only whitespace | Negative | P1 |
| DS-3-TC-007 | Reject empty program name | Negative | P1 |
| DS-3-TC-008 | Reject duplicate program name on create | Negative | P1 |
| DS-3-TC-009 | Reject duplicate program name on edit | Negative | P1 |
| DS-3-TC-010 | Reject program name exceeding maximum length | Negative | P1 |
| DS-3-TC-011 | Create button disabled for invalid name before submit | Negative | P2 |
| DS-3-TC-012 | Duplicate error preserves user input in form | Negative | P2 |
| DS-3-TC-013 | Whitespace-only name via tabs and newlines rejected | Negative | P2 |
| DS-3-TC-014 | Reject name consisting only of zero-width or invisible characters | Negative | P3 |
| DS-3-TC-015 | Case-insensitive duplicate rejected on create | Edge | P2 |
| DS-3-TC-016 | Duplicate detected after trimming surrounding whitespace | Edge | P1 |
| DS-3-TC-017 | Program name at minimum length boundary (1 character) | Edge | P2 |
| DS-3-TC-018 | Program name at maximum length boundary | Edge | P2 |
| DS-3-TC-019 | Special characters including quotes, parentheses, and slashes | Edge | P2 |
| DS-3-TC-020 | Emoji in program name accepted or rejected per rules | Edge | P3 |
| DS-3-TC-021 | Edit to same name does not trigger false duplicate error | Edge | P2 |
| DS-3-TC-022 | Concurrent duplicate name creation handled safely | Edge | P2 |
| DS-3-TC-023 | HTML/script tags in name stored and displayed safely | Edge | P1 |
| DS-3-TC-024 | Duplicate check is case-only variation of existing name | Edge | P3 |

---

## Positive Flows

### DS-3-TC-001 — Accept program name with special characters

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; program creation form is open; no program named "Informatique & IA - Niveau 2" exists |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Accept program name with special characters
    Given I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully
    And the program list shows "Informatique & IA - Niveau 2"
```

**Expected Result**

- Program is persisted with the exact special characters preserved (after any defined trim rules).
- Modal closes and list updates with the new program name.

---

### DS-3-TC-002 — Accept valid alphanumeric program name

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program creation form is open; name is unique |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Accept standard alphanumeric program name
    Given I am on the program creation form
    When I enter "Web Development 2026" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully
```

**Expected Result**

- Standard names without special characters are accepted.
- No validation errors are shown.

---

### DS-3-TC-003 — Accept program name with internal whitespace

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program creation form is open; name is unique |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Accept name with internal spaces
    Given I am on the program creation form
    When I enter "Full   Stack   Web" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully
```

**Expected Result**

- Internal whitespace is preserved or normalized per product rules (multiple spaces collapsed or kept as entered).
- Name is not treated as empty.

---

### DS-3-TC-004 — Accept program name with Unicode and accented characters

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program creation form is open; name is unique |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Accept Unicode and accented characters in name
    Given I am on the program creation form
    When I enter "Programme Français — été 2026" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully
    And the program list shows "Programme Français — été 2026"
```

**Expected Result**

- Accented and non-ASCII characters are stored and displayed without corruption.

---

### DS-3-TC-005 — Valid name with leading/trailing whitespace trimmed and saved

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program creation form is open; no program named "Web Development 2026" |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Trim surrounding whitespace from valid name
    Given I am on the program creation form
    When I enter "  Web Development 2026  " as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully
    And the program list shows "Web Development 2026"
```

**Expected Result**

- Leading and trailing whitespace is trimmed before save.
- Trimmed name is used for duplicate checks and display.

---

## Negative Flows

### DS-3-TC-006 — Reject program name with only whitespace

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Reject program name with only whitespace
    Given I am on the program creation form
    When I enter "   " as the program name
    And I click Create
    Then the form is not submitted
    And the name is trimmed and treated as empty
```

**Expected Result**

- No program is created.
- Form remains open.
- Create button may be disabled and/or inline validation indicates empty name.

---

### DS-3-TC-007 — Reject empty program name

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Reject empty program name
    Given I am on the program creation form
    When I leave the program name field empty
    And I attempt to click Create
    Then the form is not submitted
    And no program is created
```

**Expected Result**

- Empty name is blocked before or at submission.
- Create button is disabled or submission is prevented with validation feedback.

---

### DS-3-TC-008 — Reject duplicate program name on create

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; program "Web Development 2026" already exists |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Reject duplicate program name
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "Web Development 2026" as the program name
    And I fill other required fields
    And I click Create
    Then I see an error indicating the name already exists
    And the program is not created
```

**Expected Result**

- Duplicate name is rejected with a clear error message.
- Existing program data is unchanged.
- Form stays open with user input retained.

---

### DS-3-TC-009 — Reject duplicate program name on edit

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; programs "Web Development 2026" and "Data Science Fundamentals" exist; edit form is open for "Web Development 2026" |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Reject duplicate name when editing
    Given a program "Web Development 2026" exists
    And a program "Data Science Fundamentals" exists
    And I am editing "Web Development 2026"
    When I change the program name to "Data Science Fundamentals"
    And I click Save
    Then I see an error indicating the name already exists
    And the program name remains "Web Development 2026"
```

**Expected Result**

- Duplicate prevention applies on edit as well as create.
- Original program is not overwritten.

---

### DS-3-TC-010 — Reject program name exceeding maximum length

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; program creation form is open; `MAX_NAME_LENGTH` placeholder: 255 characters |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Reject name over maximum length
    Given I am on the program creation form
    And the maximum allowed program name length is 255 characters
    When I enter a program name of 256 characters
    And I fill other required fields
    And I attempt to click Create
    Then the form is not submitted
    And I see a validation message indicating the name exceeds the maximum length
```

**Expected Result**

- Over-length names cannot be saved.
- User receives explicit length validation feedback.

---

### DS-3-TC-011 — Create button disabled for invalid name before submit

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Prevent submission when name is invalid
    Given I am on the program creation form
    When I enter "   " as the program name
    Then the Create button is disabled
```

**Expected Result**

- Client-side validation blocks invalid submit before API call when name is whitespace-only or empty.

---

### DS-3-TC-012 — Duplicate error preserves user input in form

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; program "Web Development 2026" exists; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Duplicate error retains form data
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "Web Development 2026" as the program name
    And I enter "Duplicate attempt description" in the Description field
    And I click Create
    Then I see an error indicating the name already exists
    And the program name field still contains "Web Development 2026"
    And the Description field still contains "Duplicate attempt description"
```

**Expected Result**

- User can correct the name without re-entering all fields.

---

### DS-3-TC-013 — Whitespace-only name via tabs and newlines rejected

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Reject whitespace-only name with tabs and newlines
    Given I am on the program creation form
    When I enter "\t\n  \t" as the program name
    And I click Create
    Then the form is not submitted
    And the name is trimmed and treated as empty
```

**Expected Result**

- All whitespace character types (spaces, tabs, newlines) are trimmed and treated as empty when they constitute the entire name.

---

### DS-3-TC-014 — Reject name consisting only of zero-width or invisible characters

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Reject invisible-only program name
    Given I am on the program creation form
    When I enter a program name consisting only of zero-width spaces
    And I click Create
    Then the form is not submitted
    And the name is treated as empty
```

**Expected Result**

- Invisible Unicode characters do not bypass empty-name validation.

---

## Edge Cases

### DS-3-TC-015 — Case-insensitive duplicate rejected on create

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program "Web Development 2026" exists; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Case-insensitive duplicate rejection
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "web development 2026" as the program name
    And I fill other required fields
    And I click Create
    Then I see an error indicating the name already exists
```

**Expected Result**

- Behavior matches product rule: duplicates rejected regardless of case (recommended) or allowed if case-sensitive (must be documented).

---

### DS-3-TC-016 — Duplicate detected after trimming surrounding whitespace

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program "Web Development 2026" exists; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Duplicate check uses trimmed name
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "  Web Development 2026  " as the program name
    And I fill other required fields
    And I click Create
    Then I see an error indicating the name already exists
```

**Expected Result**

- Duplicate detection compares trimmed values, not raw input with padding whitespace.

---

### DS-3-TC-017 — Program name at minimum length boundary (1 character)

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge / Boundary |
| **Preconditions** | User is logged in as admin; program creation form is open; no program named "A" |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Minimum length name accepted
    Given I am on the program creation form
    When I enter "A" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully
```

**Expected Result**

- Single non-whitespace character satisfies minimum length if min is 1.

---

### DS-3-TC-018 — Program name at maximum length boundary

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge / Boundary |
| **Preconditions** | User is logged in as admin; program creation form is open; `MAX_NAME_LENGTH` = 255 (placeholder); name is unique |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Maximum length name accepted
    Given I am on the program creation form
    And the maximum allowed program name length is 255 characters
    When I enter a program name of exactly 255 characters
    And I fill other required fields
    And I click Create
    Then the program is created successfully
```

**Expected Result**

- Name at exactly max length passes validation and is stored.

---

### DS-3-TC-019 — Special characters including quotes, parentheses, and slashes

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program creation form is open; name is unique |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Extended special characters in name
    Given I am on the program creation form
    When I enter "C++ / C# \"Advanced\" (2026)" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully
    And the program list shows "C++ / C# \"Advanced\" (2026)"
```

**Expected Result**

- Broader punctuation set beyond the AC example is accepted unless a denylist exists.

---

### DS-3-TC-020 — Emoji in program name accepted or rejected per rules

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program creation form is open; name is unique |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Emoji in program name
    Given I am on the program creation form
    When I enter "STEM Program 🎓 2026" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully or rejected with a clear validation message
```

**Expected Result**

- Emoji handling is consistent: either accepted with correct display or explicitly rejected with guidance.

---

### DS-3-TC-021 — Edit to same name does not trigger false duplicate error

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program "Web Development 2026" exists; edit form is open for that program |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Saving edit without renaming self is allowed
    Given a program "Web Development 2026" already exists
    And I am editing "Web Development 2026"
    When I change only the Description field
    And I leave the program name as "Web Development 2026"
    And I click Save
    Then the changes are saved successfully
    And I do not see a duplicate name error
```

**Expected Result**

- Duplicate check excludes the current program record when validating on edit.

---

### DS-3-TC-022 — Concurrent duplicate name creation handled safely

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | Two admin sessions; program creation form open in both; same unique name entered |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Concurrent create with same name
    Given no program named "Concurrent Test Program" exists
    And two admin users are on the program creation form
    When both users enter "Concurrent Test Program" as the program name
    And both users click Create at nearly the same time
    Then exactly one program named "Concurrent Test Program" is created
    And the other user sees an error indicating the name already exists
```

**Expected Result**

- Database uniqueness constraint or server-side validation prevents duplicate records under race conditions.

---

### DS-3-TC-023 — HTML/script tags in name stored and displayed safely

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Edge / Security |
| **Preconditions** | User is logged in as admin; program creation form is open; name is unique |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: HTML in program name handled safely
    Given I am on the program creation form
    When I enter "<b>Web Dev</b><script>alert(1)</script>" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created or rejected per security policy
    And no script is executed in the browser
    And displayed name is safely escaped if stored
```

**Expected Result**

- XSS vectors in names do not execute; storage and rendering follow security policy (accept as literal text or reject with validation).

---

### DS-3-TC-024 — Duplicate check is case-only variation of existing name

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program "WEB DEVELOPMENT 2026" exists; program creation form is open |

**Steps (Gherkin)**

```gherkin
Feature: Program name validation and duplicate prevention

  Scenario: Mixed-case duplicate of differently cased existing name
    Given a program "WEB DEVELOPMENT 2026" already exists
    And I am on the program creation form
    When I enter "web development 2026" as the program name
    And I fill other required fields
    And I click Create
    Then I see an error indicating the name already exists
```

**Expected Result**

- Confirms case-insensitive duplicate policy when existing record uses different casing.

---

## Traceability Matrix

| Acceptance Criterion | Covered By |
|---------------------|------------|
| Reject program name with only whitespace | DS-3-TC-006, DS-3-TC-011, DS-3-TC-013, DS-3-TC-014 |
| Accept program name with special characters | DS-3-TC-001, DS-3-TC-019 |
| Reject duplicate program name | DS-3-TC-008, DS-3-TC-009, DS-3-TC-015, DS-3-TC-016, DS-3-TC-022, DS-3-TC-024 |

---

## Ambiguities and Gaps in Acceptance Criteria

1. **Create vs edit scope** — All three scenarios reference the program creation form. Unclear whether identical validation rules apply on edit; DS-3-TC-009 and DS-3-TC-021 assume they do.

2. **Whitespace rejection mechanism** — AC states "click Create" then "form is not submitted" but does not specify whether the Create button should be disabled proactively (as in DS-1) or submission blocked on click.

3. **Trim behavior on valid names** — AC covers whitespace-only trim-to-empty but does not explicitly state that leading/trailing whitespace on valid names is trimmed before save (covered as inferred in DS-3-TC-005).

4. **Internal whitespace normalization** — No rule on collapsing multiple internal spaces (e.g., `"Full   Stack"` vs `"Full Stack"`).

5. **Maximum and minimum length** — No length limits specified in AC; boundary tests use placeholder max 255 and min 1.

6. **Allowed special character set** — AC provides one positive example (`&`, `-`) but does not define a full allowlist or denylist (slashes, quotes, HTML, emoji).

7. **Case sensitivity for duplicates** — AC uses exact string match in example; case-insensitive behavior is not defined.

8. **Duplicate error message copy** — Wording, placement (inline vs toast), and field highlight are unspecified.

9. **"Other required fields"** — Not enumerated; assumed to be Description or other fields from DS-1 create flow.

10. **Admin role** — Implied but not stated in AC scenarios.

11. **Server-side vs client-side validation** — No requirement that duplicate checks occur on the server; race-condition handling (DS-3-TC-022) is unspecified.

12. **Archived or soft-deleted programs** — Unclear whether a deleted/archived program name can be reused.

13. **Localization** — No guidance on duplicate checks across translated names or locale-normalized Unicode forms.

14. **Real-time vs on-submit validation** — Unclear whether duplicate/empty checks run on blur, while typing, or only on Create click.

15. **Network failure during duplicate check** — No AC for API timeout or error when validating uniqueness.
