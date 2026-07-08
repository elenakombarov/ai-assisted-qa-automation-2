#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const resultsDir = path.join(root, 'test-results');

function findPngs(dir) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...findPngs(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      found.push(full);
    }
  }
  return found;
}

function latestMtime(paths) {
  return Math.max(...paths.map((p) => fs.statSync(p).mtimeMs));
}

const args = process.argv.slice(2);
const filter = args.find((a) => a !== '--latest');
const pngs = findPngs(resultsDir);

let matches = pngs;
if (filter) {
  matches = pngs.filter((p) => p.includes(filter));
}
if (args.includes('--latest') && matches.length > 0) {
  const newest = latestMtime(matches);
  matches = matches.filter((p) => fs.statSync(p).mtimeMs === newest);
}

if (matches.length === 0) {
  process.exit(1);
}

process.stdout.write(matches.join('\n'));
