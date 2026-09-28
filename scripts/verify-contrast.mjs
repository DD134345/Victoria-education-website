#!/usr/bin/env node
// WEB-06 acceptance: WCAG AA contrast for every text/background pair in the design tokens.
// Prints the contrast table; exits 1 if any pair is below its minimum.
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/tokens.css', 'utf8');
const tok = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
tok.white = '#ffffff';

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [text, background, minimum, use]
const pairs = [
  ['ink', 'surface', 4.5, 'body text'],
  ['muted', 'surface', 4.5, 'secondary text'],
  ['brand', 'surface', 4.5, 'links'],
  ['brand-ink', 'surface', 4.5, 'headings'],
  ['white', 'brand', 4.5, 'primary button'],
  ['white', 'brand-ink', 4.5, 'footer / hover'],
  ['ink', 'brand-soft', 4.5, 'alt section text'],
  ['muted', 'brand-soft', 4.5, 'alt section secondary'],
  ['brand', 'brand-soft', 4.5, 'links on alt section'],
  ['ink', 'accent', 4.5, 'badge on pink'],
  ['white', 'accent-strong', 4.5, 'pink CTA button'],
  ['accent-strong', 'surface', 4.5, 'pink text'],
  ['accent-ink', 'accent-soft', 4.5, 'pink text on soft pink'],
  ['ink', 'accent-soft', 4.5, 'notice card text'],
  ['focus', 'surface', 3, 'focus ring (non-text)'],
  ['focus', 'brand-soft', 3, 'focus ring on alt'],
];

let fail = 0;
console.log('| Text | Background | Ratio | Min | Use | |\n|---|---|---|---|---|---|');
for (const [fg, bg, min, use] of pairs) {
  const r = ratio(tok[fg], tok[bg]);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`| ${fg} | ${bg} | ${r.toFixed(2)} | ${min} | ${use} | ${ok ? 'PASS' : 'FAIL'} |`);
}
if (fail) { console.error(`[verify-contrast] ${fail} pair(s) below WCAG AA`); process.exit(1); }
console.log(`[verify-contrast] OK - ${pairs.length} pairs pass WCAG AA.`);
