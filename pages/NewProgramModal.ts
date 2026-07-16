import { type Locator, type Page } from '@playwright/test';

export class NewProgramModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly validationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.programNameInput = this.dialog.getByLabel('Program Name');
    this.descriptionInput = this.dialog.getByRole('textbox', { name: 'Description' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.validationMessage = this.dialog.getByText(/maximum|too long|exceed|limit/i);
  }

  async fill(name: string, description?: string): Promise<void> {
    await this.programNameInput.fill(name);
    if (description !== undefined) {
      await this.descriptionInput.fill(description);
    }
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async doubleClickCreate(): Promise<void> {
    await this.createButton.dblclick();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
