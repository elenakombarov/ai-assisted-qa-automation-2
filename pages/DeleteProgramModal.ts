import { type Locator, type Page } from '@playwright/test';

export class DeleteProgramModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly cancelButton: Locator;
  readonly confirmButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.confirmButton = this.dialog.getByRole('button', { name: 'Delete' });
    this.closeButton = this.dialog.locator('.mantine-Modal-close');
  }

  programNameReference(name: string): Locator {
    return this.dialog.getByText(name, { exact: true });
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickConfirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async doubleClickConfirm(): Promise<void> {
    await this.confirmButton.dblclick();
  }

  async closeViaX(): Promise<void> {
    await this.closeButton.click();
  }

  async confirmViaKeyboard(): Promise<void> {
    await this.confirmButton.focus();
    await this.page.keyboard.press('Enter');
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }
}
