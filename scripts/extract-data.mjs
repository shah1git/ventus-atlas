#!/usr/bin/env node
// Extracts CLASSES and SOURCES from index.html into data/scopes.json + data/sources.json.
// One-shot tool — after extraction, index.html will fetch the JSON files instead.
//
// Run with:  node scripts/extract-data.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');

// Match the source variable that gets spread into Ventus FFP rows
const V = { ventus: true, fp: 'FFP' };

const classesMatch = html.match(/const CLASSES = (\[[\s\S]*?\n\]);/);
if (!classesMatch) throw new Error('CLASSES block not found');
const sourcesMatch = html.match(/const SOURCES = (\{[\s\S]*?\n\});/);
if (!sourcesMatch) throw new Error('SOURCES block not found');

// Wrap in parens so eval treats the {…} as an object literal, not a block.
// eslint-disable-next-line no-eval
const CLASSES = (function () { return eval('(' + classesMatch[1] + ')'); })();
// eslint-disable-next-line no-eval
const SOURCES = (function () { return eval('(' + sourcesMatch[1] + ')'); })();

// Sanity: CLASSES is array of class objects, each with .models[]
if (!Array.isArray(CLASSES) || CLASSES.length !== 8) {
  throw new Error(`Expected 8 classes, got ${CLASSES.length}`);
}

const scopesOut = { classes: CLASSES };
const sourcesOut = SOURCES;

writeFileSync(
  resolve(ROOT, 'data/scopes.json'),
  JSON.stringify(scopesOut, null, 2) + '\n'
);
writeFileSync(
  resolve(ROOT, 'data/sources.json'),
  JSON.stringify(sourcesOut, null, 2) + '\n'
);

const totalRows = CLASSES.reduce((n, c) => n + c.models.length, 0);
const totalSources = Object.keys(SOURCES).length;
console.log(`✓ data/scopes.json   — ${CLASSES.length} classes, ${totalRows} rows`);
console.log(`✓ data/sources.json  — ${totalSources} entries`);
