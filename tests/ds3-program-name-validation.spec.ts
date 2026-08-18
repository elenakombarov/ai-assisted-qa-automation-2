import AxeBuilder from '@axe-core/playwright';
import {
  test,
  expect,
  type Page,
  cacheCleanupAuthFromResponse,
} from '../fixtures/cleanup.fixture.js';
import { NewProgramModal } from '../pages/NewProgramModal.js';
import { ProgramsPage } from '../pages/ProgramsPage.js';

/** Limits from Confluence Program Setup — Field Definitions (DS-3). */
const MAX_NAME_LENGTH = 100;
const MAX_DESC_LENGTH = 500;

const DUPLICATE_FIXME_REASON =
  'Known product gap (DS-3/DS-13): duplicate program names are not rejected at create time (DS-153)';

const CASE_INSENSITIVE_DUPLICATE_FIXME_REASON =
  'Known product gap (DS-3/DS-13): case-insensitive duplicate rejection not enforced (DS-154)';

const TRIM_THEN_DUPLICATE_FIXME_REASON =
  'Known product gap (DS-3/DS-13): whitespace-padded duplicate names are not rejected (DS-152)';

const EDIT_DUPLICATE_FIXME_REASON =
  'Known product gap (DS-3/DS-13, DS-131): duplicate program names are not rejected on edit';

function uniqueName(base: string): string {
  const suffix = Date.now().toString().slice(-8);
  const maxBase = MAX_NAME_LENGTH - suffix.length - 1;
  return `${base.slice(0, maxBase)} ${suffix}`;
}

async function captureProgramCreate(
  page: Page,
  trackProgram: ((uuid: string) => void) | undefined,
  action: () => Promise<void>,
): Promise<string | undefined> {
  const responsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/api/programs') && resp.request().method() === 'POST',
  );
  await action();
  const response = await responsePromise;
  cacheCleanupAuthFromResponse(response);
  if (response.ok()) {
    const body = await response.json();
    const uuid = body.data?.id ?? body.id;
    if (uuid) {
      const id = String(uuid);
      trackProgram?.(id);
      return id;
    }
  }
  return undefined;
}

async function openNewProgramForm(page: Page): Promise<ProgramsPage> {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
  await programsPage.openNewProgramForm();
  await expect(programsPage.newProgramModal.dialog).toBeVisible();
  return programsPage;
}

async function seedProgram(
  page: Page,
  trackProgram: (uuid: string) => void,
  name: string,
  description = 'Seed program for DS-3',
): Promise<ProgramsPage> {
  const programsPage = new ProgramsPage(page);
  await captureProgramCreate(page, trackProgram, async () => {
    await programsPage.createProgram(name, description);
  });
  return programsPage;
}

async function expectProgramInList(page: Page, name: string): Promise<void> {
  const programsPage = new ProgramsPage(page);
  await programsPage.scrollToProgram(name);
  await expect(programsPage.programRow(name)).toBeVisible();
}

async function expectProgramNotInList(page: Page, name: string): Promise<void> {
  const programsPage = new ProgramsPage(page);
  await expect(programsPage.programRow(name)).toHaveCount(0);
}

async function expectFormNotSubmitted(modal: NewProgramModal): Promise<void> {
  const blockedByDisabled = await expect(modal.createButton)
    .toBeDisabled({ timeout: 2_000 })
    .then(() => true)
    .catch(() => false);
  if (blockedByDisabled) {
    await expect(modal.dialog).toBeVisible();
    return;
  }

  await modal.clickCreate();
  await expect(modal.dialog).toBeVisible();
}

async function expectOverLengthBlocked(modal: NewProgramModal): Promise<void> {
  const blockedByDisabled = await expect(modal.createButton)
    .toBeDisabled({ timeout: 2_000 })
    .then(() => true)
    .catch(() => false);
  if (blockedByDisabled) {
    return;
  }

  const blockedByValidation = await expect(modal.validationMessage)
    .toBeVisible({ timeout: 2_000 })
    .then(() => true)
    .catch(() => false);
  if (blockedByValidation) {
    return;
  }

  await modal.clickCreate();
  await expect(modal.dialog).toBeVisible();
}

test.describe('DS-3: Program name validation and duplicate prevention', () => {
  test.describe.configure({ timeout: 60_000 });

  test('DS-3-TC-001: Accept program name with special characters', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Informatique & IA - Niveau 2');

    await programsPage.newProgramModal.fill(programName, 'French IT and AI curriculum');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-002: Accept valid alphanumeric program name', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Web Development 2026');

    await programsPage.newProgramModal.fill(programName, 'Full-stack web development program');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-003: Accept program name with internal whitespace', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Full   Stack   Web');

    await programsPage.newProgramModal.fill(programName, 'Internal whitespace name test');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-004: Accept program name with Unicode and accented characters', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Programme Français — été 2026');

    await programsPage.newProgramModal.fill(programName, 'Accented characters curriculum');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-005: Valid name with leading/trailing whitespace trimmed and saved', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Web Development 2026');
    const paddedName = `  ${programName}  `;

    await programsPage.newProgramModal.fill(paddedName, 'Trim surrounding whitespace test');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-006: Reject program name with only whitespace', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);

    await programsPage.newProgramModal.programNameInput.fill('   ');
    await expectFormNotSubmitted(programsPage.newProgramModal);
  });

  test('DS-3-TC-007: Reject empty program name', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);

    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await expect(programsPage.newProgramModal.programNameInput).toHaveValue('');
  });

  test('DS-3-TC-008: Reject duplicate program name on create', async ({ page, trackProgram }) => {
    test.fixme(true, DUPLICATE_FIXME_REASON);

    const programName = uniqueName('Web Development 2026');
    await seedProgram(page, trackProgram, programName);

    const programsPage = await openNewProgramForm(page);
    await programsPage.newProgramModal.fill(programName, 'Duplicate attempt description');
    await programsPage.newProgramModal.clickCreate();

    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('DS-3-TC-009: Reject duplicate program name on edit', async ({ page, trackProgram }) => {
    test.fixme(true, EDIT_DUPLICATE_FIXME_REASON);

    const firstProgram = uniqueName('Web Development 2026');
    const secondProgram = uniqueName('Data Science Fundamentals');

    await seedProgram(page, trackProgram, firstProgram);
    await seedProgram(page, trackProgram, secondProgram);

    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await programsPage.openEditDialog(secondProgram);
    await expect(programsPage.editProgramModal.heading).toBeVisible();
    await programsPage.editProgramModal.fill(firstProgram);
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).toBeVisible();
    await expect(programsPage.programRow(firstProgram)).toHaveCount(1);
    await expect(programsPage.programRow(secondProgram)).toHaveCount(1);
  });

  test('DS-3-TC-010: Reject program name exceeding maximum length', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);
    const overMaxName = 'B'.repeat(MAX_NAME_LENGTH + 1);

    await programsPage.newProgramModal.fill(overMaxName, 'Over max name test');
    await expectOverLengthBlocked(programsPage.newProgramModal);
  });

  test('DS-3-TC-011: Create button disabled for invalid name before submit', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);

    await programsPage.newProgramModal.programNameInput.fill('   ');
    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
  });

  test('DS-3-TC-012: Duplicate error preserves user input in form', async ({ page, trackProgram }) => {
    test.fixme(true, DUPLICATE_FIXME_REASON);

    const programName = uniqueName('Web Development 2026');
    const duplicateDescription = 'Duplicate attempt description';

    await seedProgram(page, trackProgram, programName);

    const programsPage = await openNewProgramForm(page);
    await programsPage.newProgramModal.fill(programName, duplicateDescription);
    await programsPage.newProgramModal.clickCreate();

    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.newProgramModal.programNameInput).toHaveValue(programName);
    await expect(programsPage.newProgramModal.descriptionInput).toHaveValue(duplicateDescription);
  });

  test('DS-3-TC-013: Whitespace-only name via tabs and newlines rejected', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);

    await programsPage.newProgramModal.programNameInput.fill('\t\n  \t');
    await expectFormNotSubmitted(programsPage.newProgramModal);
  });

  test('DS-3-TC-014: Reject name consisting only of zero-width or invisible characters', async ({
    page,
  }) => {
    const programsPage = await openNewProgramForm(page);
    const invisibleName = '\u200B\u200B\u200B\uFEFF';

    await programsPage.newProgramModal.programNameInput.fill(invisibleName);
    await expectFormNotSubmitted(programsPage.newProgramModal);
  });

  test('DS-3-TC-015: Case-insensitive duplicate rejected on create', async ({ page, trackProgram }) => {
    test.fixme(true, CASE_INSENSITIVE_DUPLICATE_FIXME_REASON);

    const programName = uniqueName('Web Development 2026');
    await seedProgram(page, trackProgram, programName);

    const programsPage = await openNewProgramForm(page);
    await programsPage.newProgramModal.fill(programName.toLowerCase(), 'Case variant duplicate');
    await programsPage.newProgramModal.clickCreate();

    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('DS-3-TC-016: Duplicate detected after trimming surrounding whitespace', async ({
    page,
    trackProgram,
  }) => {
    test.fixme(true, TRIM_THEN_DUPLICATE_FIXME_REASON);

    const programName = uniqueName('Web Development 2026');
    await seedProgram(page, trackProgram, programName);

    const programsPage = await openNewProgramForm(page);
    await programsPage.newProgramModal.fill(`  ${programName}  `, 'Padded duplicate attempt');
    await programsPage.newProgramModal.clickCreate();

    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('DS-3-TC-017: Program name at minimum length boundary (1 character)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = String.fromCharCode(65 + (Date.now() % 26));

    await programsPage.newProgramModal.fill(programName, 'Minimum length boundary test');
    await expect(programsPage.newProgramModal.createButton).toBeEnabled();
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-018: Program name at maximum length boundary', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = `${'A'.repeat(MAX_NAME_LENGTH - 9)}${Date.now() % 100000}`.slice(0, MAX_NAME_LENGTH);

    await programsPage.newProgramModal.fill(programName, 'Maximum length boundary test');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-019: Special characters including quotes, parentheses, and slashes', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('C++ / C# "Advanced" (2026)');

    await programsPage.newProgramModal.fill(programName, 'Extended special characters test');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-020: Emoji in program name accepted or rejected per rules', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('STEM Program 🎓 2026');

    await programsPage.newProgramModal.fill(programName, 'Emoji handling test');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-021: Edit to same name does not trigger false duplicate error', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    await seedProgram(page, trackProgram, programName, 'Original description');

    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await programsPage.openEditDialog(programName);
    await expect(programsPage.editProgramModal.heading).toBeVisible();
    await programsPage.editProgramModal.fill(programName, 'Updated without renaming');
    await programsPage.editProgramModal.clickSave();

    await expect(programsPage.editProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-022: Concurrent duplicate name creation handled safely', async () => {
    test.fixme(
      true,
      'Requires two concurrent admin sessions — not feasible in single-browser E2E without multi-context harness',
    );
  });

  test('DS-3-TC-023: HTML/script tags in name stored and displayed safely', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('<b>Web Dev</b><script>alert(1)</script>');
    let dialogShown = false;

    page.on('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    await programsPage.newProgramModal.fill(programName, 'XSS safety test');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    expect(dialogShown).toBe(false);
    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-3-TC-024: Duplicate check is case-only variation of existing name', async ({
    page,
    trackProgram,
  }) => {
    test.fixme(true, CASE_INSENSITIVE_DUPLICATE_FIXME_REASON);

    const programName = uniqueName('WEB DEVELOPMENT 2026');
    await seedProgram(page, trackProgram, programName);

    const programsPage = await openNewProgramForm(page);
    await programsPage.newProgramModal.fill(programName.toLowerCase(), 'Mixed-case duplicate attempt');
    await programsPage.newProgramModal.clickCreate();

    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test(
    'DS-3-A11Y-001: New Program creation form has no accessibility violations',
    { tag: '@a11y' },
    async ({ page }, testInfo) => {
      const programsPage = await openNewProgramForm(page);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .include('[role="dialog"]')
        .analyze();

      // Known product issue: Mantine icon-only close button is missing an accessible name.
      const isKnownCloseButton = (violation: (typeof results.violations)[number]) =>
        violation.id === 'button-name' &&
        violation.nodes.every((node) => String(node.html).includes('Modal-close'));

      const known = results.violations.filter(isKnownCloseButton);
      if (known.length > 0) {
        await testInfo.attach('known-product-a11y-issues-button-name', {
          body: JSON.stringify(known, null, 2),
          contentType: 'application/json',
        });
      }

      expect(results.violations.filter((violation) => !isKnownCloseButton(violation))).toEqual([]);
      await expect(programsPage.newProgramModal.programNameInput).toBeVisible();
    },
  );

  test(
    'DS-3-NET-001: Create handles POST 500 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      const programName = uniqueName('POST 500 Name Validation');

      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal Server Error' }),
          });
        }
        return route.continue();
      });

      const programsPage = await openNewProgramForm(page);
      await programsPage.newProgramModal.fill(programName, 'Server error handling');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expectProgramNotInList(page, programName);
    },
  );

  test(
    'DS-3-NET-002: Create handles POST 503 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      const programName = uniqueName('POST 503 Name Validation');

      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Service Unavailable' }),
          });
        }
        return route.continue();
      });

      const programsPage = await openNewProgramForm(page);
      await programsPage.newProgramModal.fill(programName, 'Service unavailable handling');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expectProgramNotInList(page, programName);
    },
  );

  test(
    'DS-3-NET-003: Create handles POST timeout without crashing',
    { tag: '@network' },
    async ({ page }) => {
      const programName = uniqueName('POST Timeout Name Validation');

      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'POST') {
          return route.abort('timedout');
        }
        return route.continue();
      });

      const programsPage = await openNewProgramForm(page);
      await programsPage.newProgramModal.fill(programName, 'Timeout handling');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.heading).toBeVisible();
      await expectProgramNotInList(page, programName);
    },
  );

  test(
    'DS-3-NET-004: Create handles POST 409 duplicate conflict without crashing',
    { tag: '@network' },
    async ({ page }) => {
      const programName = uniqueName('POST 409 Duplicate Conflict');

      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Conflict',
              message: 'Program name already exists',
            }),
          });
        }
        return route.continue();
      });

      const programsPage = await openNewProgramForm(page);
      await programsPage.newProgramModal.fill(programName, 'Duplicate conflict mock');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expectProgramNotInList(page, programName);
    },
  );

  test(
    'DS-3-NET-005: Programs page shows empty state when GET returns no programs',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: '[]',
          });
        }
        return route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      await expect(programsPage.emptyStateMessage).toBeVisible();
      await expect(programsPage.heading).toBeVisible();
    },
  );

  test(
    'DS-3-NET-006: Programs page does not crash when GET returns malformed payload',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: '{"unexpected":"shape"}',
          });
        }
        return route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      await expect(programsPage.heading).toBeVisible();
    },
  );
});
