import {
  test as base,
  expect,
  chromium,
  request as playwrightRequest,
  type APIRequestContext,
} from '@playwright/test';

const BASE_URL = (process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio').replace(/\/$/, '');

const trackedProgramIds = new Set<string>();
let cachedAuthorizationHeader: string | undefined;

function extractToken(body: Record<string, unknown>): string | undefined {
  const data = body.data as Record<string, unknown> | undefined;
  for (const candidate of [
    body.token,
    body.access_token,
    body.accessToken,
    data?.token,
    data?.access_token,
    data?.accessToken,
  ]) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }
  return undefined;
}

export function cacheCleanupAuthFromResponse(response: {
  request: () => { headers: () => Record<string, string> };
}): void {
  const headers = response.request().headers();
  const auth = headers.authorization ?? headers.Authorization;
  if (auth) {
    cachedAuthorizationHeader = auth;
  }
}

function requireCleanupCredentials(): { email: string; password: string } {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing DIDAXIS_EMAIL or DIDAXIS_PASSWORD for program cleanup');
  }
  return { email, password };
}

async function loginViaApi(): Promise<APIRequestContext | null> {
  const bare = await playwrightRequest.newContext({ baseURL: BASE_URL });
  const { email, password } = requireCleanupCredentials();

  const response = await bare.post(`${BASE_URL}/api/auth/login`, {
    data: { email, password },
  });

  if (!response.ok()) {
    await bare.dispose();
    return null;
  }

  const body = await response.json();
  const token = extractToken(body as Record<string, unknown>);
  if (!token) {
    await bare.dispose();
    return null;
  }

  await bare.dispose();
  const apiContext = await playwrightRequest.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });

  const probe = await apiContext.get(`${BASE_URL}/api/programs`);
  if (!probe.ok()) {
    await apiContext.dispose();
    return null;
  }

  return apiContext;
}

async function getCleanupApiContext(): Promise<{
  apiContext: APIRequestContext;
  dispose: () => Promise<void>;
}> {
  if (cachedAuthorizationHeader) {
    const apiContext = await playwrightRequest.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { Authorization: cachedAuthorizationHeader },
    });
    const probe = await apiContext.get(`${BASE_URL}/api/programs`);
    if (probe.ok()) {
      return {
        apiContext,
        dispose: async () => {
          await apiContext.dispose();
        },
      };
    }
    await apiContext.dispose();
  }

  const apiContext = await loginViaApi();
  if (apiContext) {
    return {
      apiContext,
      dispose: async () => {
        await apiContext.dispose();
      },
    };
  }

  const { email, password } = requireCleanupCredentials();
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  const loginResponsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/api/auth/login') && resp.request().method() === 'POST',
  );

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  const loginResponse = await loginResponsePromise;
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });

  if (loginResponse.ok()) {
    const body = (await loginResponse.json()) as Record<string, unknown>;
    const token = extractToken(body);
    if (token) {
      cachedAuthorizationHeader = `Bearer ${token}`;
      await browser.close();
      const authedContext = await playwrightRequest.newContext({
        baseURL: BASE_URL,
        extraHTTPHeaders: { Authorization: cachedAuthorizationHeader },
      });
      return {
        apiContext: authedContext,
        dispose: async () => {
          await authedContext.dispose();
        },
      };
    }
  }

  return {
    apiContext: context.request,
    dispose: async () => {
      await browser.close();
    },
  };
}

async function deleteTrackedPrograms(): Promise<void> {
  if (trackedProgramIds.size === 0) {
    return;
  }

  const ids = [...trackedProgramIds];
  trackedProgramIds.clear();

  let dispose = async () => {};
  try {
    const { apiContext, dispose: cleanup } = await getCleanupApiContext();
    dispose = cleanup;

    for (const id of ids) {
      try {
        const response = await apiContext.delete(`/api/programs/${id}`);
        if (!response.ok() && response.status() !== 404) {
          console.warn(`Failed to delete program ${id}: ${response.status()} ${await response.text()}`);
        }
      } catch (error) {
        console.warn(`Error deleting program ${id}:`, error);
      }
    }
  } finally {
    await dispose();
  }
}

type TrackProgram = (uuid: string) => void;

export const test = base.extend<{ trackProgram: TrackProgram }, { _workerCleanup: void }>({
  trackProgram: async ({}, use) => {
    const track: TrackProgram = (uuid) => {
      if (uuid) {
        trackedProgramIds.add(uuid);
      }
    };
    await use(track);
  },

  _workerCleanup: [
    async ({}, use) => {
      await use();
      await deleteTrackedPrograms();
    },
    { scope: 'worker', auto: true },
  ],
});

export { expect };
export type { Page } from '@playwright/test';
