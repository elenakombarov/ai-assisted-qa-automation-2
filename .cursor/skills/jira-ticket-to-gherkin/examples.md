# Example: DS-1 → features/DS-1.feature

Derived from Jira ticket DS-1 (Create new academic program). The ticket's three acceptance criteria are covered, plus negative and edge scenarios. Values come from the ticket — no placeholders.

## Source acceptance criteria (from Jira)

1. Navigate to program creation form — admin opens Programs, clicks "+ New Program", sees Program Name and Description fields.
2. Successfully create a program — fill "Web Development 2026" / "Full-stack web development program", click Create, modal closes, program appears in list.
3. Validation prevents empty program name — empty Program Name disables the Create button.

## Output file: features/DS-1.feature

```gherkin
Feature: Create new academic program
  DS-1 — As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.

  # Happy paths

  @TC-001 @AC-NavigateToForm
  Scenario: Admin opens the program creation form
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form
    And the form displays a "Program Name" field
    And the form displays a "Description" field

  @TC-002 @AC-SuccessfullyCreate
  Scenario: Admin creates a program with valid data
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-003 @AC-SuccessfullyCreate
  Scenario: Admin creates a program with empty description
    Given I am on the program creation form
    When I fill in Program Name with "Data Science Fundamentals"
    And I leave the Description field empty
    And I click Create
    Then the modal closes
    And the program list shows "Data Science Fundamentals"

  @TC-004 @AC-SuccessfullyCreate
  Scenario: New program appears in list without page refresh
    Given I am on the program creation form
    And I have filled in Program Name with "Cloud Architecture 2026"
    And I have filled in Description with "AWS and Azure fundamentals"
    When I click Create
    Then the program list shows "Cloud Architecture 2026"
    And I have not refreshed the page

  # Negative

  @TC-005 @AC-EmptyNameValidation
  Scenario: Create button disabled when Program Name is empty
    Given I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled

  @TC-006
  Scenario: Non-admin user cannot access program creation
    Given I am logged in as viewer
    When I navigate to the Programs page
    Then I do not see a "+ New Program" button

  @TC-007
  Scenario: Unauthenticated user cannot access Programs page
    Given I am not logged in
    When I navigate to the Programs page
    Then I am redirected to the login page

  @TC-008
  Scenario: Duplicate program name is rejected
    Given I am on the program creation form
    And a program named "Web Development 2026" already exists
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Duplicate attempt"
    And I click Create
    Then the modal remains open
    And the program list contains exactly one program named "Web Development 2026"

  @TC-009
  Scenario: Program name with only whitespace is treated as empty
    Given I am on the program creation form
    When I fill in Program Name with "   "
    Then the Create button is disabled

  # Edge cases

  @TC-010
  Scenario: Program name with leading and trailing whitespace is trimmed
    Given I am on the program creation form
    When I fill in Program Name with "  Mobile Development  "
    And I fill in Description with "iOS and Android curriculum"
    And I click Create
    Then the program list shows "Mobile Development"

  @TC-011
  Scenario: Program name with special characters is accepted
    Given I am on the program creation form
    When I fill in Program Name with "AI/ML & Data (2026)"
    And I fill in Description with "Machine learning track"
    And I click Create
    Then the program list shows "AI/ML & Data (2026)"

  @TC-012
  Scenario: Description with special characters and line breaks is accepted
    Given I am on the program creation form
    When I fill in Program Name with "Technical Writing"
    And I fill in Description with "Topics:\n- Docs\n- API guides"
    And I click Create
    Then the modal closes
    And the program list shows "Technical Writing"

  @TC-013
  Scenario: Program name at minimum length boundary
    Given I am on the program creation form
    When I fill in Program Name with "A"
    And I click Create
    Then the modal closes
    And the program list shows "A"

  @TC-014
  Scenario: Program name at maximum length boundary
    Given I am on the program creation form
    When I fill in Program Name with a 100-character name
    And I click Create
    Then the modal closes
    And the program list shows the 100-character name

  @TC-015
  Scenario: Program name exceeding maximum length is rejected
    Given I am on the program creation form
    When I fill in Program Name with a 101-character name
    Then the Create button is disabled or an inline validation error is shown
    And no program is created

  @TC-016
  Scenario: Rapid double-click on Create does not duplicate program
    Given I am on the program creation form
    And I have filled in Program Name with "Double Click Test"
    And I have filled in Description with "Idempotency check"
    When I double-click the Create button quickly
    Then exactly one program named "Double Click Test" exists in the program list

  @TC-017
  Scenario: SQL injection and XSS strings are handled safely
    Given I am on the program creation form
    When I fill in Program Name with "<script>alert('xss')</script>"
    And I fill in Description with "'; DROP TABLE programs; --"
    And I click Create
    Then the program is stored without executing scripts or SQL
    And the program list displays the literal text without rendering HTML

  # Ambiguities and gaps
  # - Maximum field lengths for Program Name and Description are not specified in the ticket (assumed 100 / 500 from Confluence).
  # - Description required vs optional is unclear; empty-description scenario outcome depends on product decision.
  # - Duplicate program names are not addressed in AC; rejection behavior is assumed.
  # - Case sensitivity for duplicate detection is not defined ("Web Development 2026" vs "web development 2026").
  # - Whitespace trimming is not mentioned in AC; trimming behavior is assumed.
  # - UI pattern (modal vs page) and Cancel/Close/Esc behavior are not specified.
  # - Non-admin and unauthenticated access are out of scope in AC but covered as inferred negative tests.
  # - Success feedback (toast, audit log) and list sort order for new programs are not defined.
  # - Allowed character set and validation error message copy are not specified.
  # - Network failure, concurrent creation, accessibility, and localization are not covered in AC.
```
