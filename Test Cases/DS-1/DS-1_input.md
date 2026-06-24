# DS-1 — Input: Prompt & Jira Ticket

## Jira Ticket

| Field | Value |
|-------|-------|
| **Ticket ID** | DS-1 |
| **Feature Name** | Create new academic program |
| **Type** | Story |
| **Epic** | Didaxis Studio — Academic Programs |

### Description

As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.

### Acceptance Criteria

#### Scenario: Navigate to program creation form

- **Given** I am logged in as admin
- **When** I navigate to the Programs page
- **And** I click "+ New Program"
- **Then** I see the program creation form with fields: Program Name, Description

#### Scenario: Successfully create a program

- **Given** I am on the program creation form
- **When** I fill in Program Name with "Web Development 2026"
- **And** I fill in Description with "Full-stack web development program"
- **And** I click Create
- **Then** the modal closes
- **And** the program list shows "Web Development 2026"

#### Scenario: Validation prevents empty program name

- **Given** I am on the program creation form
- **When** I leave the Program Name field empty
- **Then** the Create button is disabled

---

## Original Prompt

Create the following folder structure:

```
Test Cases
 └── DS-1
```

Inside DS-1 create two files:

- `DS-1_input.md`
- `DS-1_output.md`

In `DS-1_input.md` store the complete prompt and Jira ticket information for DS-1.

In `DS-1_output.md` generate a detailed Markdown test plan in Gherkin format.

**Feature name:** Create new academic program

**Description:** As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.

**Acceptance Criteria:** (see Jira Ticket section above)

**Requirements:**

- All test cases must be in Gherkin.
- Cover every acceptance criterion.
- Add positive flows, negative flows and edge cases.
- Include boundary values, duplicates, special characters and max length.
- Use Markdown.
- Include IDs, Titles, Preconditions, Steps, Expected Results and Priority.
- At the end list ambiguities or gaps in the acceptance criteria.
