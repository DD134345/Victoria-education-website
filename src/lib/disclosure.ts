// Công khai helpers (WEB-11). Current = approved and not superseded; archive =
// superseded (shown only on /cong-khai/luu-tru/, kept >= 5 years).
import { getPublished } from './published';
import { parseVnDate } from './dates';

const t = (v: string) => parseVnDate(v)?.valueOf() ?? 0;

export async function getCurrentDisclosures(group?: string) {
  return (await getPublished('disclosure'))
    .filter((d) => !d.data.superseded_by && (!group || d.data.group === group))
    .sort((a, b) => t(b.data.updated_at) - t(a.data.updated_at));
}

/** Newest "Cập nhật lần cuối" among the given items, as DD/MM/YYYY ('' if none). */
export const latestUpdate = (items: { data: { updated_at: string } }[]): string =>
  items.reduce((best, d) => (t(d.data.updated_at) > t(best) ? d.data.updated_at : best), '');
