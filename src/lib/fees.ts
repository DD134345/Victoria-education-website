// Fee files (data/fees/*.json) -> FeeTable props. Newest school year first.
import { getPublished } from './published';
import { parseVnDate } from './dates';

export async function getFees() {
  return (await getPublished('fees')).sort((a, b) => b.data.school_year.localeCompare(a.data.school_year));
}

export function feeTableProps(entry: Awaited<ReturnType<typeof getFees>>[number]) {
  const d = entry.data;
  return {
    schoolYear: d.school_year,
    effectiveFrom: parseVnDate(d.effective_from) ?? new Date(),
    rows: d.rows.map((r) => ({ item: r.item, amountVnd: r.amount_vnd, unit: r.unit, note: r.note })),
  };
}
