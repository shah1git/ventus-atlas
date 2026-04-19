#!/usr/bin/env node
// Walks every URL in data/sources.json and reports dead links.
// Used by .github/workflows/check-links.yml on a weekly cron.
//
// Output: a markdown report on stdout (consumed by the workflow) +
// non-zero exit if any 4xx/5xx detected. 3xx redirects are tolerated;
// 0 / network errors are reported but don't fail the build (transient).
//
// Concurrency: 6 parallel requests, 8s timeout each. Rate-limit-friendly.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sources = JSON.parse(readFileSync(resolve(ROOT, 'data/sources.json'), 'utf8'));

// Flatten: { key, label, url } per row
const checks = [];
for (const [key, pairs] of Object.entries(sources)) {
  for (const [label, url] of pairs) checks.push({ key, label, url });
}

console.error(`Checking ${checks.length} URLs from ${Object.keys(sources).length} source entries…`);

const CONCURRENCY = 6;
const TIMEOUT_MS = 8000;
const UA = 'Mozilla/5.0 (compatible; ventus-atlas-link-checker/1.0; +https://shah1git.github.io/ventus-atlas/)';

const results = [];
let cursor = 0;
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (cursor < checks.length) {
    const idx = cursor++;
    const c = checks[idx];
    const start = Date.now();
    let status = 0, error = null;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      // Many sites 405 on HEAD — fall back to GET when needed.
      let res;
      try {
        res = await fetch(c.url, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': UA }});
        if (res.status === 405 || res.status === 501) {
          res = await fetch(c.url, { method: 'GET', signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': UA }});
        }
      } finally {
        clearTimeout(t);
      }
      status = res.status;
    } catch (e) {
      error = e.name === 'AbortError' ? 'timeout' : (e.message || String(e));
    }
    const ms = Date.now() - start;
    results.push({ ...c, status, error, ms });
    if (idx % 25 === 0) console.error(`  ${idx + 1}/${checks.length}…`);
  }
});
await Promise.all(workers);

// Categorize:
//   broken   — 404/410 etc. URL is truly gone; needs fix.
//   blocked  — 401/403/429/451: site is up, bot-detection or rate-limit;
//              not a data problem, no exit-code impact.
//   server   — 5xx: server-side issue; usually transient.
//   errored  — network/timeout: transient.
const isBlocked = (s) => s === 401 || s === 403 || s === 429 || s === 451;
const isServer  = (s) => s >= 500 && s <= 599;
const isBroken  = (s) => s >= 400 && s < 500 && !isBlocked(s);

const broken  = results.filter(r => isBroken(r.status));
const blocked = results.filter(r => isBlocked(r.status));
const server  = results.filter(r => isServer(r.status));
const errored = results.filter(r => r.status === 0);

const okCount = results.length - broken.length - blocked.length - server.length - errored.length;
console.error(`\nDone. ok=${okCount}  broken=${broken.length}  blocked=${blocked.length}  server=${server.length}  errored=${errored.length}`);

// Markdown report on stdout (workflow captures it for issue body)
const today = new Date().toISOString().slice(0, 10);
const lines = [];
lines.push(`# Source link health · ${today}`);
lines.push('');
lines.push(`Checked **${results.length}** URLs across **${Object.keys(sources).length}** source entries.`);
lines.push('');
if (broken.length + blocked.length + server.length + errored.length === 0) {
  lines.push('✅ All links healthy.');
} else {
  if (broken.length) {
    lines.push(`## 🔴 ${broken.length} broken (404 / 410 — needs fix)`);
    lines.push('');
    lines.push('| Status | Source key | URL |');
    lines.push('|---|---|---|');
    for (const r of broken) lines.push(`| ${r.status} | \`${r.key}\` (${r.label}) | ${r.url} |`);
    lines.push('');
  }
  if (server.length) {
    lines.push(`## 🟠 ${server.length} server error (5xx — usually transient)`);
    lines.push('');
    lines.push('| Status | Source key | URL |');
    lines.push('|---|---|---|');
    for (const r of server) lines.push(`| ${r.status} | \`${r.key}\` (${r.label}) | ${r.url} |`);
    lines.push('');
  }
  if (blocked.length) {
    lines.push(`## 🟡 ${blocked.length} blocked (403/429/451 — bot detection or rate-limit, **not a data problem**)`);
    lines.push('');
    lines.push('| Status | Source key | URL |');
    lines.push('|---|---|---|');
    for (const r of blocked) lines.push(`| ${r.status} | \`${r.key}\` (${r.label}) | ${r.url} |`);
    lines.push('');
  }
  if (errored.length) {
    lines.push(`## ⚪ ${errored.length} errored (network / timeout — likely transient)`);
    lines.push('');
    lines.push('| Error | Source key | URL |');
    lines.push('|---|---|---|');
    for (const r of errored) lines.push(`| ${r.error} | \`${r.key}\` (${r.label}) | ${r.url} |`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('Generated by [scripts/check-links.mjs](../blob/main/scripts/check-links.mjs).');
}

console.log(lines.join('\n'));

// Exit 1 only on truly broken (4xx non-blocked) — these need attention.
// 5xx/blocked/errored are transient or environmental and don't block CI.
process.exit(broken.length > 0 ? 1 : 0);
