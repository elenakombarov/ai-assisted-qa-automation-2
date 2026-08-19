import { type Locator, type Page } from '@playwright/test';
import { DeleteProgramModal } from './DeleteProgramModal.js';
import { NewProgramModal } from './NewProgramModal.js';

export class ProgramsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly newProgramButton: Locator;
  readonly newProgramModal: NewProgramModal;
  readonly deleteProgramModal: DeleteProgramModal;
  readonly emptyStateMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Programs' });
    this.newProgramButton = page.getByRole('button', { name: 'Create Program' });
    this.newProgramModal = new NewProgramModal(page);
    this.deleteProgramModal = new DeleteProgramModal(page);
    this.emptyStateMessage = page.getByText('No programs yet. Create your first program to get started.');
  }

  async goto(): Promise<void> {
    await this.page.goto('/programs');
    await this.heading.waitFor({ state: 'visible' });
  }

  async openNewProgramForm(): Promise<void> {
    await this.newProgramButton.click();
  }

  programNameInList(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  programRow(name: string): Locator {
    return this.page.getByRole('row').filter({ has: this.page.getByText(name, { exact: true }) });
  }

  deleteButton(name: string): Locator {
    return this.programRow(name).getByRole('button', { name: `Delete ${name}` });
  }

  async scrollToProgram(name: string): Promise<void> {
    const locator = this.programRow(name);
    await locator.waitFor({ state: 'visible', timeout: 10_000 });
    await locator.scrollIntoViewIfNeeded();
  }

  async openDeleteDialog(name: string): Promise<void> {
    await this.scrollToProgram(name);
    await this.deleteButton(name).click();
  }

  async createProgram(name: string, description?: string): Promise<void> {
    await this.goto();
    await this.openNewProgramForm();
    await this.newProgramModal.fill(name, description ?? '');
    await this.newProgramModal.clickCreate();
  }
}
