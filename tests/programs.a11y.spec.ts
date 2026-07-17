import { AxeBuilder } from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture.js';
import { ProgramsPage } from '../pages/ProgramsPage.js';

test.describe('Programs accessibility', () => {
  test(
    'Programs page has no accessibility violations @regression',
    { tag: '@regression' },
    async ({ page }) => {
      const programsPage = new ProgramsPage(page);

      await programsPage.goto();
      await expect(programsPage.heading).toBeVisible();

      const results = await new AxeBuilder({ page })
        // .disableRules('color-contrast') // Only uncomment when a known, documented product exception exists.
        .analyze();

      expect(results.violations).toEqual([]);
    },
  );

  test('New Program modal has no accessibility violations', async ({ page }) => {
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await expect(programsPage.newProgramModal.dialog).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      // .disableRules('color-contrast') // Only uncomment when a known, documented product exception exists.
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
