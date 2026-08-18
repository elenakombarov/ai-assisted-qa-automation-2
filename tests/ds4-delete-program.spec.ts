import {
  test,
  unauthenticatedTest,
  expect,
  type Page,
  cacheCleanupAuthFromResponse,
} from '../fixtures/cleanup.fixture.js';
import { LoginPage } from '../pages/LoginPage.js';
import { DeleteProgramModal } from '../pages/DeleteProgramModal.js';
import { ProgramsPage } from '../pages/ProgramsPage.js';

/** Limits from Confluence Program Setup — Field Definitions (DS-2/DS-4). */
const MAX_NAME_LENGTH = 100;

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
  trackProgram?: (uuid: string) => void,
  description = '',
): Promise<void> {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
  await programsPage.openNewProgramForm();
  await programsPage.newProgramModal.fill(name, description);
  await captureProgramCreate(page, trackProgram, () => programsPage.newProgramModal.clickCreate());
  await expect(programsPage.newProgramModal.dialog).not.toBeVisible();
}

async function expectProgramInList(page: Page, name: string): Promise<void> {
  const programsPage = new ProgramsPage(page);
  await programsPage.scrollToProgram(name);
  await expect(programsPage.programNameInList(name).first()).toBeVisible();
}

async function expectProgramNotInList(page: Page, name: string): Promise<void> {
  await expect(page.getByText(name, { exact: true })).toHaveCount(0);
}

async function openDeleteDialog(page: Page, name: string): Promise<ProgramsPage> {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
  await programsPage.openDeleteDialog(name);
  const confirmDialog = DeleteProgramModal.getNativeConfirmDialog(page);
  expect(confirmDialog).toBeDefined();
  expect(confirmDialog!.type()).toBe('confirm');
  expect(confirmDialog!.message()).toContain(name);
  return programsPage;
}

async function confirmDelete(page: Page): Promise<void> {
  const programsPage = new ProgramsPage(page);
  await programsPage.deleteProgramModal.clickConfirm();
}

async function cancelDelete(page: Page): Promise<void> {
  const programsPage = new ProgramsPage(page);
  await programsPage.deleteProgramModal.clickCancel();
}

test.describe('DS-4: Delete Program with Confirmation', () => {
  test.describe.configure({ timeout: 60_000 });

  test('DS-4-TC-001: Delete program with confirmation', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName);
    const programsPage = await openDeleteDialog(page, programName);
    await confirmDelete(page);

    await expect(programsPage.deleteProgramModal.dialog).not.toBeVisible();
    await expectProgramNotInList(page, programName);
  });

  test('DS-4-TC-002: Cancel program deletion', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, trackProgram);
    await openDeleteDialog(page, programName);
    await cancelDelete(page);

    const programsPage = new ProgramsPage(page);
    await expect(programsPage.deleteProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-4-TC-003: Program list updates without page refresh after delete', async ({ page }) => {
    const programName = uniqueName('No Refresh Delete Test');

    await createProgram(page, programName);
    await openDeleteDialog(page, programName);
    await confirmDelete(page);

    await expectProgramNotInList(page, programName);
    await expect(page).toHaveURL(/\/programs/);
  });

  test('DS-4-TC-004: Delete program with special characters in name', async ({ page }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');

    await createProgram(page, programName);
    await openDeleteDialog(page, programName);
    await confirmDelete(page);

    await expectProgramNotInList(page, programName);
  });

  test('DS-4-TC-005: Delete program with maximum length name', async ({ page }) => {
    const programName = `${'M'.repeat(MAX_NAME_LENGTH - 9)}${Date.now() % 100000}`.slice(0, MAX_NAME_LENGTH);

    await createProgram(page, programName);
    await openDeleteDialog(page, programName);
    await confirmDelete(page);

    await expectProgramNotInList(page, programName);
  });

  test('DS-4-TC-006: Delete program with Unicode and emoji in name', async ({ page }) => {
    const programName = uniqueName('プログラム 🎓 2026');

    await createProgram(page, programName);
    await openDeleteDialog(page, programName);
    await confirmDelete(page);

    await expectProgramNotInList(page, programName);
  });

  test('DS-4-TC-007: Confirmation dialog displays program name', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, trackProgram);
    const programsPage = await openDeleteDialog(page, programName);

    await expect(DeleteProgramModal.getNativeConfirmDialog(page)!.message()).toContain(programName);
    await cancelDelete(page);
  });

  test('DS-4-TC-008: Non-admin user cannot delete a program', async ({ page, trackProgram }) => {
    test.skip(
      !process.env.DIDAXIS_VIEWER_EMAIL || !process.env.DIDAXIS_VIEWER_PASSWORD,
      'Requires DIDAXIS_VIEWER_EMAIL and DIDAXIS_VIEWER_PASSWORD environment variables',
    );

    const programName = uniqueName('Test Program');
    await createProgram(page, programName, trackProgram);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.signIn(process.env.DIDAXIS_VIEWER_EMAIL!, process.env.DIDAXIS_VIEWER_PASSWORD!);

    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await expect(programsPage.deleteButton(programName)).not.toBeVisible();
    await expect(page.getByRole('button', { name: /^Delete / })).toHaveCount(0);
  });

  unauthenticatedTest('DS-4-TC-009: Unauthenticated user cannot delete a program', async ({ page }) => {
    await page.goto(PROGRAMS_URL);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel('Email')).toBeVisible();

    const response = await page.request.delete(`${BASE_URL}/api/programs/00000000-0000-0000-0000-000000000000`);
    expect(response.status()).toBeGreaterThanOrEqual(401);
    expect(response.status()).toBeLessThan(500);
  });

  test('DS-4-TC-010: Delete fails gracefully on server error', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, trackProgram);
    await page.route('**/programs/**', (route) => {
      if (route.request().method() === 'DELETE') {
        void route.fulfill({ status: 500, body: 'Internal Server Error' });
        return;
      }
      void route.continue();
    });

    await openDeleteDialog(page, programName);
    const deleteResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/programs') && resp.request().method() === 'DELETE',
    );
    await confirmDelete(page);

    expect((await deleteResponsePromise).status()).toBe(500);
    await expectProgramInList(page, programName);
  });

  test('DS-4-TC-011: Cannot delete program already deleted by another user', async () => {
    test.skip(true, 'Requires multi-session or API setup to delete program while confirmation dialog is open');
  });

  test('DS-4-TC-012: Dismiss confirmation dialog via Esc or close control', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, trackProgram);
    const programsPage = await openDeleteDialog(page, programName);
    await programsPage.deleteProgramModal.pressEscape();

    await expect(programsPage.deleteProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);

    await programsPage.openDeleteDialog(programName);
    await programsPage.deleteProgramModal.closeViaX();

    await expect(programsPage.deleteProgramModal.dialog).not.toBeVisible();
    await expectProgramInList(page, programName);
  });

  test('DS-4-TC-013: Delete blocked when program has dependent curriculum', async () => {
    test.skip(true, 'Requires program with linked curriculum — no API/UI setup available in E2E suite');
  });

  test('DS-4-TC-014: Rapid double-click on confirm does not cause errors', async ({ page }) => {
    const programName = uniqueName('Double Click Delete Test');
    let deleteCount = 0;

    await createProgram(page, programName);
    await page.route('**/programs/**', (route) => {
      if (route.request().method() === 'DELETE') {
        deleteCount += 1;
      }
      void route.continue();
    });

    const programsPage = await openDeleteDialog(page, programName);
    await programsPage.deleteProgramModal.doubleClickConfirm();

    await expect(programsPage.deleteProgramModal.dialog).not.toBeVisible();
    await expectProgramNotInList(page, programName);
    expect(deleteCount).toBeLessThanOrEqual(1);
  });

  test('DS-4-TC-015: Delete last remaining program in list', async ({ page }) => {
    const programName = uniqueName('Sole Program');

    await createProgram(page, programName);
    await openDeleteDialog(page, programName);
    await confirmDelete(page);

    await expectProgramNotInList(page, programName);
  });

  test('DS-4-TC-016: Delete one program when multiple programs exist', async ({ page, trackProgram }) => {
    const programA = uniqueName('Program A');
    const programB = uniqueName('Program B');
    const programC = uniqueName('Program C');

    await createProgram(page, programA, trackProgram);
    await createProgram(page, programB);
    await createProgram(page, programC, trackProgram);

    await openDeleteDialog(page, programB);
    await confirmDelete(page);

    await expectProgramNotInList(page, programB);
    await expectProgramInList(page, programA);
    await expectProgramInList(page, programC);
  });

  test('DS-4-TC-017: Delete program with duplicate display name in list', async () => {
    test.skip(true, 'Duplicate program names are prevented by DS-3 — cannot create two programs with the same name');
  });

  test('DS-4-TC-018: Delete program with HTML/script characters in name', async ({ page }) => {
    const programName = `<script>alert('xss')</script> ${Date.now()}`.slice(0, MAX_NAME_LENGTH);
    let dialogShown = false;

    page.on('dialog', async (dialog) => {
      if (dialog.type() === 'alert') {
        dialogShown = true;
        await dialog.dismiss();
      }
    });

    await createProgram(page, programName);
    const programsPage = await openDeleteDialog(page, programName);

    expect(dialogShown).toBe(false);
    await expect(DeleteProgramModal.getNativeConfirmDialog(page)!.message()).toContain(programName);
    await confirmDelete(page);

    expect(dialogShown).toBe(false);
    await expectProgramNotInList(page, programName);
  });

  test('DS-4-TC-019: Delete program with minimum length name (1 character)', async ({ page }) => {
    const programName = String.fromCharCode(65 + (Date.now() % 26));

    await createProgram(page, programName);
    await openDeleteDialog(page, programName);
    await confirmDelete(page);

    await expectProgramNotInList(page, programName);
  });

  test('DS-4-TC-020: Re-open delete dialog after cancel', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName);
    await openDeleteDialog(page, programName);
    await cancelDelete(page);

    await openDeleteDialog(page, programName);
    await confirmDelete(page);

    await expectProgramNotInList(page, programName);
  });

  test('DS-4-TC-021: Confirm deletion via keyboard', async ({ page }) => {
    const programName = uniqueName('Keyboard Delete Test');

    await createProgram(page, programName);
    const programsPage = await openDeleteDialog(page, programName);
    await programsPage.deleteProgramModal.confirmViaKeyboard();

    await expect(programsPage.deleteProgramModal.dialog).not.toBeVisible();
    await expectProgramNotInList(page, programName);
  });

  test('DS-4-TC-022: Delete program with leading/trailing whitespace in name', async ({ page }) => {
    const storedName = uniqueName('Test Program');
    const paddedName = `  ${storedName}  `;

    await createProgram(page, paddedName);
    await openDeleteDialog(page, storedName);
    await confirmDelete(page);

    await expectProgramNotInList(page, storedName);
  });
});
