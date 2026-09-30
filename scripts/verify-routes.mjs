#!/usr/bin/env node
// WEB-04 acceptance (run after astro build):
// 1. With no approved data, only /, /lien-he/, /cong-khai/** and /404 are generated.
// 2. Every internal link in the site nav points to a generated page.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const walk = (d) => readdirSync(d, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const rel = (f) => relative(dist, f).split(sep).join('/');

if (!existsSync(dist)) { console.error('[verify-routes] dist/ missing; run astro build'); process.exit(1); }
const html = walk(dist).filter((f) => f.endsWith('.html')).map(rel);
let failures = 0;

// Any approved content at all? (approved: true in md frontmatter or JSON)
const dataDirs = ['src/content', 'src/data'].map((d) => join(root, d)).filter(existsSync);
const anyApproved = dataDirs.flatMap(walk)
  .filter((f) => /\.(md|json)$/.test(f) && !f.includes('__'))
  .some((f) => /approved"?\s*:\s*true/.test(readFileSync(f, 'utf8')))
  // Owner-added facility photos also count as data (they open /thu-vien/).
  || (existsSync(join(root, 'src/assets/photos/co-so-vat-chat'))
    && readdirSync(join(root, 'src/assets/photos/co-so-vat-chat')).some((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)));

if (!anyApproved) {
  const allowed = (p) => p === 'index.html' || p === '404.html' || p === 'lien-he/index.html'
    || p.startsWith('cong-khai/');
  for (const p of html.filter((p) => !allowed(p))) {
    console.error(`[verify-routes] FAIL: ${p} generated although no approved data exists`);
    failures++;
  }
}

const exists = (href) => {
  const clean = href.split('#')[0].replace(/^\//, '');
  return html.includes(clean === '' ? 'index.html' : `${clean.replace(/\/$/, '')}/index.html`);
};
for (const page of html) {
  const nav = readFileSync(join(dist, page), 'utf8').match(/<nav[^>]*data-site-nav[\s\S]*?<\/nav>/);
  if (!nav) { console.error(`[verify-routes] FAIL: ${page} has no site nav`); failures++; continue; }
  for (const [, href] of nav[0].matchAll(/href="(\/[^"]*)"/g)) {
    if (!exists(href)) { console.error(`[verify-routes] FAIL: ${page} nav links to missing ${href}`); failures++; }
  }
}

if (failures) { console.error(`[verify-routes] ${failures} failure(s).`); process.exit(1); }
console.log(`[verify-routes] OK - ${html.length} pages; nav links all resolve${anyApproved ? '' : '; empty-data route set correct'}.`);
