import { site } from './site';

export const DEFAULT_DESCRIPTION =
  'Trường mầm non thuộc Hệ thống Giáo dục Victoria tại KĐT Thanh Hà, Hà Nội: chương trình, tuyển sinh, học phí, thực đơn và thông tin công khai.';

/** Absolute canonical URL for a path, based on the build's `site` (astro.config.mjs). */
export function canonical(path: string, siteUrl: URL | undefined): string {
  return new URL(path, siteUrl ?? 'http://localhost:4321').toString();
}

/** "<Page> | <School>" or just the school name for the homepage. */
export function pageTitle(page?: string): string {
  return page ? `${page} | ${site.name}` : site.name;
}
