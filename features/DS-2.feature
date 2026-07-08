Feature: Edit existing program details
  DS-2 — As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

  # Happy paths

  @TC-001 @AC-OpenForEditing
  Scenario: Admin opens program for editing with pre-populated form
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists
    When I click the edit icon on "Web Development 2026"
    Then I see the edit form
    And the Program Name field is pre-populated with "Web Development 2026"
    And the Description field is pre-populated with the program's current description

  @TC-002 @AC-SuccessfullyEditName
  Scenario: Admin successfully edits a program name
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"

  @TC-003 @AC-PreservesUnchangedFields
  Scenario: Edit preserves unchanged fields when only Description changes
    Given I am editing a program with Name "Web Development 2026"
    And the program Description is "Full-stack web development program"
    When I only change the Description to "Updated full-stack curriculum"
    And I click Save
    Then the modal closes
    And the program list shows Name "Web Development 2026"
    And the program Description is "Updated full-stack curriculum"

  @TC-004
  Scenario: Admin edits description only without changing name
    Given I am editing a program with Name "Data Science Fundamentals"
    When I change the Description to "Revised introductory data science curriculum"
    And I leave the Program Name unchanged
    And I click Save
    Then the modal closes
    And the program list shows "Data Science Fundamentals"

  @TC-005
  Scenario: Admin edits both name and description
    Given I am editing "Cybersecurity Basics"
    When I change the Program Name to "Cybersecurity Essentials"
    And I change the Description to "Foundational security concepts and practices"
    And I click Save
    Then the modal closes
    And the program list shows "Cybersecurity Essentials"

  @TC-006
  Scenario: Program list updates without page refresh after save
    Given I am editing a program named "No Refresh Edit Test"
    When I change the Program Name to "No Refresh Edit Test - Saved"
    And I click Save
    Then the modal closes
    And the program list shows "No Refresh Edit Test - Saved"
    And I have not reloaded the page

  @TC-007
  Scenario: Cancel edit discards changes
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Should Not Be Saved"
    And I click Cancel
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-008
  Scenario: Save with no changes keeps existing data
    Given I am editing a program with Name "Unchanged Program"
    And I have not modified any field
    When I click Save
    Then the modal closes
    And the program list shows "Unchanged Program"

  @TC-031
  Scenario: Editor role can edit an existing program
    Given I am logged in as an editor
    And I am on the Programs page
    And a program "Web Development 2026" exists
    When I click the edit icon on "Web Development 2026"
    And I change the Program Name to "Web Development 2026 - Editor Update"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Editor Update"

  @TC-032
  Scenario: Close edit modal via X button discards changes
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Should Not Be Saved"
    And I click the X button on the modal
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-033
  Scenario: Close edit modal by clicking outside discards changes
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Should Not Be Saved"
    And I click outside the modal
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-034
  Scenario: Edit form pre-populates AI Generation Config fields
    Given I am on the Programs page
    And a program exists with Total Hours 120 and Default Session Hours 4
    When I click the edit icon on that program
    Then I see the edit form
    And the collapsible "AI Generation Config" section shows Total Hours 120
    And Default Session Hours is pre-populated with 4

  # Negative

  @TC-009
  Scenario: Save button disabled when program name is cleared
    Given I am editing a program
    When I clear the Program Name field
    Then the Save button is disabled
    And no changes are persisted

  @TC-010
  Scenario: Reject duplicate program name on edit
    Given I am editing "Web Development 2026"
    And a program named "Data Science Fundamentals" already exists
    When I change the Program Name to "Data Science Fundamentals"
    And I click Save
    Then the program is not updated
    And I see an error message indicating the program name already exists
    And the modal remains open

  @TC-011
  Scenario: Viewer role cannot edit a program
    Given I am logged in as a viewer
    And I am on the Programs page
    And a program "Web Development 2026" exists
    Then I do not see an edit icon on "Web Development 2026"

  @TC-012
  Scenario: Unauthenticated user cannot access edit form
    Given I am not logged in
    When I attempt to navigate to the program edit form directly
    Then I am redirected to the login page

  @TC-013
  Scenario: Reject program name exceeding maximum length
    Given I am editing a program
    And the maximum allowed Program Name length is 100 characters
    When I change the Program Name to a string of 101 characters
    Then the Save button is disabled or an inline validation error is shown
    And no changes are persisted

  @TC-014
  Scenario: Reject description exceeding maximum length
    Given I am editing a program
    And the maximum allowed Description length is 500 characters
    When I change the Description to a string of 501 characters
    Then the Save button is disabled or an inline validation error is shown
    And no changes are persisted

  @TC-015
  Scenario: Whitespace-only program name treated as empty
    Given I am editing a program
    When I change the Program Name to "   "
    Then the Save button is disabled

  @TC-016
  Scenario: Malicious input handled safely on save
    Given I am editing a program
    When I change the Program Name to "<script>alert('xss')</script>"
    And I change the Description to "'; DROP TABLE programs; --"
    And I click Save
    Then no script is executed in the browser
    And the program list displays the literal text without rendering HTML

  @TC-017
  Scenario: Edit fails gracefully on server error
    Given I am editing a program
    When I change the Program Name to "Valid Updated Name"
    And I click Save
    And the server returns an error
    Then the modal remains open or an error message is displayed
    And the program list still shows the original program name

  @TC-018
  Scenario: Cannot edit a program deleted by another user
    Given I am editing "Web Development 2026"
    And the program is deleted by another admin
    When I change the Program Name to "Web Development 2026 - Updated"
    And I click Save
    Then I see an error indicating the program no longer exists
    And the program list does not show "Web Development 2026 - Updated"

  # Edge cases

  @TC-019
  Scenario: Program name at minimum length boundary
    Given I am editing a program
    When I change the Program Name to "A"
    And I click Save
    Then the modal closes
    And the program list shows "A"

  @TC-020
  Scenario: Program name at maximum length boundary
    Given I am editing a program
    And the maximum allowed Program Name length is 100 characters
    When I change the Program Name to a string of exactly 100 characters
    And I click Save
    Then the modal closes
    And the program list shows the 100-character name

  @TC-021
  Scenario: Description at maximum length boundary
    Given I am editing a program
    And the maximum allowed Description length is 500 characters
    When I change the Description to a string of exactly 500 characters
    And I click Save
    Then the modal closes
    And the saved description is 500 characters long

  @TC-022
  Scenario: Program name with leading and trailing whitespace is trimmed
    Given I am editing a program
    When I change the Program Name to "  Web Development 2026 - Updated  "
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026 - Updated"

  @TC-023
  Scenario: Program name with special characters is accepted
    Given I am editing a program
    When I change the Program Name to "C++ & C# — Advanced (2026)"
    And I click Save
    Then the modal closes
    And the program list shows "C++ & C# — Advanced (2026)"

  @TC-024
  Scenario: Description with special characters and line breaks is accepted
    Given I am editing a program
    When I change the Description to "Line 1: HTML <tags> & symbols\nLine 2: \"quoted\" text"
    And I click Save
    Then the modal closes
    And the saved description preserves line breaks and special characters

  @TC-025
  Scenario: Unicode and emoji characters in edited fields are accepted
    Given I am editing a program
    When I change the Program Name to "プログラム 🎓 2026"
    And I click Save
    Then the modal closes
    And the program list shows "プログラム 🎓 2026"

  @TC-026
  Scenario: Saving with unchanged name does not trigger duplicate error
    Given I am editing "Web Development 2026"
    When I change the Description to "Updated description only"
    And I leave the Program Name as "Web Development 2026"
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-027
  Scenario: Case-only rename triggers duplicate detection
    Given I am editing "Web Development 2026"
    And a program named "Data Science Fundamentals" already exists
    When I change the Program Name to "data science fundamentals"
    And I click Save
    Then the program is not updated
    And I see an error message indicating the program name already exists

  @TC-028
  Scenario: Rapid double-click on Save does not corrupt data
    Given I am editing a program
    And I have changed the Program Name to "Double Click Save Test"
    When I double-click the Save button quickly
    Then exactly one program named "Double Click Save Test" exists
    And no duplicate records or errors occur

  @TC-029
  Scenario: Clear description to empty string
    Given I am editing a program with a non-empty Description
    When I clear the Description field
    And I click Save
    Then the modal closes
    And the program Description is empty
    And the Name remains unchanged

  @TC-030
  Scenario: Save button re-enabled after correcting invalid name
    Given I am editing a program
    When I clear the Program Name field
    Then the Save button is disabled
    When I fill in the Name with "Valid Program Name"
    Then the Save button is enabled

  # Ambiguities and gaps
  # - Jira AC uses "Name"; UI label is "Program Name". Tests use UI label.
  # - Jira story says "admin user" but Confluence allows EDITOR role; tests cover both.
  # - Maximum field lengths not in Jira AC (assumed 100 / 500 from Confluence Field Definitions).
  # - Rename to same name without other changes: unclear if save should succeed silently (TC-008, TC-026).
  # - Case sensitivity for duplicate detection is not defined (TC-027).
  # - Description required vs optional on edit is unclear (TC-029).
  # - Success feedback (toast, audit log, last updated timestamp) is not specified.
  # - Concurrent edits by two admins are not addressed.
  # - Archived program state and curriculum impact of rename are not specified.
  # - List sort order after rename and network timeout/offline behavior are not defined.
  # - Accessibility (focus management, screen reader) is not covered in AC.
