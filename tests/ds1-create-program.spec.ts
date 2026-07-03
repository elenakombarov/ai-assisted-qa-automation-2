import { test, expect, Page } from '@playwright/test';

const BASE_URL = (process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio').replace(/\/$/, '');
const LOGIN_URL = `${BASE_URL}/login`;
const PROGRAMS_URL = `${BASE_URL}/programs`;

/** Placeholder limits from DS-1 test plan — confirm with product if tests fail. */
const MAX_NAME_LENGTH = 255;
const MAX_DESC_LENGTH = 2000;

function requireEnv(name: 'DIDAXIS_EMAIL' | 'DIDAXIS_PASSWORD'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

function programModal(page: Page) {
  return page.getByRole('dialog');
}

async function loginAsAdmin(page: Page) {
  const email = requireEnv('DIDAXIS_EMAIL');
  const password = requireEnv('DIDAXIS_PASSWORD');

  await page.goto(LOGIN_URL);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });
}

async function goToProgramsPage(page: Page) {
  await page.goto(PROGRAMS_URL);
  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();
}

async function openNewProgramModal(page: Page) {
  await goToProgramsPage(page);
  await page.getByRole('button', { name: 'New Program' }).click();
  await expect(programModal(page)).toBeVisible();
  await expect(programModal(page).getByLabel('Program Name')).toBeVisible();
}

async function fillProgramForm(page: Page, name: string, description?: string) {
  const modal = programModal(page);
  await modal.getByLabel('Program Name').fill(name);
  if (description !== undefined) {
    await modal.getByRole('textbox', { name: 'Description' }).fill(description);
  }
}

async function clickCreate(page: Page) {
  await programModal(page).getByRole('button', { name: 'Create' }).click();
}

async function expectCreateDisabled(page: Page) {
  await expect(programModal(page).getByRole('button', { name: 'Create' })).toBeDisabled();
}

async function expectCreateEnabled(page: Page) {
  await expect(programModal(page).getByRole('button', { name: 'Create' })).toBeEnabled();
}

async function expectProgramInList(page: Page, name: string) {
  await expect(page.getByText(name, { exact: true })).toBeVisible();
}

async function expectProgramNotInList(page: Page, name: string) {
  await expect(page.getByText(name, { exact: true })).not.toBeVisible();
}

async function expectModalClosed(page: Page) {
  await expect(programModal(page)).not.toBeVisible();
}

async function createProgram(page: Page, name: string, description?: string) {
  await openNewProgramModal(page);
  await fillProgramForm(page, name, description ?? '');
  await clickCreate(page);
  await expectModalClosed(page);
}

async function expectOverLengthBlocked(page: Page) {
  const modal = programModal(page);
  const createButton = modal.getByRole('button', { name: 'Create' });
  const validationMessage = modal.getByText(/maximum|too long|exceed|limit/i);

  if (await createButton.isDisabled()) {
    await expect(createButton).toBeDisabled();
    return;
  }

  if (await validationMessage.isVisible()) {
    await expect(validationMessage).toBeVisible();
    return;
  }

  await createButton.click();
  await expect(modal).toBeVisible();
}

test.describe('DS-1: Create New Academic Program', () => {
  test('DS-1-TC-001: Navigate to program creation form as admin', async ({ page }) => {
    await loginAsAdmin(page);
    await openNewProgramModal(page);

    await expect(programModal(page).getByLabel('Program Name')).toBeVisible();
    await expect(programModal(page).getByRole('textbox', { name: 'Description' })).toBeVisible();
  });

  test('DS-1-TC-002: Successfully create a program with valid data', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Web Development 2026');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'Full-stack web development program');
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-003: Create button disabled when Program Name is empty', async ({ page }) => {
    await loginAsAdmin(page);
    await openNewProgramModal(page);

    await expectCreateDisabled(page);
  });

  test('DS-1-TC-004: Create program with name and description', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Data Science Fundamentals');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'Introductory data science curriculum');
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-005: Create program with empty description', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Cybersecurity Basics');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, '');
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-006: Cancel program creation without saving', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Temporary Program');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'Should not be saved');
    await programModal(page).getByRole('button', { name: 'Cancel' }).click();

    await expectModalClosed(page);
    await expectProgramNotInList(page, programName);
  });

  test('DS-1-TC-007: Non-admin user cannot access program creation', async ({ page }) => {
    test.skip(
      !process.env.DIDAXIS_NON_ADMIN_EMAIL || !process.env.DIDAXIS_NON_ADMIN_PASSWORD,
      'Requires DIDAXIS_NON_ADMIN_EMAIL and DIDAXIS_NON_ADMIN_PASSWORD environment variables',
    );

    await page.goto(LOGIN_URL);
    await page.getByLabel('Email').fill(process.env.DIDAXIS_NON_ADMIN_EMAIL!);
    await page.getByLabel('Password').fill(process.env.DIDAXIS_NON_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });

    await goToProgramsPage(page);
    await expect(page.getByRole('button', { name: 'New Program' })).not.toBeVisible();
  });

  test('DS-1-TC-008: Unauthenticated user redirected from Programs page', async ({ page }) => {
    await page.goto(PROGRAMS_URL);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('DS-1-TC-009: Duplicate program name rejected', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Original description');
    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'Another description');
    await clickCreate(page);

    await expect(page.getByText(programName, { exact: true })).toHaveCount(1);
  });

  test('DS-1-TC-010: Program name with leading and trailing whitespace trimmed', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Web Development 2026');
    const paddedName = `  ${programName}  `;

    await openNewProgramModal(page);
    await fillProgramForm(page, paddedName, 'Full-stack web development program');
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-011: Program name with special characters accepted', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('C++ & C# — Advanced (2026)');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'Systems programming track');
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-012: Description with special characters and line breaks', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Multiline Description Test');
    const description = 'Line 1: HTML <tags> & symbols\nLine 2: "quoted" text';

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, description);
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-013: Program name at minimum length boundary (1 character)', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = `${Date.now() % 10}`;

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'Single character name boundary test');
    await expectCreateEnabled(page);
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-014: Program name at maximum length boundary', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = `${'A'.repeat(MAX_NAME_LENGTH - 13)} ${Date.now()}`.slice(0, MAX_NAME_LENGTH);

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'Max length boundary test');
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-015: Program name exceeding maximum length rejected', async ({ page }) => {
    await loginAsAdmin(page);
    const overMaxName = `${'B'.repeat(MAX_NAME_LENGTH)}${Date.now()}`;

    await openNewProgramModal(page);
    await fillProgramForm(page, overMaxName.slice(0, MAX_NAME_LENGTH + 1), 'Over max name test');
    await expectOverLengthBlocked(page);
  });

  test('DS-1-TC-016: Description at maximum length boundary', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Max Description Boundary');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'D'.repeat(MAX_DESC_LENGTH));
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-017: Description exceeding maximum length rejected', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Over Max Description');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'E'.repeat(MAX_DESC_LENGTH + 1));
    await expectOverLengthBlocked(page);
  });

  test('DS-1-TC-018: Program name with only whitespace treated as empty', async ({ page }) => {
    await loginAsAdmin(page);
    await openNewProgramModal(page);

    await programModal(page).getByLabel('Program Name').fill('   ');
    await expectCreateDisabled(page);
  });

  test('DS-1-TC-019: Create button re-enabled after clearing invalid name', async ({ page }) => {
    await loginAsAdmin(page);
    await openNewProgramModal(page);

    await expectCreateDisabled(page);
    await programModal(page).getByLabel('Program Name').fill(uniqueName('Valid Program Name'));
    await expectCreateEnabled(page);
    await programModal(page).getByLabel('Program Name').fill('');
    await expectCreateDisabled(page);
  });

  test('DS-1-TC-020: New program appears in list without page refresh', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('No Refresh Test Program');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'Verify list updates in place');
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
    await expect(page).toHaveURL(/\/programs/);
  });

  test('DS-1-TC-021: Program name case sensitivity for duplicates', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Original');
    await openNewProgramModal(page);
    await fillProgramForm(page, programName.toLowerCase(), 'Duplicate attempt');
    await clickCreate(page);

    await expect(page.getByText(programName, { exact: true })).toHaveCount(1);
  });

  test('DS-1-TC-022: SQL injection and XSS strings handled safely', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName("<script>alert('xss')</script>");
    const description = "'; DROP TABLE programs; --";
    let dialogShown = false;

    page.on('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, description);
    await clickCreate(page);

    expect(dialogShown).toBe(false);
    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-023: Unicode and emoji characters in program name', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('プログラム 🎓 2026');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'International characters test');
    await clickCreate(page);

    await expectModalClosed(page);
    await expectProgramInList(page, programName);
  });

  test('DS-1-TC-024: Rapid double-click on Create does not duplicate program', async ({ page }) => {
    await loginAsAdmin(page);
    const programName = uniqueName('Double Click Test');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'Idempotency check');
    await programModal(page).getByRole('button', { name: 'Create' }).dblclick();

    await expectModalClosed(page);
    await expect(page.getByText(programName, { exact: true })).toHaveCount(1);
  });
});
