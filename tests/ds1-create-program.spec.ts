import {
  test,
  unauthenticatedTest,
  expect,
  type Page,
  cacheCleanupAuthFromResponse,
} from '../fixtures/cleanup.fixture.js';
import { LoginPage } from '../pages/LoginPage.js';
import { NewProgramModal } from '../pages/NewProgramModal.js';
import { ProgramsPage } from '../pages/ProgramsPage.js';

/** Limits from Confluence Program Setup — Field Definitions (DS-1). */
const MAX_NAME_LENGTH = 100;
const MAX_DESC_LENGTH = 500;

const BASE_URL = (process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio').replace(/\/$/, '');
const PROGRAMS_URL = `${BASE_URL}/programs`;

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

async function expectProgramInList(page: Page, name: string): Promise<void> {
  const programsPage = new ProgramsPage(page);
  await programsPage.scrollToProgram(name);
  await expect(programsPage.programRow(name)).toBeVisible();
}

async function expectProgramNotInList(page: Page, name: string): Promise<void> {
  const programsPage = new ProgramsPage(page);
  await expect(programsPage.programRow(name)).toHaveCount(0);
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

test.describe('DS-1: Create new academic program', () => {
  test.describe.configure({ timeout: 60_000 });

  test('DS-1-TC-001: Navigate to program creation form as admin', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);

    await expect.soft(programsPage.newProgramModal.programNameInput).toBeVisible();
    await expect.soft(programsPage.newProgramModal.descriptionInput).toBeVisible();
    await expect.soft(programsPage.newProgramModal.createButton).toBeVisible();
    await expect.soft(programsPage.newProgramModal.cancelButton).toBeVisible();
  });

  test('DS-1-TC-002: Successfully create a program with valid data', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Web Development 2026');

    await programsPage.newProgramModal.fill(programName, 'Full-stack web development program');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-003: Create button disabled when Program Name is empty', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);

    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
  });

  test('DS-1-TC-004: Create program with name and description', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Data Science Fundamentals');

    await programsPage.newProgramModal.fill(programName, 'Introductory data science curriculum');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-005: Create program with empty description', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Cybersecurity Basics');

    await programsPage.newProgramModal.fill(programName, '');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-006: Cancel or dismiss program creation modal', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Temporary Program');

    await programsPage.newProgramModal.fill(programName, 'Should not be saved');
    await programsPage.newProgramModal.clickCancel();

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramNotInList(page, programName);
  });

  test('DS-1-TC-007: Non-admin user cannot access program creation', async ({ page }) => {
    test.skip(
      !process.env.DIDAXIS_VIEWER_EMAIL || !process.env.DIDAXIS_VIEWER_PASSWORD,
      'Requires DIDAXIS_VIEWER_EMAIL and DIDAXIS_VIEWER_PASSWORD environment variables',
    );

    const loginPage = new LoginPage(page);
    const programsPage = new ProgramsPage(page);

    await loginPage.goto();
    await loginPage.signIn(process.env.DIDAXIS_VIEWER_EMAIL!, process.env.DIDAXIS_VIEWER_PASSWORD!);

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

  test('DS-1-TC-009: Duplicate program name rejected', async ({ page, trackProgram }) => {
    test.fixme(
      true,
      'Known product gap (DS-3/DS-13): duplicate program names may be accepted at create time',
    );

    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');

    await captureProgramCreate(page, trackProgram, async () => {
      await programsPage.createProgram(programName, 'Original description');
    });

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, 'Another description');
    await programsPage.newProgramModal.clickCreate();

    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('DS-1-TC-010: Program name with leading and trailing whitespace trimmed', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Web Development 2026');
    const paddedName = `  ${programName}  `;

    await programsPage.newProgramModal.fill(paddedName, 'Full-stack web development program');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-011: Program name with special characters accepted', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('C++ & C# — Advanced (2026)');

    await programsPage.newProgramModal.fill(programName, 'Systems programming track');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-012: Description with special characters and line breaks', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Multiline Description Test');
    const description = 'Line 1: HTML <tags> & symbols\nLine 2: "quoted" text';

    await programsPage.newProgramModal.fill(programName, description);
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-013: Program name at minimum length boundary (1 character)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = String.fromCharCode(65 + (Date.now() % 26));

    await programsPage.newProgramModal.fill(programName, 'Single character name boundary test');
    await expect(programsPage.newProgramModal.createButton).toBeEnabled();
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-014: Program name at maximum length boundary', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = `${'A'.repeat(MAX_NAME_LENGTH - 9)}${Date.now() % 100000}`.slice(0, MAX_NAME_LENGTH);

    await programsPage.newProgramModal.fill(programName, 'Max length boundary test');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-015: Program name exceeding maximum length rejected', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);
    const overMaxName = 'B'.repeat(MAX_NAME_LENGTH + 1);

    await programsPage.newProgramModal.fill(overMaxName, 'Over max name test');
    await expectOverLengthBlocked(programsPage.newProgramModal);
  });

  test('DS-1-TC-016: Description at maximum length boundary', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Max Description Boundary');

    await programsPage.newProgramModal.fill(programName, 'D'.repeat(MAX_DESC_LENGTH));
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-017: Description exceeding maximum length rejected', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Over Max Description');

    await programsPage.newProgramModal.fill(programName, 'E'.repeat(MAX_DESC_LENGTH + 1));
    await expectOverLengthBlocked(programsPage.newProgramModal);
  });

  test('DS-1-TC-018: Program name with only whitespace treated as empty', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);

    await programsPage.newProgramModal.programNameInput.fill('   ');
    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
  });

  test('DS-1-TC-019: Create button re-enabled after clearing invalid name', async ({ page }) => {
    const programsPage = await openNewProgramForm(page);

    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    await programsPage.newProgramModal.programNameInput.fill(uniqueName('Valid Program Name'));
    await expect(programsPage.newProgramModal.createButton).toBeEnabled();
    await programsPage.newProgramModal.programNameInput.fill('');
    await expect(programsPage.newProgramModal.createButton).toBeDisabled();
  });

  test('DS-1-TC-020: New program appears in list without page refresh', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('No Refresh Test Program');

    await programsPage.newProgramModal.fill(programName, 'Verify list updates in place');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
    await expect(page).toHaveURL(/\/programs/);
  });

  test('DS-1-TC-021: Program name case sensitivity for duplicates', async ({ page, trackProgram }) => {
    test.fixme(
      true,
      'Known product gap (DS-3/DS-13): case-insensitive duplicate rejection not enforced at create time',
    );

    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');

    await captureProgramCreate(page, trackProgram, async () => {
      await programsPage.createProgram(programName, 'Original');
    });

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName.toLowerCase(), 'Duplicate attempt');
    await programsPage.newProgramModal.clickCreate();

    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  test('DS-1-TC-022: SQL injection and XSS strings handled safely', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName("<script>alert('xss')</script>");
    const description = "'; DROP TABLE programs; --";
    let dialogShown = false;

    page.on('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    await programsPage.newProgramModal.fill(programName, description);
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    expect(dialogShown).toBe(false);
    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-023: Unicode and emoji characters in program name', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('プログラム 🎓 2026');

    await programsPage.newProgramModal.fill(programName, 'International characters test');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-024: Rapid double-click on Create does not duplicate program', async ({
    page,
    trackProgram,
  }) => {
    test.fixme(true, 'Known app defect: double-click Create submits twice and creates duplicate programs');

    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Double Click Test');

    await programsPage.newProgramModal.fill(programName, 'Idempotency check');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.doubleClickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expect(programsPage.programRow(programName)).toHaveCount(1);
  });

  // Gherkin @TC-003 — empty description with alternate program name (not in Markdown plan as separate ID)
  test('TC-003: Admin creates a program with empty description (Gherkin)', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Data Science Fundamentals');

    await programsPage.newProgramModal.fill(programName, '');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  // Gherkin @TC-011 — trim whitespace with alternate program name
  test('TC-011: Program name with leading and trailing whitespace is trimmed (Gherkin)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = await openNewProgramForm(page);
    const storedName = uniqueName('Mobile Development');
    const paddedName = `  ${storedName}  `;

    await programsPage.newProgramModal.fill(paddedName, 'iOS and Android curriculum');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, storedName);
  });

  // Gherkin @TC-012 — special characters with alternate program name
  test('TC-012: Program name with special characters is accepted (Gherkin)', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('AI/ML & Data (2026)');

    await programsPage.newProgramModal.fill(programName, 'Machine learning track');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  // Gherkin @TC-004 — list updates without refresh with alternate program name
  test('TC-004: New program appears in list without page refresh (Gherkin)', async ({ page, trackProgram }) => {
    const programsPage = await openNewProgramForm(page);
    const programName = uniqueName('Cloud Architecture 2026');

    await programsPage.newProgramModal.fill(programName, 'AWS and Azure fundamentals');
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
    await expect(page).toHaveURL(/\/programs/);
  });

  test(
    'DS-1-NET-001: Create fails gracefully when POST returns 500',
    { tag: '@network' },
    async ({ page }) => {
      const programName = uniqueName('POST 500 Create Test');

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
    'DS-1-NET-002: Create fails gracefully when POST returns 503',
    { tag: '@network' },
    async ({ page }) => {
      const programName = uniqueName('POST 503 Create Test');

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
    'DS-1-NET-003: Create handles POST timeout without crashing',
    { tag: '@network' },
    async ({ page }) => {
      const programName = uniqueName('POST Timeout Create Test');

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
    'DS-1-NET-004: Programs page shows empty state when GET returns no programs',
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
    'DS-1-NET-005: Programs page does not crash when GET returns malformed payload',
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

  test(
    'DS-1-NET-006: Programs page handles GET 500 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal Server Error' }),
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
    'DS-1-NET-007: Programs page handles GET 503 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Service Unavailable' }),
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
    'DS-1-NET-008: Programs page handles GET timeout without crashing',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.abort('timedout');
        }
        return route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      await expect(programsPage.heading).toBeVisible();
    },
  );

  test(
    'DS-1-NET-009: Create handles POST 401 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      const programName = uniqueName('POST 401 Create Test');

      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Unauthorized' }),
          });
        }
        return route.continue();
      });

      const programsPage = await openNewProgramForm(page);
      await programsPage.newProgramModal.fill(programName, 'Unauthorized create');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expectProgramNotInList(page, programName);
    },
  );

  test(
    'DS-1-NET-010: Create handles POST 403 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      const programName = uniqueName('POST 403 Create Test');

      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({
            status: 403,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Forbidden' }),
          });
        }
        return route.continue();
      });

      const programsPage = await openNewProgramForm(page);
      await programsPage.newProgramModal.fill(programName, 'Forbidden create');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expectProgramNotInList(page, programName);
    },
  );

  test(
    'DS-1-NET-011: Create handles POST 404 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      const programName = uniqueName('POST 404 Create Test');

      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Not Found' }),
          });
        }
        return route.continue();
      });

      const programsPage = await openNewProgramForm(page);
      await programsPage.newProgramModal.fill(programName, 'Not found create');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expectProgramNotInList(page, programName);
    },
  );

  test(
    'DS-1-NET-012: Programs page handles GET 300 without crashing',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 300,
            headers: { Location: '/api/programs' },
            body: '',
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
    'DS-1-NET-013: Programs page handles GET malformed JSON without crashing',
    { tag: '@network' },
    async ({ page }) => {
      await page.route('**/api/programs**', async (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: 'not-valid-json{{{',
          });
        }
        return route.continue();
      });

      const programsPage = new ProgramsPage(page);
      await programsPage.goto();

      await expect(programsPage.heading).toBeVisible();
    },
  );

  unauthenticatedTest(
    'DS-1-NET-014: Unauthenticated GET /api/programs returns auth error',
    { tag: '@network' },
    async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/programs`);

      expect(response.status()).toBeGreaterThanOrEqual(401);
      expect(response.status()).toBeLessThan(500);
    },
  );

  unauthenticatedTest(
    'DS-1-NET-015: Unauthenticated navigation to Programs redirects to login',
    { tag: '@network' },
    async ({ page }) => {
      await page.goto(PROGRAMS_URL);
      await expect(page).toHaveURL(/\/login/);
    },
  );
});
