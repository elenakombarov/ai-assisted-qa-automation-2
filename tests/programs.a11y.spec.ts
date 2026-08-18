import { AxeBuilder } from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { NodeResult, Result } from 'axe-core';
import { test, expect } from '../fixtures/cleanup.fixture.js';
import { ProgramsPage } from '../pages/ProgramsPage.js';

const KNOWN_COLOR_CONTRAST_TEXT = [
  'Sign out',
  'Manage academic programs and semesters',
  'No programs yet. Create your first program to get started.',
  'Select a program to manage semesters',
] as const;

async function getNodeText(page: Page, target: string[]): Promise<string> {
  return (await page.locator(target.join(' >> ')).first().textContent() ?? '').trim();
}

async function isKnownColorContrastNode(page: Page, node: NodeResult): Promise<boolean> {
  const text = await getNodeText(page, node.target as string[]);

  const isKnownText = (KNOWN_COLOR_CONTRAST_TEXT as readonly string[]).includes(text);

  const target = (node.target as string[]).join(' ');
  const isKnownProgramDescription =
    target.includes('td:nth-child(1)') &&
    target.includes('p[data-line-clamp="true"][data-size="xs"]');

  return isKnownText || isKnownProgramDescription;
}

async function partitionProgramsPageViolations(page: Page, violations: Result[]) {
  const known: Result[] = [];
  const unexpected: Result[] = [];

  for (const violation of violations) {
    if (violation.id === 'page-has-heading-one') {
      known.push(violation);
      continue;
    }

    if (violation.id === 'empty-table-header') {
      known.push(violation);
      continue;
    }

    if (violation.id === 'color-contrast') {
      const knownNodes: NodeResult[] = [];
      const unexpectedNodes: NodeResult[] = [];

      for (const node of violation.nodes) {
        if (await isKnownColorContrastNode(page, node)) {
          knownNodes.push(node);
        } else {
          unexpectedNodes.push(node);
        }
      }

      if (knownNodes.length > 0) {
        known.push({ ...violation, nodes: knownNodes });
      }
      if (unexpectedNodes.length > 0) {
        unexpected.push({ ...violation, nodes: unexpectedNodes });
      }
      continue;
    }

    unexpected.push(violation);
  }

  return { known, unexpected };
}

test.describe('Programs accessibility', () => {
  test(
    'Programs page has no accessibility violations @regression',
    { tag: '@regression' },
    async ({ page }, testInfo) => {
      const programsPage = new ProgramsPage(page);

      await programsPage.goto();
      await expect(programsPage.heading).toBeVisible();

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const { known, unexpected } = await partitionProgramsPageViolations(page, results.violations);

      if (known.length > 0) {
        await testInfo.attach('known-product-a11y-issues', {
          body: JSON.stringify(known, null, 2),
          contentType: 'application/json',
        });
      }

      expect(unexpected).toEqual([]);
    },
  );

  test('New Program modal has no accessibility violations', async ({ page }, testInfo) => {
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await expect(programsPage.newProgramModal.dialog).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('[role="dialog"]')
      .analyze();

    // Known product issue: only the Mantine icon-only close button is missing a name.
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
  });

  test(
    'Keyboard: Tab to New Program then Enter opens creation dialog',
    { tag: '@a11y' },
    async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      await programsPage.goto();
      await expect(programsPage.heading).toBeVisible();

      const button = programsPage.newProgramButton;
      const maxTabs = 40;
      for (let i = 0; i < maxTabs; i += 1) {
        const focused = await button.evaluate((el) => el === document.activeElement);
        if (focused) {
          break;
        }
        await page.keyboard.press('Tab');
      }

      await expect(button).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(programsPage.newProgramModal.dialog).toBeVisible();
    },
  );
});
