# DS-4 — Input: Prompt & Jira Ticket

## Jira Ticket

Delete program with confirmation

### Description

As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

### Acceptance Criteria

#### Scenario: Delete program with confirmation

- **Given** a program "Test Program" exists
- **When** I click the delete icon for "Test Program"
- **Then** I see a confirmation dialog
- **When** I confirm deletion
- **Then** "Test Program" is removed from the program list

#### Scenario: Cancel program deletion

- **Given** I click the delete icon for a program
- **When** I see the confirmation dialog
- **And** I click Cancel
- **Then** the program still exists in the list

---

## Original Prompt

Create folder `Test Cases/DS-4`.

Create file `DS-4_input.md` and store the full Jira ticket below exactly as provided.

Create file `DS-4_output.md` and generate a detailed test plan using the prompt template requirements:

- All test cases must be in Gherkin.
- Cover every acceptance criterion with at least one test case.
- Add positive flows.
- Add negative flows.
- Add edge cases (empty inputs, duplicates, special characters, max length, boundary values).
- Each test case must contain:
  - ID
  - Title
  - Preconditions
  - Steps
  - Expected Result
  - Priority
- Group test cases into Positive flows, Negative flows, and Edge cases.
- Use Markdown format.
- List ambiguities or gaps in the acceptance criteria at the end.
