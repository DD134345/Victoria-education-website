#!/usr/bin/env node
// SEO acceptance gate. Run after `astro build`.
// Checks every HTML file in dist/: exactly one H1, <html lang>, <link rel="canonical">,
// <meta name="description"> present. Preview build (PUBLIC_ALLOW_INDEXING unset or not production) must contain noindex.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  console.error('[verify-seo] dist/ not found. Run `astro build` first.');
  process.exit(1);
}

const htmlFiles = files.filter((f) => f.endsWith('.html'));
let failures = 0;

for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf-8');

  // 1. Exactly one H1
  const h1Matches = html.match(/<h1[\s>]/g) || [];
  if (h1Matches.length !== 1) {
    console.error(`[verify-seo] FAIL: ${f} has ${h1Matches.length} H1 (expected 1)`);
    failures++;
  }

  // 2. <html lang="...">
  if (!html.match(/<html[^>]*lang=["'][a-z]{2}(-[A-Z]{2})?["']/)) {
    console.error(`[verify-seo] FAIL: ${f} missing <html lang>`);
    failures++;
  }

  // 3. <link rel="canonical" href="...">
  if (!html.match(/<link[^>]*rel=["']canonical["'][^>]*>/)) {
    console.error(`[verify-seo] FAIL: ${f} missing <link rel="canonical">`);
    failures++;
  }

  // 4. <meta name="description" content="...">
  if (!html.match(/<meta[^>]*name=["']description["'][^>]*content=["'][^"']+["']/)) {
    console.error(`[verify-seo] FAIL: ${f} missing <meta name="description" content>`);
    failures++;
  }
}

// 5. Preview build: noindex must be present (indexing disabled by default)
const hasNoindex = htmlFiles.some((f) =>
  readFileSync(f, 'utf-8').includes('noindex'),
);
if (!hasNoindex) {
  console.error('[verify-seo] FAIL: preview build must contain noindex (PUBLIC_ALLOW_INDEXING unset or not production)');
  failures++;
}

if (failures > 0) {
  console.error(`[verify-seo] ${failures} failure(s).`);
  process.exit(1);
}

console.log(`[verify-seo] OK — ${htmlFiles.length} HTML files pass H1/lang/canonical/description; noindex present.`);