# DS-3 — Input: Prompt & Jira Ticket

## Jira Ticket

| Field | Value |
|-------|-------|
| **Ticket ID** | DS-3 |
| **Feature Name** | Program name validation and duplicate prevention |
| **Type** | Story |
| **Epic** | Didaxis Studio — Academic Programs |

### Description

As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

### Acceptance Criteria

#### Scenario: Reject program name with only whitespace

- **Given** I am on the program creation form
- **When** I enter `"   "` as the program name
- **And** I click Create
- **Then** the form is not submitted (name is trimmed, treated as empty)

#### Scenario: Accept program name with special characters

- **Given** I am on the program creation form
- **When** I enter `"Informatique & IA - Niveau 2"` as the program name
- **And** I fill other required fields
- **And** I click Create
- **Then** the program is created successfully

#### Scenario: Reject duplicate program name

- **Given** a program `"Web Development 2026"` already exists
- **When** I try to create a new program with the same name
- **Then** I see an error indicating the name already exists

---

## Original Prompt

Create folder `Test Cases/DS-3`.

Create file `DS-3_input.md` and store the full Jira ticket below.

Create file `DS-3_output.md` and generate a detailed test plan using the prompt template requirements:

- All test cases in Gherkin.
- Positive flows.
- Negative flows.
- Edge cases.
- ID, Title, Preconditions, Steps, Expected Result, Priority.
- Markdown format.
- List ambiguities at the end.

**Feature name:** Program name validation and duplicate prevention

**Description:** As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

**Acceptance Criteria:** (see Jira Ticket section above)
