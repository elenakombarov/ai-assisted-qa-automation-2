import {
  test,
  unauthenticatedTest,
  expect,
  type Page,
  cacheCleanupAuthFromResponse,
} from '../fixtures/cleanup.fixture.js';
import { LoginPage } from '../pages/LoginPage.js';
import { ProgramsPage } from '../pages/ProgramsPage.js';

/** Limits from Confluence Program Setup — Field Definitions (DS-2/DS-4). */
const MAX_NAME_LENGTH = 100;

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
      if (trackProgram) {
        trackProgram(id);
      }
      return id;
    }
  }
  return undefined;
}

async function createProgram(
  page: Page,
  name: string,
  trackProgram: (uuid: string) => void,
  description = '',
): Promise<ProgramsPage> {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
  await programsPage.openNewProgramForm();
  await programsPage.newProgramModal.fill(name, description);
  await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());
  await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
  return programsPage;
}

async function expectProgramInList(programsPage: ProgramsPage, name: string): Promise<void> {
  await programsPage.scrollToProgram(name);
  await expect(programsPage.programNameInList(name)).toBeVisible();
}

async function expectProgramWithDescription(
  programsPage: ProgramsPage,
  name: string,
  description: string,
): Promise<void> {
  await expectProgramInList(programsPage, name);
  await expect(programsPage.programRow(name)).toContainText(description);
}

test.describe('DS-5: Program List Filtering and Display', () => {
  test.describe.configure({ timeout: 60_000 });

  test('DS-5-TC-001: Display program list with name and description', { tag: '@smoke' }, async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    const programsPage = await createProgram(page, programName, trackProgram, description);
    await programsPage.goto();

    await expect(programsPage.heading).toBeVisible();
    await expect.soft(programsPage.programNameInList(programName)).toBeVisible();
    await expect.soft(programsPage.programRow(programName)).toContainText(description);
  });

  test('DS-5-TC-003: Display multiple programs in list', { tag: '@sanity' }, async ({ page, trackProgram }) => {
    const programA = uniqueName('Web Development 2026');
    const programB = uniqueName('Data Science Fundamentals');
    const programC = uniqueName('Cybersecurity Basics');
    const descriptionA = 'Full-stack web development curriculum';
    const descriptionB = 'Introductory data science curriculum';
    const descriptionC = 'Foundational cybersecurity training';

    await createProgram(page, programA, trackProgram, descriptionA);
    await createProgram(page, programB, trackProgram, descriptionB);
    await createProgram(page, programC, trackProgram, descriptionC);

    const programsPage = new ProgramsPage(page);
    await programsPage.goto();

    await expectProgramWithDescription(programsPage, programA, descriptionA);
    await expectProgramWithDescription(programsPage, programB, descriptionB);
    await expectProgramWithDescription(programsPage, programC, descriptionC);
  });

  test('DS-5-TC-004: Program with empty description still appears in list', { tag: '@sanity' }, async ({ page, trackProgram }) => {
    const programName = uniqueName('No Description Program');

    const programsPage = await createProgram(page, programName, trackProgram, '');
    await programsPage.goto();

    await expectProgramInList(programsPage, programName);
    await expect(programsPage.programRow(programName)).toBeVisible();
  });

  test('DS-5-TC-005: List shows newly created program without reload', { tag: '@sanity' }, async ({ page, trackProgram }) => {
    const programName = uniqueName('New List Entry Program');
    const description = 'Verify list updates in place after creation';
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(programName, description);
    await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());

    await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
    await expectProgramWithDescription(programsPage, programName, description);
    await expect(page).toHaveURL(/\/programs/);
  });

  unauthenticatedTest('DS-5-TC-010: Unauthenticated user cannot access Programs page', { tag: '@e2e' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const programsPage = new ProgramsPage(page);

    await page.goto('/programs');
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(programsPage.heading).not.toBeVisible();
  });
});
