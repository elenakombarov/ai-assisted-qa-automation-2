import { type Dialog, type Locator, type Page } from '@playwright/test';

type ConfirmationAction = 'confirm' | 'cancel';

const nativeConfirmDialogs = new WeakMap<Page, Dialog>();
const confirmationResolvers = new WeakMap<Page, (action: ConfirmationAction) => void>();

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
    this.closeButton = this.dialog.getByRole('button', { name: 'Close' });
  }

  static captureNativeConfirmDialog(page: Page, dialog: Dialog): void {
    nativeConfirmDialogs.set(page, dialog);
  }

  static armNativeConfirmDialog(page: Page): void {
    page.once('dialog', async (dialog) => {
      nativeConfirmDialogs.set(page, dialog);
      const action = await new Promise<ConfirmationAction>((resolve) => {
        confirmationResolvers.set(page, resolve);
      });
      confirmationResolvers.delete(page);
      nativeConfirmDialogs.delete(page);
      if (action === 'confirm') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  static getNativeConfirmDialog(page: Page): Dialog | undefined {
    return nativeConfirmDialogs.get(page);
  }

  programNameReference(name: string): Locator {
    return this.dialog.getByText(name, { exact: true });
  }

  async clickCancel(): Promise<void> {
    const resolve = confirmationResolvers.get(this.page);
    if (resolve) {
      resolve('cancel');
      return;
    }
    await this.cancelButton.click();
  }

  async clickConfirm(): Promise<void> {
    const resolve = confirmationResolvers.get(this.page);
    if (resolve) {
      resolve('confirm');
      return;
    }
    await this.confirmButton.click();
  }

  async doubleClickConfirm(): Promise<void> {
    const resolve = confirmationResolvers.get(this.page);
    if (resolve) {
      resolve('confirm');
      return;
    }
    await this.confirmButton.dblclick();
  }

  async closeViaX(): Promise<void> {
    const resolve = confirmationResolvers.get(this.page);
    if (resolve) {
      resolve('cancel');
      return;
    }
    await this.closeButton.click();
  }

  async confirmViaKeyboard(): Promise<void> {
    await this.clickConfirm();
  }

  async pressEscape(): Promise<void> {
    const resolve = confirmationResolvers.get(this.page);
    if (resolve) {
      resolve('cancel');
      return;
    }
    await this.page.keyboard.press('Escape');
  }
}
