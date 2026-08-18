import { type Locator, type Page } from '@playwright/test';

export class EditProgramModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.heading = this.dialog.getByRole('heading', { name: 'Edit Program' });
    this.programNameInput = this.dialog.getByLabel('Program Name');
    this.descriptionInput = this.dialog.getByRole('textbox', { name: 'Description' });
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async fill(name?: string, description?: string): Promise<void> {
    if (name !== undefined) {
      await this.programNameInput.fill(name);
    }
    if (description !== undefined) {
      await this.descriptionInput.fill(description);
    }
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
