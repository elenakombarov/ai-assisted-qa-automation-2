import { type Locator, type Page } from '@playwright/test';
import { NewProgramModal } from './NewProgramModal.js';

export class ProgramsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly newProgramButton: Locator;
  readonly newProgramModal: NewProgramModal;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Programs' });
    this.newProgramButton = page.getByRole('button', { name: 'New Program' });
    this.newProgramModal = new NewProgramModal(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/programs');
  }

  async openNewProgramForm(): Promise<void> {
    await this.newProgramButton.click();
  }

  programNameInList(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  async createProgram(name: string, description?: string): Promise<void> {
    await this.goto();
    await this.openNewProgramForm();
    await this.newProgramModal.fill(name, description ?? '');
    await this.newProgramModal.clickCreate();
  }
}
