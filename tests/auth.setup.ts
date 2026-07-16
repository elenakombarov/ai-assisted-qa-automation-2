import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(configDir, '..', 'playwright', '.auth', 'user.json');
const baseUrl = (process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio').replace(/\/$/, '');

setup('authenticate', async ({ page }) => {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing DIDAXIS_EMAIL or DIDAXIS_PASSWORD');
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto(`${baseUrl}/login`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.goto(`${baseUrl}/programs`);
  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
