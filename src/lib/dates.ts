// DD/MM/YYYY date handling in Asia/Ho_Chi_Minh (ICT, UTC+7, no DST).
// Repo convention: docs/NEWTON-BUILD-INSTRUCTIONS.md line 84 / AGENTS.md.

const TZ = 'Asia/Ho_Chi_Minh';

/** Format a Date as "DD/MM/YYYY" in Asia/Ho_Chi_Minh, regardless of server timezone. */
export function formatVnDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('day')}/${get('month')}/${get('year')}`;
}

/** Parse a strict "DD/MM/YYYY" string (as used in the Sheet/Docs) into a Date at 00:00 ICT. */
export function parseVnDate(input: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  // ICT is UTC+7 with no DST: 00:00 ICT == previous day 17:00 UTC.
  const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
