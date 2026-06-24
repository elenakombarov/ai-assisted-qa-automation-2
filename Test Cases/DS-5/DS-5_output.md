# DS-5 — Test Plan: Program List Filtering and Display

| Field | Value |
|-------|-------|
| **Feature** | Program list filtering and display |
| **Ticket** | DS-5 |
| **Author** | QA |
| **Last Updated** | 2026-06-22 |

---

## Test Case Summary

| ID | Title | Group | Priority |
|----|-------|-------|----------|
| DS-5-TC-001 | Display program list with name and description | Positive | P1 |
| DS-5-TC-002 | Empty state when no programs exist | Positive | P1 |
| DS-5-TC-003 | Display multiple programs in list | Positive | P1 |
| DS-5-TC-004 | Program with empty description still appears in list | Positive | P2 |
| DS-5-TC-005 | List shows newly created program without reload | Positive | P2 |
| DS-5-TC-006 | List shows updated program details after edit | Positive | P2 |
| DS-5-TC-007 | Program removed from list after deletion | Positive | P2 |
| DS-5-TC-008 | Create-first-program prompt navigates to creation flow | Positive | P2 |
| DS-5-TC-009 | Non-admin user can view program list | Positive | P2 |
| DS-5-TC-010 | Unauthenticated user cannot access Programs page | Negative | P1 |
| DS-5-TC-011 | List fails gracefully on server error | Negative | P1 |
| DS-5-TC-012 | Empty state not shown when programs exist | Negative | P2 |
| DS-5-TC-013 | Program list not shown when fetch returns empty due to error | Negative | P2 |
| DS-5-TC-014 | List does not expose admin-only actions to non-admin | Negative | P2 |
| DS-5-TC-015 | Program name with special characters displayed correctly | Edge | P2 |
| DS-5-TC-016 | Description with special characters and line breaks displayed | Edge | P2 |
| DS-5-TC-017 | Program name at maximum length displayed in list | Edge | P2 |
| DS-5-TC-018 | Description at maximum length displayed or truncated | Edge | P2 |
| DS-5-TC-019 | Unicode and emoji in name and description displayed | Edge | P3 |
| DS-5-TC-020 | HTML/script in name and description rendered safely | Edge | P1 |
| DS-5-TC-021 | Single program in list displays correctly | Edge | P2 |
| DS-5-TC-022 | Large number of programs displayed performantly | Edge | P2 |
| DS-5-TC-023 | Program name at minimum length (1 character) displayed | Edge | P3 |
| DS-5-TC-024 | List order is consistent and predictable | Edge | P2 |
| DS-5-TC-025 | Empty state after deleting last program | Edge | P2 |

---

## Positive Flows

### DS-5-TC-001 — Display program list with name and description

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; at least one program exists with known name and description |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Display program list with key details
    Given I am logged in as admin
    And programs exist in the system
    When I navigate to the Programs page
    Then I see a list of programs
    And each program shows its name
    And each program shows its description
```

**Expected Result**

- Programs page loads successfully.
- Every existing program is represented in the list.
- Both name and description are visible for each entry.

---

### DS-5-TC-002 — Empty state when no programs exist

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive — Acceptance Criterion |
| **Preconditions** | User is logged in as admin; no programs exist in the system |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Empty state when no programs exist
    Given I am logged in as admin
    And no programs exist
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program
```

**Expected Result**

- Empty state message is clear and user-friendly.
- Create-first-program prompt is visible and actionable (e.g., button or link).
- No program rows are displayed.

---

### DS-5-TC-003 — Display multiple programs in list

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; at least three programs exist with distinct names and descriptions |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Display multiple programs
    Given I am logged in as admin
    And programs "Web Development 2026", "Data Science Fundamentals", and "Cybersecurity Basics" exist
    When I navigate to the Programs page
    Then I see all three programs in the list
    And each program shows its name and description
```

**Expected Result**

- All programs are listed without omission.
- Each row maps to the correct name and description.

---

### DS-5-TC-004 — Program with empty description still appears in list

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program exists with a name and empty description |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Program with empty description in list
    Given I am logged in as admin
    And a program "No Description Program" exists with an empty description
    When I navigate to the Programs page
    Then I see "No Description Program" in the list
    And the description area shows empty state, placeholder, or em dash per UI spec
```

**Expected Result**

- Program appears in list even without description.
- Empty description handled gracefully (not blank broken layout).

---

### DS-5-TC-005 — List shows newly created program without reload

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; on Programs page; creation flow available |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: List updates after creating a program
    Given I am logged in as admin
    And I am on the Programs page
    When I create a new program named "New List Entry Program"
    Then the program list shows "New List Entry Program" with its description
    And I have not reloaded the page
```

**Expected Result**

- New program appears in list immediately after successful creation.

---

### DS-5-TC-006 — List shows updated program details after edit

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program "Web Development 2026" exists on Programs page |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: List reflects edited program details
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists
    When I edit the program name to "Web Development 2026 - Updated"
    And I save the changes
    Then the program list shows "Web Development 2026 - Updated"
    And the updated description is displayed
```

**Expected Result**

- List reflects latest name and description without page reload.

---

### DS-5-TC-007 — Program removed from list after deletion

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; program "Delete From List Test" exists on Programs page |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: List updates after program deletion
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Delete From List Test" exists
    When I delete "Delete From List Test" and confirm
    Then "Delete From List Test" is no longer shown in the program list
```

**Expected Result**

- Deleted program is removed from list view immediately.

---

### DS-5-TC-008 — Create-first-program prompt navigates to creation flow

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in as admin; no programs exist |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Empty state create prompt opens creation flow
    Given I am logged in as admin
    And no programs exist
    When I navigate to the Programs page
    And I click the prompt to create the first program
    Then I see the program creation form
```

**Expected Result**

- Create prompt is interactive and opens the same creation flow as "+ New Program" (if present).

---

### DS-5-TC-009 — Non-admin user can view program list

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive |
| **Preconditions** | User is logged in with non-admin role; programs exist |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Non-admin views program list
    Given I am logged in as a non-admin user
    And programs exist in the system
    When I navigate to the Programs page
    Then I see a list showing each program's name and description
```

**Expected Result**

- Read access to list is available to non-admin if product allows viewing (admin-only management actions may be hidden).

---

## Negative Flows

### DS-5-TC-010 — Unauthenticated user cannot access Programs page

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | No active user session |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Unauthenticated user redirected from Programs page
    Given I am not logged in
    When I navigate to the Programs page
    Then I am redirected to the login page
    And I do not see the program list
```

**Expected Result**

- Programs page requires authentication.

---

### DS-5-TC-011 — List fails gracefully on server error

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; programs API returns an error |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Server error loading program list
    Given I am logged in as admin
    And the programs API returns an error
    When I navigate to the Programs page
    Then I see an error message indicating programs could not be loaded
    And I do not see a misleading empty state
```

**Expected Result**

- Error state is distinct from legitimate empty state.
- User can retry or navigate away without broken UI.

---

### DS-5-TC-012 — Empty state not shown when programs exist

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; at least one program exists |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Empty state hidden when programs exist
    Given I am logged in as admin
    And programs exist in the system
    When I navigate to the Programs page
    Then I do not see the empty state message
    And I see the program list
```

**Expected Result**

- Empty state and populated list are mutually exclusive.

---

### DS-5-TC-013 — Program list not shown when fetch returns empty due to error

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as admin; programs exist but API returns 500 |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Distinguish error from true empty list
    Given I am logged in as admin
    And programs exist in the system
    And the programs API returns a server error
    When I navigate to the Programs page
    Then I see an error state
    And I do not see "no programs have been created"
```

**Expected Result**

- True empty state message is not shown on fetch failure.

---

### DS-5-TC-014 — List does not expose admin-only actions to non-admin

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative |
| **Preconditions** | User is logged in as non-admin; programs exist |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Non-admin list is read-only
    Given I am logged in as a non-admin user
    And programs exist in the system
    When I navigate to the Programs page
    Then I see program names and descriptions
    And I do not see create, edit, or delete controls
```

**Expected Result**

- List display is appropriate for role; management actions hidden if unauthorized.

---

## Edge Cases

### DS-5-TC-015 — Program name with special characters displayed correctly

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program "Informatique & IA - Niveau 2" exists with a description |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Special characters in program name
    Given I am logged in as admin
    And a program "Informatique & IA - Niveau 2" exists
    When I navigate to the Programs page
    Then I see "Informatique & IA - Niveau 2" displayed correctly in the list
```

**Expected Result**

- Ampersands, hyphens, and accents render without HTML encoding artifacts or truncation errors.

---

### DS-5-TC-016 — Description with special characters and line breaks displayed

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program exists with multiline description containing quotes and symbols |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Multiline description in list
    Given I am logged in as admin
    And a program exists with description "Line 1: HTML <tags> & symbols\nLine 2: \"quoted\" text"
    When I navigate to the Programs page
    Then the program description is displayed safely and readably in the list
```

**Expected Result**

- Long or multiline descriptions are truncated, wrapped, or expanded per UI spec without breaking layout.

---

### DS-5-TC-017 — Program name at maximum length displayed in list

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge / Boundary |
| **Preconditions** | User is logged in as admin; program with 255-character name exists (`MAX_NAME_LENGTH` placeholder) |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Maximum length name in list
    Given I am logged in as admin
    And a program with a name of exactly 255 characters exists
    When I navigate to the Programs page
    Then the program name is displayed in the list
    And the name is fully visible or truncated with tooltip per UI spec
```

**Expected Result**

- Max-length names do not overflow or break list layout.

---

### DS-5-TC-018 — Description at maximum length displayed or truncated

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge / Boundary |
| **Preconditions** | User is logged in as admin; program with 2000-character description exists (`MAX_DESC_LENGTH` placeholder) |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Maximum length description in list
    Given I am logged in as admin
    And a program exists with a description of exactly 2000 characters
    When I navigate to the Programs page
    Then the description is displayed or truncated consistently in the list
```

**Expected Result**

- Long descriptions handled with ellipsis, expand, or detail view without performance degradation.

---

### DS-5-TC-019 — Unicode and emoji in name and description displayed

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; program "プログラム 🎓 2026" exists with Unicode description |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Unicode and emoji in list display
    Given I am logged in as admin
    And a program "プログラム 🎓 2026" exists
    When I navigate to the Programs page
    Then I see "プログラム 🎓 2026" and its description displayed without encoding issues
```

**Expected Result**

- Unicode and emoji render correctly across browsers.

---

### DS-5-TC-020 — HTML/script in name and description rendered safely

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 |
| **Type** | Edge / Security |
| **Preconditions** | User is logged in as admin; program with literal HTML in name and description exists |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: HTML in list fields does not execute
    Given I am logged in as admin
    And a program named "<script>alert('xss')</script>" exists
    When I navigate to the Programs page
    Then the program name is displayed as literal text
    And no script executes in the browser
```

**Expected Result**

- List output is escaped; XSS vectors do not run.

---

### DS-5-TC-021 — Single program in list displays correctly

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; exactly one program exists |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Single program list
    Given I am logged in as admin
    And exactly one program "Sole Program" exists
    When I navigate to the Programs page
    Then I see one program in the list
    And I see "Sole Program" with its description
    And I do not see the empty state message
```

**Expected Result**

- Single-item list renders correctly; not confused with empty state.

---

### DS-5-TC-022 — Large number of programs displayed performantly

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; 100+ programs exist (or paginated dataset) |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Large program list
    Given I am logged in as admin
    And 100 or more programs exist in the system
    When I navigate to the Programs page
    Then I see the program list load within acceptable time
    And all programs are accessible via scroll or pagination
```

**Expected Result**

- List remains usable at scale (pagination, virtual scroll, or performance budget met).

---

### DS-5-TC-023 — Program name at minimum length (1 character) displayed

| Attribute | Value |
|-----------|-------|
| **Priority** | P3 |
| **Type** | Edge / Boundary |
| **Preconditions** | User is logged in as admin; program "A" exists |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Minimum length name in list
    Given I am logged in as admin
    And a program "A" exists
    When I navigate to the Programs page
    Then I see "A" in the program list with its description
```

**Expected Result**

- Single-character names display without layout collapse.

---

### DS-5-TC-024 — List order is consistent and predictable

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; multiple programs exist with known creation order |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Consistent list ordering
    Given I am logged in as admin
    And multiple programs exist
    When I navigate to the Programs page
    Then programs appear in a consistent order
    And reloading the page preserves the same order
```

**Expected Result**

- Sort order is defined (alphabetical, created date, or manual) and stable across visits.

---

### DS-5-TC-025 — Empty state after deleting last program

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Edge |
| **Preconditions** | User is logged in as admin; exactly one program exists |

**Steps (Gherkin)**

```gherkin
Feature: Program list filtering and display

  Scenario: Transition to empty state after last delete
    Given I am logged in as admin
    And exactly one program "Last Program" exists
    And I am on the Programs page
    When I delete "Last Program" and confirm
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program
```

**Expected Result**

- List transitions from populated to empty state without page reload.
- Empty state matches DS-5-TC-002 content.

---

## Traceability Matrix

| Acceptance Criterion | Covered By |
|---------------------|------------|
| Display program list with key details | DS-5-TC-001, DS-5-TC-003, DS-5-TC-004, DS-5-TC-009 |
| Empty state when no programs exist | DS-5-TC-002, DS-5-TC-008, DS-5-TC-025 |

---

## Ambiguities and Gaps in Acceptance Criteria

1. **Filtering not in AC** — Feature title includes "filtering and display" but no acceptance criteria cover search, filter, or sort behavior.

2. **Admin role implicit** — Description mentions admin user; AC scenarios do not include login or role preconditions.

3. **List layout and columns** — AC requires name and description but not edit/delete icons, dates, status, or row actions.

4. **Sort order** — No specification for how programs are ordered in the list.

5. **Pagination vs scroll** — No criteria for large lists (100+ programs).

6. **Description display rules** — Unclear whether full description, truncated text, or tooltip is shown in list view.

7. **Empty description display** — No AC for programs with blank description in a populated list.

8. **Create prompt behavior** — AC requires prompt to exist but not whether it is a button, link, or navigates to create form.

9. **"+ New Program" on populated list** — Unclear if create action is shown when programs exist (only empty-state prompt is specified).

10. **Non-admin access** — Unclear whether non-admins can view the list or if page is admin-only.

11. **Error vs empty state** — No distinction between zero programs and failed API load.

12. **Max length display** — No rules for truncating long names or descriptions in list cells.

13. **Real-time updates** — AC does not require list to update after create/edit/delete without reload (covered as inferred positive tests).

14. **Accessibility** — No requirements for table semantics, list landmarks, or screen reader labels.

15. **Localization** — No guidance on RTL text or locale-specific sorting in list display.

16. **Duplicate names** — If prevented by DS-3, list always shows unique names; visual similarity edge case not addressed in AC.

17. **Loading state** — No acceptance criteria for skeleton/spinner while programs are fetching.
