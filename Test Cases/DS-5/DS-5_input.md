# DS-5 — Input: Prompt & Jira Ticket

## Jira Ticket

Program list filtering and display

### Description

As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.

### Acceptance Criteria

#### Scenario: Display program list with key details

- **Given** programs exist in the system
- **When** I navigate to the Programs page
- **Then** I see a list showing each program's name and description

#### Scenario: Empty state when no programs exist

- **Given** no programs exist
- **When** I navigate to the Programs page
- **Then** I see a message indicating no programs have been created
- **And** I see a prompt to create the first program

---

## Original Prompt

Create folder `Test Cases/DS-5`.

Create file `DS-5_input.md` and store the full Jira ticket below exactly as provided.

Create file `DS-5_output.md` and generate a detailed test plan using the prompt template requirements:

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
