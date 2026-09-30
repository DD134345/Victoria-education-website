#!/usr/bin/env node
// Fails if any published raster image still carries EXIF/XMP/IPTC metadata (GPS etc.).
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const DIST = join(process.cwd(), 'dist');
const walk = (d) => readdirSync(d, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const files = walk(DIST).filter((f) => ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(extname(f).toLowerCase()));
const dirty = [];
for (const f of files) {
  const m = await sharp(readFileSync(f)).metadata();
  if (m.exif || m.xmp || m.iptc) dirty.push(f);
}
if (dirty.length) {
  console.error('[verify-exif] FAIL: images with metadata (run scripts/strip-exif.mjs):');
  dirty.forEach((f) => console.error('  ' + f));
  process.exit(1);
}
console.log(`[verify-exif] OK — ${files.length} images, none with EXIF/XMP/IPTC.`);
