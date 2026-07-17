---
name: pom-conventions
description: Page Object Model conventions for Playwright tests in this project. Apply whenever generating, refactoring, or reviewing any Playwright test that interacts with the Didaxis UI — even if the user doesn't say "POM". Tests should never contain inline locators.
---

# Page Object Model Conventions

All UI interactions go through Page Objects in `pages/`. Tests describe intent; POMs handle mechanics.

## Steps

1. One Page Object class per page or distinct component.
   Examples: `LoginPage`, `ProgramsPage`, `NewProgramModal`.

2. Define locators as `readonly` properties in the constructor, using `getByRole`, `getByLabel`, or `getByText` — never CSS selectors or XPath.

3. Provide methods for user actions such as `goto()`, `clickX()`, `fillY()`, `submit()`, `openNewProgramForm()`, `createProgram()`.
   Methods perform actions only; they do **not** contain assertions.

4. No assertions inside Page Objects.
   All `expect(...)` calls belong in the test files, never in `pages/`.

5. Compose Page Objects when a page contains reusable components.
   Example: `ProgramsPage` owns an instance of `NewProgramModal`.

6. Import Page Objects at the top of each spec and instantiate them with:

```ts
const programsPage = new ProgramsPage(page);
```

7. Tests should contain zero inline locators when an appropriate Page Object already exists.

## Output

- Page Object files belong in `pages/`.
- Test files belong in `tests/` and interact with the UI only through Page Objects.