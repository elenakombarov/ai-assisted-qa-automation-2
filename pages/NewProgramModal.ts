import { type Locator, type Page } from '@playwright/test';

export class NewProgramModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly validationMessage: Locator;
  readonly showAiConfigButton: Locator;
  readonly hideAiConfigButton: Locator;
  readonly totalProgramHoursInput: Locator;
  readonly defaultSessionHoursInput: Locator;
  readonly defaultExamHoursInput: Locator;
  readonly targetAudienceInput: Locator;
  readonly focusAreasInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.programNameInput = this.dialog.getByLabel('Program Name');
    this.descriptionInput = this.dialog.getByRole('textbox', { name: 'Description' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.validationMessage = this.dialog.getByText(/maximum|too long|exceed|limit/i);
    this.showAiConfigButton = this.dialog.getByRole('button', { name: /Show AI Generation Config/i });
    this.hideAiConfigButton = this.dialog.getByRole('button', { name: /Hide AI Generation Config/i });
    this.totalProgramHoursInput = this.dialog.getByLabel('Total Program Hours');
    this.defaultSessionHoursInput = this.dialog.getByLabel('Default Session Hours');
    this.defaultExamHoursInput = this.dialog.getByLabel('Default Exam Hours');
    this.targetAudienceInput = this.dialog.getByLabel('Target Audience');
    this.focusAreasInput = this.dialog.getByLabel('Focus Areas');
  }

  async expandAiGenerationConfig(): Promise<void> {
    await this.showAiConfigButton.click();
  }

  async collapseAiGenerationConfig(): Promise<void> {
    await this.hideAiConfigButton.click();
  }

  async fillAiGenerationConfig(options: {
    totalHours?: string;
    defaultSessionHours?: string;
    defaultExamHours?: string;
    targetAudience?: string;
    focusAreas?: string;
  }): Promise<void> {
    if (options.totalHours !== undefined) {
      await this.totalProgramHoursInput.fill(options.totalHours);
    }
    if (options.defaultSessionHours !== undefined) {
      await this.defaultSessionHoursInput.fill(options.defaultSessionHours);
    }
    if (options.defaultExamHours !== undefined) {
      await this.defaultExamHoursInput.fill(options.defaultExamHours);
    }
    if (options.targetAudience !== undefined) {
      await this.targetAudienceInput.fill(options.targetAudience);
    }
    if (options.focusAreas !== undefined) {
      await this.focusAreasInput.fill(options.focusAreas);
    }
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
