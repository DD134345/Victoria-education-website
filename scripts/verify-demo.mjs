#!/usr/bin/env node
// Demo-content gate (restyle-B). Run after `astro build`.
// Dev-preview content from src/lib/demo.ts must NEVER reach production output.
// Fails loudly if dist/ contains any demo marker:
//   - "Nội dung mẫu" (visible badge on every demo section)
//   - "[Mẫu]" (prefix on every demo title)
//   - "Ảnh minh hoạ" (text inside our SVG placeholders)
//   - "/demo/" (demo asset path, if ever referenced by URL)
//   - "src/assets/photos/" (dev-only photo-frame file-name hint)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MARKERS = ['Nội dung mẫu', '[Mẫu]', 'Ảnh minh hoạ', '/demo/', 'src/assets/photos/', 'khung-anh'];
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
  console.error('[verify-demo] dist/ not found. Run `astro build` first.');
  process.exit(1);
}

const leaked = [];
for (const f of files) {
  let text;
  try {
    text = readFileSync(f, 'utf-8');
  } catch {
    continue; // binary asset: skip
  }
  const hit = MARKERS.filter((m) => text.includes(m));
  if (hit.length > 0) leaked.push({ file: f, markers: hit });
}

if (leaked.length > 0) {
  console.error('[verify-demo] FAIL: demo content leaked into dist/:');
  for (const { file, markers } of leaked) {
    console.error(`  ${file} (markers: ${markers.join(', ')})`);
  }
  process.exit(1);
}

console.log(`[verify-demo] OK — no demo markers in ${files.length} built files.`);
