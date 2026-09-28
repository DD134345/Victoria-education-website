#!/usr/bin/env node
// Unit checks for src/lib/dates.ts and src/lib/slug.ts (task WEB-05).
// No test framework dependency: assert + process.exit, same style as the other verify-*.mjs.
import { slug } from '../src/lib/slug.ts';
import { formatVnDate, parseVnDate } from '../src/lib/dates.ts';

let failures = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) {
    failures++;
    console.error(`[verify-libs] FAIL: ${label} -> ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
}

// slug.ts — spec case from NEWTON-BUILD-INSTRUCTIONS.md WEB-05 row
check(
  "slug('Thực đơn tuần 1 – Tháng 10')",
  slug('Thực đơn tuần 1 – Tháng 10'),
  'thuc-don-tuan-1-thang-10'
);
check("slug('Đ' handling)", slug('Đại học Bách Khoa'), 'dai-hoc-bach-khoa');
check('slug collapses repeats/trims', slug('  a---b  '), 'a-b');
check('slug max length is 80 chars', slug('a'.repeat(100)).length <= 80, true);

// dates.ts — DD/MM/YYYY in Asia/Ho_Chi_Minh
check('parseVnDate round-trip', formatVnDate(parseVnDate('05/10/2026')), '05/10/2026');
check('parseVnDate rejects bad format', parseVnDate('2026-10-05'), null);
check('parseVnDate rejects garbage', parseVnDate('not-a-date'), null);
// 18:00 UTC on 01/01 is already 01:00 ICT on 02/01 (UTC+7, no DST)
check('formatVnDate uses ICT not server TZ', formatVnDate(new Date('2026-01-01T18:00:00Z')), '02/01/2026');

if (failures > 0) {
  console.error(`[verify-libs] ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('[verify-libs] OK — dates.ts and slug.ts pass all unit checks.');
