#!/usr/bin/env node
/**
 * Constitution WON'T gate for afterFileEdit (Write).
 * Cursor matchers filter tool type, not path — scope tests/** and pages/**
 * via file_path. Exit 0 allow, exit 2 block a newly introduced violation.
 */
import { existsSync, readFileSync } from 'node:fs';

const input = parseStdin();
const filePath = input.file_path ?? input.filePath ?? '';

if (!inScope(filePath)) {
  process.exit(0);
}

const after = getAfter(input, filePath);
const before = getBefore(input, after);
const reasons = introducedViolations(before, after);

if (reasons.length > 0) {
  process.stderr.write(`BLOCKED: ${reasons.join('; ')}\n`);
  process.exit(2);
}

process.exit(0);

function parseStdin() {
  try {
    const raw = readFileSync(0, 'utf8').trim();
    if (!raw) {
      process.stderr.write('BLOCKED: empty hook stdin\n');
      process.exit(2);
    }
    return JSON.parse(raw);
  } catch (error) {
    process.stderr.write(`BLOCKED: invalid hook stdin (${error.message})\n`);
    process.exit(2);
  }
}

function normalizePath(path) {
  return String(path).replace(/\\/g, '/');
}

function inScope(path) {
  const normalized = normalizePath(path);
  return /(?:^|\/)tests\//.test(normalized) || /(?:^|\/)pages\//.test(normalized);
}

function editField(edit, snake, camel) {
  return edit?.[snake] ?? edit?.[camel] ?? '';
}

function getAfter(payload, path) {
  if (path && existsSync(path)) {
    return readFileSync(path, 'utf8');
  }
  const edits = payload.edits ?? [];
  return editField(edits.at(-1) ?? {}, 'new_string', 'newString');
}

function getBefore(payload, after) {
  const edits = payload.edits ?? [];
  if (edits.length === 0) {
    return after;
  }

  if (edits.length === 1) {
    return editField(edits[0], 'old_string', 'oldString');
  }

  let before = after;
  for (const edit of [...edits].reverse()) {
    const oldString = editField(edit, 'old_string', 'oldString');
    const newString = editField(edit, 'new_string', 'newString');
    if (newString && before.includes(newString)) {
      before = before.replace(newString, oldString);
    }
  }
  return before;
}

function stripStrings(source) {
  return source.replace(/(['"`])(?:\\.|(?!\1)[\s\S])*?\1/g, '""');
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function stripStringsAndComments(source) {
  return stripComments(stripStrings(source));
}

function countMatches(source, pattern) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  return (source.match(new RegExp(pattern.source, flags)) ?? []).length;
}

function countWaitForTimeout(source) {
  return countMatches(source, /\bwaitForTimeout\s*\(/);
}

function countXPath(source) {
  return countMatches(
    source,
    /\blocator\s*\(\s*(['"`])(?:xpath\s*=\s*)?\.?\/\//i,
  );
}

function countAnyType(source) {
  const code = stripStringsAndComments(source);
  return countMatches(
    code,
    /(?::|\bas)\s+any\b|<\s*any\b|,\s*any\s*[>,\[\|&]|any\s*\[\s*\]/,
  );
}

function countHardcodedCredentials(source) {
  let count = 0;
  count += countMatches(source, /Bearer\s+eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9._-]+/);
  count += countMatches(source, /['"]eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9._-]+/);

  const named =
    /(?:password|passwd|secret|api[_-]?key|access[_-]?token|auth(?:orization)?[_-]?token|DIDAXIS_(?:PASSWORD|API_TOKEN|TOKEN|EMAIL))\s*[:=]\s*['"]([^'"]+)['"]/gi;
  let match;
  while ((match = named.exec(source))) {
    const lineStart = source.lastIndexOf('\n', match.index) + 1;
    const lineEnd = source.indexOf('\n', match.index);
    const line = source.slice(lineStart, lineEnd === -1 ? source.length : lineEnd);
    if (/process\.env/.test(line) || /\$\{/.test(line) || !match[1].trim()) {
      continue;
    }
    count += 1;
  }
  return count;
}

function countDescribeTags(source) {
  const code = stripStringsAndComments(source);
  let count = 0;
  const describe = /test\.describe(?:\.(?:only|skip|fixme|serial|parallel))?\s*\(/g;
  let match;
  while ((match = describe.exec(code))) {
    const args = code.slice(match.index, match.index + 800).split(/\s*(?:=>|function\s*\()/)[0];
    if (/\{\s*[\s\S]*?\btag\s*:/.test(args)) {
      count += 1;
    }
  }
  return count;
}

function countExpect(source) {
  return countMatches(stripStringsAndComments(source), /\bexpect(?:\.soft)?\s*\(/);
}

function introducedViolations(before, after) {
  const reasons = [];
  if (countWaitForTimeout(after) > countWaitForTimeout(before)) {
    reasons.push('page.waitForTimeout');
  }
  if (countXPath(after) > countXPath(before)) {
    reasons.push('XPath locator');
  }
  if (countAnyType(after) > countAnyType(before)) {
    reasons.push('any type');
  }
  if (countHardcodedCredentials(after) > countHardcodedCredentials(before)) {
    reasons.push('hardcoded credential');
  }
  if (countDescribeTags(after) > countDescribeTags(before)) {
    reasons.push('tag on test.describe()');
  }
  if (countExpect(after) < countExpect(before)) {
    reasons.push('removed/weakened expect(');
  }
  return reasons;
}
