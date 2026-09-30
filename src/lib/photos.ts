// Photo slots (image frames). The owner drops a photo into src/assets/photos/
// with the slot's file name (any of .jpg .jpeg .png .webp .avif) and the frame
// shows it, cropped to the frame and optimised (AVIF/WebP) at build time.
// Keys are the path under photos/ without extension, lower-case:
//   "home-hero", "banners/lien-he", "co-so-vat-chat/phong-hoc-1", "giao-vien/co-lan".
// Alt text: src/data/photos.json { "alt": { "<key>": "..." } } overrides defaults.
import type { ImageMetadata } from 'astro';
import photoMeta from '../data/photos.json';
import { slug } from './slug';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/photos/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

const byKey = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const key = path.replace(/^.*\/assets\/photos\//, '').replace(/\.[^.]+$/, '').toLowerCase();
  byKey.set(key, mod.default);
}

const altMap = ((photoMeta as { alt?: Record<string, string> }).alt ?? {}) as Record<string, string>;

/** The image for a slot key, or undefined while the owner hasn't added it. */
export const photo = (key: string): ImageMetadata | undefined => byKey.get(key.toLowerCase());
export const hasPhoto = (key: string): boolean => byKey.has(key.toLowerCase());

/** Owner-written alt text for a key, else the given fallback. */
export const altFor = (key: string, fallback: string): string => altMap[key.toLowerCase()]?.trim() || fallback;

/** Every photo in a folder (e.g. "co-so-vat-chat"), sorted by file name. */
export function photosIn(folder: string): { key: string; src: ImageMetadata }[] {
  const prefix = `${folder.toLowerCase().replace(/\/$/, '')}/`;
  return [...byKey.entries()]
    .filter(([k]) => k.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b, 'vi', { numeric: true }))
    .map(([key, src]) => ({ key, src }));
}

/** Banner key for a page path: "/cong-khai/tai-chinh/" -> "banners/cong-khai-tai-chinh". */
export const bannerKey = (pathname: string): string =>
  `banners/${pathname.split('/').filter(Boolean).join('-') || 'trang-chu'}`;

/** Key for a person's portrait: "Cô Lan Anh" -> "giao-vien/co-lan-anh". */
export const teacherKey = (name: string): string => `giao-vien/${slug(name)}`;

/** Key for a class photo: "Mầm 1" -> "lop-hoc/mam-1". */
export const classKey = (className: string): string => `lop-hoc/${slug(className)}`;

/** Fixed homepage slots, listed on the dev checklist page /khung-anh/. */
export const HOME_SLOTS = [
  { key: 'home-hero', where: 'Trang chủ – ảnh lớn đầu trang', ratio: '4 / 3', shape: 'blob' },
  { key: 'home-ly-do-1', where: 'Trang chủ – thẻ "Vì sao chọn" số 1', ratio: '4 / 3', shape: 'rounded' },
  { key: 'home-ly-do-2', where: 'Trang chủ – thẻ "Vì sao chọn" số 2', ratio: '4 / 3', shape: 'rounded' },
  { key: 'home-ly-do-3', where: 'Trang chủ – thẻ "Vì sao chọn" số 3', ratio: '4 / 3', shape: 'rounded' },
] as const;
