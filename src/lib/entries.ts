// Shared helpers that turn approved collection entries into what the page
// components expect. One slug rule for list pages, detail pages and the homepage.
import { getPublished } from './published';
import { slug } from './slug';
import { formatVnDate, parseVnDate } from './dates';

/** URL slug for a news/notice entry: slug(title), falling back to the file id. */
export const entrySlug = (e: { id: string; data: { title: string } }): string =>
  slug(e.data.title) || e.id.replace(/\.md$/, '');

/** Approved news, newest first, de-duplicated by title. */
export async function getNews() {
  const seen = new Set<string>();
  return (await getPublished('news'))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .filter((n) => (seen.has(n.data.title) ? false : (seen.add(n.data.title), true)));
}

/** Start of today in Asia/Ho_Chi_Minh. */
export const todayVn = (): Date => parseVnDate(formatVnDate(new Date())) ?? new Date();

/** Approved notices split into still-valid and expired, newest first. */
export async function getNotices() {
  const today = todayVn();
  const all = (await getPublished('notices')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const isActive = (n: (typeof all)[number]) => !n.data.valid_until || n.data.valid_until >= today;
  return { active: all.filter(isActive), expired: all.filter((n) => !isActive(n)) };
}

export const NEWS_CATEGORIES: Record<string, string> = {
  'su-kien': 'Sự kiện',
  'hoc-tap': 'Học tập',
  'dinh-duong': 'Dinh dưỡng',
  'tuyen-sinh': 'Tuyển sinh',
};

export const ALBUM_CATEGORIES = {
  'co-so-vat-chat': 'Cơ sở vật chất',
  'hinh-anh-cac-be': 'Hình ảnh các bé',
} as const;
