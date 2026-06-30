import { test, expect, Page } from '@playwright/test';
import { getCallSites } from 'node:util';

const TODO_URL = 'https://demo.playwright.dev/todomvc/#/';

async function gotoEmptyTodoPage(page: Page) {
  await page.goto(TODO_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
}

async function addTodo(page: Page, text: string) {
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill(text);
  await input.press('Enter');
}

function todoItems(page: Page) {
  return page.getByRole('listitem').filter({
    has: page.getByRole('checkbox', { name: 'Toggle Todo' }),
  });
}

function todoItem(page: Page, text: string) {
  return todoItems(page).filter({ hasText: text });
}

async function expectTodoCount(page: Page, count: number) {
  await expect(todoItems(page)).toHaveCount(count);
}

async function toggleTodo(page: Page, text: string) {
  await todoItem(page, text).getByRole('checkbox', { name: 'Toggle Todo' }).click();
}

async function deleteTodo(page: Page, text: string) {
  const item = todoItem(page, text);
  await item.hover();
  await item.getByRole('button').click();
}

async function expectCounter(page: Page, count: number) {
  const label = count === 1 ? '1 item left' : `${count} items left`;
  await expect(page.getByText(label)).toBeVisible();
}

async function expectFooterHidden(page: Page) {
  await expect(page.getByRole('link', { name: 'All' })).not.toBeVisible();
  await expect(page.getByText(/\d+ items? left/)).not.toBeVisible();
}

test.describe('TodoMVC — Add, Complete, and Delete', () => {
  test('TC-001: Add a single todo item to the list', async ({ page }) => {
    await gotoEmptyTodoPage(page);

    const input = page.getByPlaceholder('What needs to be done?');
    await input.click();
    await input.fill('Buy groceries');
    await input.press('Enter');

    await expect(todoItem(page, 'Buy groceries')).toBeVisible();
    await expect(todoItem(page, 'Buy groceries').getByRole('checkbox', { name: 'Toggle Todo' })).not.toBeChecked();
    await expect(input).toBeEmpty();
    await expectCounter(page, 1);
    await expect(page.getByRole('link', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Active' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Completed' })).toBeVisible();
  });

  test('TC-002: Add multiple todo items sequentially', async ({ page }) => {
    await gotoEmptyTodoPage(page);

    await addTodo(page, 'Buy milk');
    await expect(todoItem(page, 'Buy milk')).toBeVisible();
    await expectCounter(page, 1);

    await addTodo(page, 'Walk the dog');
    await expect(todoItem(page, 'Buy milk')).toBeVisible();
    await expect(todoItem(page, 'Walk the dog')).toBeVisible();
    await expectCounter(page, 2);

    await addTodo(page, 'Finish report');
    await expect(todoItem(page, 'Buy milk')).toBeVisible();
    await expect(todoItem(page, 'Walk the dog')).toBeVisible();
    await expect(todoItem(page, 'Finish report')).toBeVisible();
    await expectCounter(page, 3);

    for (const text of ['Buy milk', 'Walk the dog', 'Finish report']) {
      await expect(todoItem(page, text).getByRole('checkbox', { name: 'Toggle Todo' })).not.toBeChecked();
    }
  });

  test('TC-003: Mark a todo item as complete', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    await addTodo(page, 'Buy groceries');

    await toggleTodo(page, 'Buy groceries');

    await expect(todoItem(page, 'Buy groceries').getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();
    await expect(todoItem(page, 'Buy groceries')).toBeVisible();
    await expectCounter(page, 0);
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
  });

  test('TC-004: Delete a todo item from the list', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    await addTodo(page, 'Task to delete');
    await expectCounter(page, 1);

    await deleteTodo(page, 'Task to delete');

    await expect(page.getByText('Task to delete')).not.toBeVisible();
    await expectTodoCount(page, 0);
    await expectFooterHidden(page);
  });

  test('TC-005: Complete one item while others remain active', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Finish report');
    await expectCounter(page, 3);

    await toggleTodo(page, 'Walk the dog');

    await expect(todoItem(page, 'Walk the dog').getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();
    await expect(todoItem(page, 'Buy milk').getByRole('checkbox', { name: 'Toggle Todo' })).not.toBeChecked();
    await expect(todoItem(page, 'Finish report').getByRole('checkbox', { name: 'Toggle Todo' })).not.toBeChecked();
    await expect(todoItem(page, 'Buy milk')).toBeVisible();
    await expect(todoItem(page, 'Walk the dog')).toBeVisible();
    await expect(todoItem(page, 'Finish report')).toBeVisible();
    await expectCounter(page, 2);
  });

  test('TC-006: Delete one item from a list of multiple todos', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    await addTodo(page, 'Task 1');
    await addTodo(page, 'Task 2');
    await addTodo(page, 'Task 3');
    await expectCounter(page, 3);

    await deleteTodo(page, 'Task 2');

    await expect(page.getByText('Task 2')).not.toBeVisible();
    await expect(todoItem(page, 'Task 1')).toBeVisible();
    await expect(todoItem(page, 'Task 3')).toBeVisible();
    await expectCounter(page, 2);
  });

  test('TC-007: Delete a completed todo item', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    await addTodo(page, 'Done task');
    await toggleTodo(page, 'Done task');
    await expectCounter(page, 0);
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();

    await deleteTodo(page, 'Done task');

    await expect(page.getByText('Done task')).not.toBeVisible();
    await expectTodoCount(page, 0);
    await expectFooterHidden(page);
    await expect(page.getByRole('button', { name: 'Clear completed' })).not.toBeVisible();
  });

  test('TC-008: Empty todo is not added when pressing Enter', async ({ page }) => {
    await gotoEmptyTodoPage(page);

    const input = page.getByPlaceholder('What needs to be done?');
    await input.click();
    await input.press('Enter');

    await expectTodoCount(page, 0);
    await expectFooterHidden(page);
    await expect(input).toBeEmpty();
  });

  test('TC-009: Whitespace-only input is not added as a todo', async ({ page }) => {
    await gotoEmptyTodoPage(page);

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('   ');
    await input.press('Enter');

    await expectTodoCount(page, 0);
    await expectFooterHidden(page);
  });

  test('TC-010: Whitespace-only submission does not affect existing todos', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    await addTodo(page, 'Buy groceries');
    await expectCounter(page, 1);

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('     ');
    await input.press('Enter');

    await expectTodoCount(page, 1);
    await expect(todoItem(page, 'Buy groceries')).toBeVisible();
    await expectCounter(page, 1);
  });

  test('TC-011: Delete button is not available when list is empty', async ({ page }) => {
    await gotoEmptyTodoPage(page);

    await expectTodoCount(page, 0);
    await expect(todoItems(page).getByRole('button')).toHaveCount(0);
    await expectFooterHidden(page);
  });

  test('TC-012: Completing a todo does not remove it from the All view', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    await addTodo(page, 'Buy groceries');
    await expect(page.getByRole('link', { name: 'All' })).toBeVisible();

    await toggleTodo(page, 'Buy groceries');

    await expect(todoItem(page, 'Buy groceries')).toBeVisible();
    await expect(todoItem(page, 'Buy groceries').getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();
  });

  test('TC-013: Trim leading and trailing whitespace when adding a todo', async ({ page }) => {
    await gotoEmptyTodoPage(page);

    await addTodo(page, '  Todo with spaces  ');

    await expect(todoItem(page, 'Todo with spaces')).toBeVisible();
    await expect(todoItem(page, 'Todo with spaces').getByText('Todo with spaces', { exact: true })).toBeVisible();
    await expectCounter(page, 1);
  });

  test('TC-014: Todo text with special characters is stored and displayed', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    const text = 'Pay rent — $1,200 (due 6/30)';

    await addTodo(page, text);

    await expect(todoItem(page, text)).toBeVisible();
    await expect(page.getByText(text)).toBeVisible();
  });

  test('TC-015: Todo text with Unicode and emoji is stored and displayed', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    const text = '買い物 🛒';

    await addTodo(page, text);

    await expect(todoItem(page, text)).toBeVisible();
    await expect(page.getByText(text)).toBeVisible();

    await page.reload();

    await expect(todoItem(page, text)).toBeVisible();
    await expect(page.getByText(text)).toBeVisible();
  });

  test('TC-016: Add two todos with identical text', async ({ page }) => {
    await gotoEmptyTodoPage(page);

    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Buy milk');

    await expect(todoItems(page).filter({ hasText: 'Buy milk' })).toHaveCount(2);
    await expectCounter(page, 2);
    await expect(todoItems(page).filter({ hasText: 'Buy milk' }).getByRole('checkbox', { name: 'Toggle Todo' })).toHaveCount(2);
  });

  test('TC-017: Very long todo text (500 characters) is accepted and displayed', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    const longText = 'A'.repeat(500);

    await addTodo(page, longText);

    await expect(todoItem(page, longText)).toBeVisible();
    await expect(page.getByText(longText)).toBeVisible();

    await toggleTodo(page, longText);
    await expect(todoItem(page, longText).getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();

    await deleteTodo(page, longText);
    await expect(page.getByText(longText)).not.toBeVisible();
    await expectFooterHidden(page);
  });

  test('TC-018: Rapid double Enter does not duplicate the same todo', async ({ page }) => {
    await gotoEmptyTodoPage(page);

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Double Enter Test');
    await input.press('Enter');
    await input.press('Enter');

    await expect(todoItems(page).filter({ hasText: 'Double Enter Test' })).toHaveCount(1);
    await expectCounter(page, 1);
    await expect(input).toBeEmpty();
  });

  test('TC-019: Uncomplete a previously completed todo', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    await addTodo(page, 'Buy groceries');
    await toggleTodo(page, 'Buy groceries');
    await expectCounter(page, 0);
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();

    await toggleTodo(page, 'Buy groceries');

    await expect(todoItem(page, 'Buy groceries').getByRole('checkbox', { name: 'Toggle Todo' })).not.toBeChecked();
    await expect(todoItem(page, 'Buy groceries')).toBeVisible();
    await expectCounter(page, 1);
    await expect(page.getByRole('button', { name: 'Clear completed' })).not.toBeVisible();
  });

  test('TC-020: Counter updates correctly when adding, completing, and deleting', async ({ page }) => {
    await gotoEmptyTodoPage(page);

    await addTodo(page, 'Buy milk');
    await expectCounter(page, 1);

    await addTodo(page, 'Walk the dog');
    await expectCounter(page, 2);

    await toggleTodo(page, 'Buy milk');
    await expectCounter(page, 1);

    await deleteTodo(page, 'Walk the dog');
    await expectCounter(page, 0);
    await expect(todoItem(page, 'Buy milk')).toBeVisible();
    await expect(todoItem(page, 'Buy milk').getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();
  });

  test('TC-021: Footer is hidden when the list is empty', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    await expectFooterHidden(page);

    await addTodo(page, 'First task');
    await expectCounter(page, 1);
    await expect(page.getByRole('link', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Active' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Completed' })).toBeVisible();

    await deleteTodo(page, 'First task');
    await expectFooterHidden(page);
  });

  test('TC-022: Todos persist in localStorage after page reload', async ({ page }) => {
    await gotoEmptyTodoPage(page);
    await addTodo(page, 'Persistent 1');
    await addTodo(page, 'Persistent 2');
    await addTodo(page, 'Persistent 3');
    await toggleTodo(page, 'Persistent 2');

    await page.reload();

    await expect(todoItem(page, 'Persistent 1')).toBeVisible();
    await expect(todoItem(page, 'Persistent 2')).toBeVisible();
    await expect(todoItem(page, 'Persistent 3')).toBeVisible();
    await expect(todoItem(page, 'Persistent 2').getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();
    await expectCounter(page, 2);
  });
});
