#!/usr/bin/env node
// Validates data/scopes.json and data/sources.json against expected shape.
// Hand-rolled (no npm deps) so it runs cleanly on a bare Node in CI.
//
// Run with:  node scripts/validate-data.mjs
// Exits 0 if all checks pass, 1 otherwise.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const err = (msg) => errors.push(msg);

// ─── load ─────────────────────────────────────────────────────────────
let scopes, sources;
try {
  scopes = JSON.parse(readFileSync(resolve(ROOT, 'data/scopes.json'), 'utf8'));
} catch (e) { err(`scopes.json: ${e.message}`); }
try {
  sources = JSON.parse(readFileSync(resolve(ROOT, 'data/sources.json'), 'utf8'));
} catch (e) { err(`sources.json: ${e.message}`); }
if (errors.length) finish();

// ─── scopes structure ─────────────────────────────────────────────────
if (!Array.isArray(scopes.classes)) err('scopes.classes must be an array');
const classRequired = ['id', 'roman', 'label', 'title', 'lead', 'leadMetric', 'meta', 'models'];
const modelRequired = ['brand', 'name', 'fp', 'mag', 'obj', 'tube', 'elev', 'wind', 'click', 'fovMin', 'fovMax', 'weight', 'length', 'er', 'priceText'];
const allowedFP = new Set(['FFP', 'SFP']);
const allowedTubes = new Set([25.4, 30, 34, 35, 36, 40]);
const magRe = /^\d+(?:\.\d+)?-\d+(?:\.\d+)?×$/;
const seenClassIds = new Set();
const seenKeys = new Set(); // brand|name|classId — must be unique within a class
const allKeysWithClass = new Set();

for (const [ci, c] of scopes.classes.entries()) {
  for (const f of classRequired) {
    if (c[f] === undefined) err(`class[${ci}]: missing required field '${f}'`);
  }
  if (c.id) {
    if (seenClassIds.has(c.id)) err(`duplicate class id: ${c.id}`);
    seenClassIds.add(c.id);
  }
  if (!Array.isArray(c.models) || c.models.length === 0) {
    err(`class[${ci}] (${c.id}): models must be non-empty array`);
    continue;
  }
  const inClassKeys = new Set();
  for (const [mi, m] of c.models.entries()) {
    const where = `class[${ci}] (${c.id}) model[${mi}] (${m.brand}|${m.name})`;
    for (const f of modelRequired) {
      if (m[f] === undefined) err(`${where}: missing field '${f}'`);
    }
    if (m.fp && !allowedFP.has(m.fp)) err(`${where}: invalid fp '${m.fp}' (FFP|SFP only)`);
    if (m.tube !== undefined && !allowedTubes.has(m.tube)) {
      err(`${where}: tube ${m.tube} not in allowed set ${[...allowedTubes].join(',')}`);
    }
    if (m.mag && !magRe.test(m.mag)) err(`${where}: mag '${m.mag}' must match /\\d+-\\d+×/`);
    for (const numField of ['obj', 'elev', 'wind', 'fovMin', 'fovMax', 'weight', 'length', 'er']) {
      const v = m[numField];
      if (v !== null && v !== undefined && (typeof v !== 'number' || v < 0)) {
        err(`${where}: ${numField} must be number≥0 or null, got ${JSON.stringify(v)}`);
      }
    }
    // Within a class, brand|name must be unique (otherwise compare/select breaks)
    if (m.brand && m.name) {
      const k = `${m.brand}|${m.name}`;
      if (inClassKeys.has(k)) err(`${where}: duplicate brand|name within class`);
      inClassKeys.add(k);
      allKeysWithClass.add(`${k}|${c.id}`);
    }
  }
}

// ─── sources structure ────────────────────────────────────────────────
const keyRe = /^[^|]+\|.+$/;
const orphanSources = [];
const allModelKeys = new Set();
for (const c of scopes.classes || []) {
  for (const m of c.models || []) {
    if (m.brand && m.name) allModelKeys.add(`${m.brand}|${m.name}`);
  }
}

for (const [key, val] of Object.entries(sources)) {
  if (!keyRe.test(key)) err(`sources: bad key shape '${key}' (need 'Brand|Name')`);
  if (!Array.isArray(val) || val.length === 0) {
    err(`sources['${key}']: must be non-empty array`);
    continue;
  }
  for (const [i, pair] of val.entries()) {
    if (!Array.isArray(pair) || pair.length !== 2) {
      err(`sources['${key}'][${i}]: must be [label, url] pair`);
      continue;
    }
    const [label, url] = pair;
    if (typeof label !== 'string' || !label) err(`sources['${key}'][${i}]: empty label`);
    if (typeof url !== 'string' || !/^https?:\/\//.test(url)) {
      err(`sources['${key}'][${i}]: invalid url '${url}'`);
    }
  }
  if (!allModelKeys.has(key)) orphanSources.push(key);
}

// Orphans are warnings, not errors — a brand-key may have been renamed
// without cleaning the SOURCES side. Report so the team notices.

// ─── done ─────────────────────────────────────────────────────────────
finish();

function finish() {
  if (orphanSources.length) {
    console.log('⚠ orphan source keys (no matching model):');
    for (const k of orphanSources) console.log('  - ' + k);
  }
  if (errors.length) {
    console.error(`\n✗ ${errors.length} validation error(s):`);
    for (const m of errors) console.error('  - ' + m);
    process.exit(1);
  }
  const totalRows = scopes.classes.reduce((n, c) => n + c.models.length, 0);
  const sourceCount = Object.keys(sources).length;
  console.log(`✓ scopes.json   — ${scopes.classes.length} classes, ${totalRows} rows`);
  console.log(`✓ sources.json  — ${sourceCount} entries${orphanSources.length ? ` (${orphanSources.length} orphans warned)` : ''}`);
  process.exit(0);
}
