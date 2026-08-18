import AxeBuilder from '@axe-core/playwright';
import type { Response } from '@playwright/test';
import {
  test,
  unauthenticatedTest,
  expect,
  type Page,
  cacheCleanupAuthFromResponse,
} from '../fixtures/cleanup.fixture';
import { LoginPage } from '../pages/LoginPage';
import { NewProgramModal } from '../pages/NewProgramModal';
import { ProgramsPage } from '../pages/ProgramsPage';

/** Limits from Confluence Program Setup — Field Definitions (DS-1). */
const MAX_NAME_LENGTH = 100;
const MAX_DESC_LENGTH = 500;

function uniqueName(base: string): string {
  const suffix = Date.now().toString().slice(-8);
  const maxBase = MAX_NAME_LENGTH - suffix.length - 1;
  return `${base.slice(0, maxBase)} ${suffix}`;
}

async function captureProgramCreate(
  page: Page,
  trackProgram: (uuid: string) => void,
  action: () => Promise<void>,
) {
  const responsePromise = page.waitForResponse(
    (resp: Response) => resp.url().includes('/api/programs') && resp.request().method() === 'POST',
  );
  await action();
  const response = await responsePromise;
  cacheCleanupAuthFromResponse(response);
  if (response.ok()) {
    const body = await response.json();
    const uuid = body.data?.id ?? body.id;
    if (uuid) {
      trackProgram(String(uuid));
    }
  }
}

async function createProgramViaUi(
  page: Page,
  programsPage: ProgramsPage,
  name: string,
  trackProgram: (uuid: string) => void,
  description = '',
): Promise<void> {
  await programsPage.goto();
  await programsPage.openNewProgramForm();
  await programsPage.newProgramModal.fill(name, description);
  await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());
}

async function expectOverLengthBlocked(modal: NewProgramModal): Promise<void> {
  if (await modal.createButton.isDisabled()) {
    await expect(modal.createButton).toBeDisabled();
    return;
  }

  if (await modal.validationMessage.isVisible()) {
    await expect(modal.validationMessage).toBeVisible();
    return;
  }

  await modal.clickCreate();
  await expect(modal.dialog).toBeVisible();
}

async function tabUntilFocused(page: Page, locator: ProgramsPage['newProgramButton']): Promise<void> {
  for (let i = 0; i < 30; i += 1) {
    if (await locator.evaluate((el) => el === document.activeElement)) {
      return;
    }
    await page.keyboard.press('Tab');
  }
}

test.describe('DS-1: Create new academic program', () => {
  test('DS-1-TC-001: Navigate to program creation form as admin', async ({ page }) => {
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();
    await programsPage.openNewProgramForm();

    await expect.soft(programsPage.newProgramModal.programNameInput).toBeVisible();
    await expect.soft(programsPage.newProgramModal.descriptionInput).toBeVisible();
    await expect(programsPage.newProgramModal.dialog).toBeVisible();
  });

  test('DS-1-TC-002: Successfully create a program with valid data', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'Full-stack web development program');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test('DS-1-TC-003: Create button disabled when Program Name is empty', async ({ page }) => {
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();
    await programsPage.openNewProgramForm();

    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
  });

  test('DS-1-TC-004: Create program with name and description', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('Data Science Fundamentals');

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'Introductory data science curriculum');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test('DS-1-TC-005: Create program with empty description', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('Cybersecurity Basics');

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, '');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test('DS-1-TC-006: Cancel program creation without saving', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('Temporary Program');

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'Should not be saved');
    await programsPage.newProgramModal.clickCancel();

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).not.toBeVisible();
  });

  test('DS-1-TC-007: Non-admin user cannot access program creation', async ({ page }) => {
    const nonAdminEmail =
      process.env.DIDAXIS_NON_ADMIN_EMAIL ?? process.env.DIDAXIS_VIEWER_EMAIL;
    const nonAdminPassword =
      process.env.DIDAXIS_NON_ADMIN_PASSWORD ?? process.env.DIDAXIS_VIEWER_PASSWORD;

    test.skip(
      !nonAdminEmail || !nonAdminPassword,
      'Requires DIDAXIS_NON_ADMIN_* or DIDAXIS_VIEWER_* environment variables',
    );

    const loginPage = new LoginPage(page);
    const programsPage = new ProgramsPage(page);

    await loginPage.goto();
    await loginPage.signIn(nonAdminEmail!, nonAdminPassword!);

    await programsPage.goto();
    await expect(programsPage.newProgramButton).not.toBeVisible();
  });

  unauthenticatedTest('DS-1-TC-008: Unauthenticated user redirected from Programs page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });

  test.fixme(
    'DS-1-TC-009: Duplicate program name rejected — known bug: duplicate names allowed (DS-13, DS-14, DS-18)',
    async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Web Development 2026');

      await createProgramViaUi(page, programsPage, programName, trackProgram, 'Original description');
      await programsPage.goto();
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName, 'Another description');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.programNameInList(programName)).toHaveCount(1);
    },
  );

  test('DS-1-TC-010: Program name with leading and trailing whitespace trimmed', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');
    const paddedName = `  ${programName}  `;

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(paddedName, 'Full-stack web development program');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test('DS-1-TC-011: Program name with special characters accepted', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('C++ & C# — Advanced (2026)');

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'Systems programming track');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test('DS-1-TC-012: Description with special characters and line breaks', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('Multiline Description Test');
    const description = 'Line 1: HTML <tags> & symbols\nLine 2: "quoted" text';

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, description);
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test('DS-1-TC-013: Program name at minimum length boundary (1 character)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = String.fromCharCode(65 + (Date.now() % 26));

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'Single character name boundary test');
    await expect(programsPage.newProgramModal.createButton).toBeEnabled();
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test('DS-1-TC-014: Program name at maximum length boundary', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const programName = `${'A'.repeat(MAX_NAME_LENGTH - 9)}${Date.now() % 100000}`.slice(
      0,
      MAX_NAME_LENGTH,
    );

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'Max length boundary test');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test('DS-1-TC-015: Program name exceeding maximum length rejected', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const overMaxName = 'B'.repeat(MAX_NAME_LENGTH + 1);

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(overMaxName, 'Over max name test');
    await expectOverLengthBlocked(programsPage.newProgramModal);
  });

  test('DS-1-TC-016: Description at maximum length boundary', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('Max Description Boundary');

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'D'.repeat(MAX_DESC_LENGTH));
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test('DS-1-TC-017: Description exceeding maximum length rejected', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('Over Max Description');

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'E'.repeat(MAX_DESC_LENGTH + 1));
    await expectOverLengthBlocked(programsPage.newProgramModal);
  });

  test('DS-1-TC-018: Program name with only whitespace treated as empty', async ({ page }) => {
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.programNameInput.fill('   ');
    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
  });

  test('DS-1-TC-019: Create button re-enabled after clearing invalid name', async ({ page }) => {
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();
    await programsPage.openNewProgramForm();

    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await programsPage.newProgramModal.programNameInput.fill(uniqueName('Valid Program Name'));
    await expect(programsPage.newProgramModal.createButton).toBeEnabled();
    await programsPage.newProgramModal.programNameInput.fill('');
    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
  });

  test('DS-1-TC-020: New program appears in list without page refresh', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('No Refresh Test Program');

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'Verify list updates in place');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
    await expect(page).toHaveURL(/\/programs/);
  });

  test.fixme(
    'DS-1-TC-021: Program name case sensitivity for duplicates — known bug: duplicate names allowed (DS-13, DS-14, DS-18)',
    async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Web Development 2026');

      await createProgramViaUi(page, programsPage, programName, trackProgram, 'Original');
      await programsPage.goto();
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName.toLowerCase(), 'Duplicate attempt');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.programNameInList(programName)).toHaveCount(1);
    },
  );

  test('DS-1-TC-022: SQL injection and XSS strings handled safely', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName("<script>alert('xss')</script>");
    const description = "'; DROP TABLE programs; --";
    let dialogShown = false;

    page.on('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, description);
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    expect(dialogShown).toBe(false);
    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test('DS-1-TC-023: Unicode and emoji characters in program name', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('プログラム 🎓 2026');

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'International characters test');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();
  });

  test.fixme(
    'DS-1-TC-024: Rapid double-click on Create does not duplicate program — known bug: double-click duplicates (DS-17)',
    async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Double Click Test');

      await programsPage.goto();
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName, 'Idempotency check');
      await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.doubleClickCreate());

      await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
      await expect(programsPage.programNameInList(programName)).toHaveCount(1);
    },
  );

  test(
    'DS-1 a11y: Programs page has no WCAG 2.0/2.1 violations',
    { tag: '@a11y' },
    async ({ page }) => {
      const programsPage = new ProgramsPage(page);

      await programsPage.goto();
      await expect(programsPage.heading).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      await expect(results.violations).toEqual([]);
    },
  );

  test(
    'DS-1 a11y: New Program modal has no WCAG 2.0/2.1 violations',
    { tag: '@a11y' },
    async ({ page }) => {
      const programsPage = new ProgramsPage(page);

      await programsPage.goto();
      await programsPage.openNewProgramForm();
      await expect(programsPage.newProgramModal.dialog).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .include('[role="dialog"]')
        .analyze();

      await expect(results.violations).toEqual([]);
    },
  );

  test(
    'DS-1 a11y: Keyboard opens New Program dialog via Enter on focused control',
    { tag: '@a11y' },
    async ({ page }) => {
      const programsPage = new ProgramsPage(page);

      await programsPage.goto();
      await expect(programsPage.heading).toBeVisible();

      await tabUntilFocused(page, programsPage.newProgramButton);
      await expect(programsPage.newProgramButton).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(programsPage.newProgramModal.dialog).toBeVisible();
    },
  );

  test(
    'DS-1 network: Programs list empty state when GET returns no programs',
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
    },
  );

  test(
    'DS-1 network: Programs page survives malformed GET payload',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: '{not-valid-json',
          });
        }
        return route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      await expect(programsPage.heading).toBeVisible();
    },
  );

  test(
    'DS-1 network: Create stays open when POST returns 500',
    { tag: '@network' },
    async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Server Error Create');

      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({ status: 500, body: 'Internal Server Error' });
        }
        return route.continue();
      });

      await programsPage.goto();
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName, 'Should not persist on server error');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.programNameInList(programName)).not.toBeVisible();
    },
  );

  test(
    'DS-1 network: Create stays open when POST returns 503',
    { tag: '@network' },
    async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Unavailable Create');

      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({ status: 503, body: 'Service Unavailable' });
        }
        return route.continue();
      });

      await programsPage.goto();
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName, 'Should not persist when unavailable');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.programNameInList(programName)).not.toBeVisible();
    },
  );

  test(
    'DS-1 network: Create stays open when POST times out',
    { tag: '@network' },
    async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Timeout Create');

      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'POST') {
          return route.abort('timedout');
        }
        return route.continue();
      });

      await programsPage.goto();
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName, 'Should not persist on timeout');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.programNameInList(programName)).not.toBeVisible();
    },
  );

  test(
    'DS-1 network: Programs page handles GET 401 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({ status: 401, body: 'Unauthorized' });
        }
        return route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      await expect(programsPage.heading).toBeVisible();
    },
  );

  test(
    'DS-1 network: Programs page handles GET 403 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({ status: 403, body: 'Forbidden' });
        }
        return route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      await expect(programsPage.heading).toBeVisible();
    },
  );

  test(
    'DS-1 network: Programs page handles GET 404 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({ status: 404, body: 'Not Found' });
        }
        return route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      await expect(programsPage.heading).toBeVisible();
    },
  );
});
