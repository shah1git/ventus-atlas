#!/usr/bin/env node
// Replaces inline `const SOURCES = {…};` and `const CLASSES = [...];` in
// index.html with stubs (`let SOURCES = {}; let CLASSES = [];`), and wraps
// the bottom init (`parseHash(); renderAll();`) in an async fetch loader.
//
// Idempotent — safe to re-run; bails out if the file already looks refactored.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = resolve(ROOT, 'index.html');
let html = readFileSync(indexPath, 'utf8');

if (html.includes('await Promise.all([')) {
  console.log('index.html already refactored — nothing to do.');
  process.exit(0);
}

// 1. Replace SOURCES block: `const SOURCES = {…};` (multiline)
const sourcesBlock = /const SOURCES = \{[\s\S]*?\n\};\n/;
if (!sourcesBlock.test(html)) throw new Error('SOURCES block not found');
html = html.replace(sourcesBlock, 'let SOURCES = {};\n');

// 2. Replace CLASSES block: `const CLASSES = [...];`
const classesBlock = /const CLASSES = \[[\s\S]*?\n\];\n/;
if (!classesBlock.test(html)) throw new Error('CLASSES block not found');
html = html.replace(classesBlock, 'let CLASSES = [];\n');

// 3. Drop the now-unused `const V = …;` helper (only used inside the inline
// CLASSES block via `...V` spreads, now resolved into the JSON).
html = html.replace(/^const V = \{ventus:true,fp:'FFP'\};\n/m, '');

// 4. Wrap the bottom init in async loader. Replace the last two lines:
//    parseHash();
//    renderAll();
// …with an async IIFE that fetches both JSON files before rendering.
const initBlock = 'parseHash();\nrenderAll();\n';
if (!html.includes(initBlock)) throw new Error('Init block not found');
const newInit = `// Boot — fetch data, hydrate globals, then render.
(async () => {
  try {
    const [scopesRes, sourcesRes] = await Promise.all([
      fetch('./data/scopes.json'),
      fetch('./data/sources.json'),
    ]);
    if (!scopesRes.ok || !sourcesRes.ok) {
      throw new Error('Failed to load data: ' + scopesRes.status + '/' + sourcesRes.status);
    }
    const scopes = await scopesRes.json();
    const sources = await sourcesRes.json();
    CLASSES.push(...scopes.classes);
    Object.assign(SOURCES, sources);
    parseHash();
    renderAll();
  } catch (err) {
    document.body.innerHTML =
      '<div style="font:14px monospace;padding:40px;color:#900">' +
      'Failed to load atlas data. ' + err.message + '</div>';
    console.error(err);
  }
})();
`;
html = html.replace(initBlock, newInit);

writeFileSync(indexPath, html);
console.log('✓ index.html refactored — data now loaded async from data/*.json');
