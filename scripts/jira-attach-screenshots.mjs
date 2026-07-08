#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const root = process.cwd();
dotenv.config({ path: path.join(root, 'TODO_MVC', '.env') });

const [issueKey, ...fileArgs] = process.argv.slice(2);
if (!issueKey || fileArgs.length === 0) {
  console.error('Usage: node scripts/jira-attach-screenshots.mjs ISSUE-KEY file1.png [file2.png ...]');
  process.exit(1);
}

const email = process.env.JIRA_LOGIN_EMAIL;
const token = process.env.JIRA_API_TOKEN;
const site = process.env.JIRA_SITE ?? 'legionqaschool.atlassian.net';

if (!email || !token) {
  console.error('Missing JIRA_LOGIN_EMAIL or JIRA_API_TOKEN in TODO_MVC/.env');
  process.exit(1);
}

const auth = Buffer.from(`${email}:${token}`).toString('base64');

for (const file of fileArgs) {
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const body = fs.readFileSync(resolved);
  const filename = path.basename(resolved);
  const boundary = `----playwrightboundary${Date.now()}`;
  const payload = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
        `Content-Type: image/png\r\n\r\n`,
    ),
    body,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const response = await fetch(`https://${site}/rest/api/3/issue/${issueKey}/attachments`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'X-Atlassian-Token': 'no-check',
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: payload,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Upload failed for ${filename}: HTTP ${response.status} ${text}`);
    process.exit(1);
  }

  console.log(`Attached ${filename} to ${issueKey}`);
}
