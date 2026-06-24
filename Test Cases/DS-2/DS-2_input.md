# DS-2 — Input: Prompt & Jira Ticket

## Jira Ticket

| Field | Value |
|-------|-------|
| **Ticket ID** | DS-2 |
| **Feature Name** | Edit existing program details |
| **Type** | Story |
| **Epic** | Didaxis Studio — Academic Programs |

### Description

As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

### Acceptance Criteria

#### Scenario: Open program for editing

- **Given** I am on the Programs page
- **And** a program "Web Development 2026" exists
- **When** I click the edit icon on "Web Development 2026"
- **Then** I see the edit form pre-populated with the program's current data

#### Scenario: Successfully edit a program name

- **Given** I am editing "Web Development 2026"
- **When** I change the Name to "Web Development 2026 - Updated"
- **And** I click Save
- **Then** the modal closes
- **And** the program list immediately shows "Web Development 2026 - Updated"

#### Scenario: Edit preserves unchanged fields

- **Given** I am editing a program
- **When** I only change the Description
- **And** I click Save
- **Then** the Name and other fields remain unchanged

---

## Original Prompt

Create folder `Test Cases/DS-2`.

Create two files:

- `Test Cases/DS-2/DS-2_input.md`
- `Test Cases/DS-2/DS-2_output.md`

Store the complete prompt and Jira ticket details in `DS-2_input.md`.

Generate a detailed Markdown test plan in Gherkin format and store it in `DS-2_output.md`.

**Feature name:** Edit existing program details

**Description:** As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

**Acceptance Criteria:** (see Jira Ticket section above)

**Requirements:**

- All test cases must be in Gherkin.
- Cover every acceptance criterion.
- Add positive flows, negative flows and edge cases.
- Include boundary values, empty inputs, duplicate names, special characters and max length.
- Include IDs, Titles, Preconditions, Steps, Expected Results and Priority.
- Group test cases by Positive flows, Negative flows and Edge cases.
- Use Markdown.
- At the end list ambiguities or gaps in the acceptance criteria.
