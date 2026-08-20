#!/usr/bin/env node
/**
 * Heal-on-red assertion guard for Playwright specs under tests/**.
 * Reads afterFileEdit hook JSON from stdin and:
 *   exit 0 — allow (locator-only / coverage preserved)
 *   exit 2 — block (fewer expect( than before, or an expect( was commented out)
 */
import { readFileSync, existsSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const filePath = input.file_path ?? input.filePath ?? '';
const edits = Array.isArray(input.edits) ? input.edits : [];

function normalizePath(path) {
  return String(path).replace(/\\/g, '/');
}

function matchesTestsGlob(path) {
  return /(?:^|\/)tests\//.test(normalizePath(path));
}

function countExpect(text) {
  return (String(text).match(/expect\(/g) || []).length;
}

function isCommentLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
}

function countActiveExpect(text) {
  let count = 0;
  for (const line of String(text).split(/\r?\n/)) {
    if (isCommentLine(line)) continue;
    const matches = line.match(/expect\(/g);
    if (matches) count += matches.length;
  }
  return count;
}

function countCommentedExpect(text) {
  let count = 0;
  for (const line of String(text).split(/\r?\n/)) {
    if (!isCommentLine(line)) continue;
    const matches = line.match(/expect\(/g);
    if (matches) count += matches.length;
  }
  return count;
}

function reconstructBefore(after, fileEdits) {
  let before = after;
  for (const edit of [...fileEdits].reverse()) {
    const oldString = edit.old_string ?? edit.oldString ?? '';
    const newString = edit.new_string ?? edit.newString ?? '';
    if (newString && before.includes(newString)) {
      before = before.replace(newString, oldString);
    }
  }
  return before;
}

function contentFromEdits(fileEdits, key) {
  return fileEdits
    .map((edit) => edit[key] ?? '')
    .join('\n');
}

function log(message) {
  console.log(`[assertion-guard] ${message}`);
}

function fail(message) {
  console.error(`[assertion-guard] BLOCK: ${message}`);
}

if (!filePath) {
  fail('missing file_path in hook input');
  process.exit(2);
}

if (!matchesTestsGlob(filePath)) {
  log(`skip (not under tests/): ${filePath}`);
  process.exit(0);
}

let after = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
let before = reconstructBefore(after, edits);

if (before === after && edits.length > 0) {
  before = contentFromEdits(edits, 'old_string') || contentFromEdits(edits, 'oldString');
  after = contentFromEdits(edits, 'new_string') || contentFromEdits(edits, 'newString');
}

const reasons = [];
const expectBefore = countExpect(before);
const expectAfter = countExpect(after);
const activeBefore = countActiveExpect(before);
const activeAfter = countActiveExpect(after);
const commentedBefore = countCommentedExpect(before);
const commentedAfter = countCommentedExpect(after);

if (expectAfter < expectBefore) {
  reasons.push(`fewer expect( occurrences (${expectBefore} → ${expectAfter})`);
}

if (activeAfter < activeBefore) {
  reasons.push(`fewer active expect( assertions (${activeBefore} → ${activeAfter})`);
}

if (commentedAfter > commentedBefore && activeAfter <= activeBefore) {
  reasons.push(
    `expect( was commented out (commented ${commentedBefore} → ${commentedAfter})`,
  );
}

if (reasons.length > 0) {
  fail(filePath);
  for (const reason of reasons) {
    console.error(`[assertion-guard]   - ${reason}`);
  }
  process.exit(2);
}

log(`allow: ${filePath}`);
process.exit(0);
