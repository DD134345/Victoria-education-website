#!/usr/bin/env node
// Post-build privacy step (T-N28): re-encode every raster image in dist/ that still
// carries EXIF/XMP/IPTC metadata (camera GPS location, device, time) without it.
// Astro's resized AVIF/WebP copies are already clean; this catches the original
// files Vite also emits. Runs as part of `npm run build`.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const DIST = join(process.cwd(), 'dist');
const walk = (d) => readdirSync(d, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const RASTER = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

let cleaned = 0;
for (const file of walk(DIST).filter((f) => RASTER.has(extname(f).toLowerCase()))) {
  const input = readFileSync(file);
  const meta = await sharp(input).metadata();
  if (!meta.exif && !meta.xmp && !meta.iptc) continue;
  const img = sharp(input).rotate(); // bake in EXIF orientation, then drop all metadata
  const ext = extname(file).toLowerCase();
  const out = ext === '.png' ? await img.png().toBuffer()
    : ext === '.webp' ? await img.webp({ quality: 85 }).toBuffer()
    : ext === '.avif' ? await img.avif({ quality: 60 }).toBuffer()
    : await img.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  writeFileSync(file, out);
  cleaned++;
}
console.log(`[strip-exif] OK — removed metadata from ${cleaned} image(s).`);
