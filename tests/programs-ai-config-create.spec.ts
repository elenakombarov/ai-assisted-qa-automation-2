import {
  test,
  expect,
  type Page,
  cacheCleanupAuthFromResponse,
} from '../fixtures/cleanup.fixture.js';
import { ProgramsPage } from '../pages/ProgramsPage.js';

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

async function captureProgramCreate(
  page: Page,
  trackProgram: (uuid: string) => void,
  action: () => Promise<void>,
): Promise<void> {
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
      trackProgram(String(uuid));
    }
  }
}

test.describe('Programs: Create with AI Generation Config', () => {
  test('EXP-TC-001: Create program with AI Generation Config and verify persisted values', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('AI Config Program');
    const modal = programsPage.newProgramModal;
    const editModal = programsPage.editProgramModal;

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await expect(modal.dialog).toBeVisible();

    await modal.fill(programName, 'Program with custom AI generation settings');
    await modal.expandAiGenerationConfig();
    await modal.fillAiGenerationConfig({
      totalHours: '120',
      defaultSessionHours: '3',
      defaultExamHours: '2',
      targetAudience: 'Career changers, no CS background',
      focusAreas: 'Python, SQL, Machine Learning',
    });

    await captureProgramCreate(page, trackProgram, () => modal.clickCreate());

    await expect(modal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();

    await programsPage.openEditForm(programName);
    await expect(editModal.dialog).toBeVisible();
    await expect(editModal.heading).toBeVisible();
    await expect(editModal.totalProgramHoursInput).toHaveValue('120');
    await expect(editModal.defaultSessionHoursInput).toHaveValue('3');
    await expect(editModal.defaultExamHoursInput).toHaveValue('2');
    await expect(editModal.targetAudienceInput).toHaveValue('Career changers, no CS background');
    await expect(editModal.focusAreasInput).toHaveValue('Python, SQL, Machine Learning');
  });

  test('EXP-TC-002: Collapsing AI Generation Config preserves entered values before create', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueName('AI Config Collapse Test');
    const modal = programsPage.newProgramModal;

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await modal.fill(programName, 'Verify collapse does not clear AI fields');
    await modal.expandAiGenerationConfig();
    await modal.fillAiGenerationConfig({ totalHours: '900' });
    await modal.collapseAiGenerationConfig();
    await modal.expandAiGenerationConfig();

    await expect(modal.totalProgramHoursInput).toHaveValue('900');

    await captureProgramCreate(page, trackProgram, () => modal.clickCreate());

    await expect(modal.dialog).not.toBeVisible();
    await expect(programsPage.programNameInList(programName)).toBeVisible();

    await programsPage.openEditForm(programName);
    await expect(programsPage.editProgramModal.totalProgramHoursInput).toHaveValue('900');
  });
});
