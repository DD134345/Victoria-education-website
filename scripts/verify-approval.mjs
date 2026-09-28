#!/usr/bin/env node
// Publication gate check. Run after `astro build`.
// The unapproved fixture carries MARKER. If MARKER appears anywhere in dist/,
// an unapproved entry leaked into the built site: fail loudly (hard rule 1).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MARKER = 'UNAPPROVED_FIXTURE_MARKER_DO_NOT_PUBLISH';
const DIST = join(process.cwd(), 'dist');

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

let files;
try {
  files = walk(DIST);
} catch {
  console.error('[verify-approval] dist/ not found. Run `astro build` first.');
  process.exit(1);
}

const leaked = files.filter((f) => readFileSync(f, 'utf-8').includes(MARKER));

if (leaked.length > 0) {
  console.error('[verify-approval] FAIL: unapproved content leaked into dist/:');
  for (const f of leaked) console.error('  ' + f);
  process.exit(1);
}

console.log(`[verify-approval] OK — marker absent from ${files.length} built files.`);
