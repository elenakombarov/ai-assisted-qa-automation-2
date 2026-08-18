#!/usr/bin/env node
/**
 * Generation gate for Playwright specs under tests/**.
 * Reads afterFileEdit hook JSON from stdin, validates the edited file, and:
 *   exit 0 — allow
 *   exit 2 — block (no expect( or forbidden page.locator CSS/XPath)
 */
import { readFileSync, existsSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const filePath = input.file_path ?? input.filePath ?? '';

function normalizePath(path) {
  return path.replace(/\\/g, '/');
}

function matchesTestsGlob(path) {
  return /(?:^|\/)tests\//.test(normalizePath(path));
}

function readEditedContent(path) {
  if (existsSync(path)) {
    return readFileSync(path, 'utf8');
  }

  const edits = input.edits;
  if (Array.isArray(edits) && edits.length > 0) {
    let content = edits[0].old_string ?? '';
    for (const edit of edits) {
      content = content.replace(edit.old_string ?? '', edit.new_string ?? '');
    }
    return content;
  }

  return '';
}

function hasAssertion(content) {
  return content.includes('expect(');
}

function findForbiddenLocator(content) {
  const pattern = /page\.locator\s*\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const arg = match[2];
    if (arg.includes('.') || arg.includes('#') || arg.startsWith('//')) {
      return arg;
    }
  }

  return null;
}

function log(message) {
  console.log(`[generation-gate] ${message}`);
}

function fail(message) {
  console.error(`[generation-gate] BLOCK: ${message}`);
}

if (!filePath) {
  fail('missing file_path in hook input');
  process.exit(2);
}

if (!matchesTestsGlob(filePath)) {
  log(`skip (not under tests/): ${filePath}`);
  process.exit(0);
}

const content = readEditedContent(filePath);
const violations = [];

if (!hasAssertion(content)) {
  violations.push('spec contains no expect( assertion');
}

const forbiddenLocator = findForbiddenLocator(content);
if (forbiddenLocator !== null) {
  violations.push(
    `forbidden CSS/XPath page.locator: page.locator('${forbiddenLocator}')`,
  );
}

if (violations.length > 0) {
  fail(filePath);
  for (const violation of violations) {
    console.error(`[generation-gate]   - ${violation}`);
  }
  process.exit(2);
}

log(`allow: ${filePath}`);
process.exit(0);
