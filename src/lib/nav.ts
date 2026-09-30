// Section 6.3: which routes exist is decided by data, at build time.
// A route whose data is missing is NOT generated (no "coming soon" pages),
// and the nav omits it automatically.
import { getPublished } from './published';
import siteConfig from '../data/site-config.json';
import { photosIn } from './photos';

export const DISCLOSURE_GROUPS = [
  { slug: 'thong-tin-chung', label: 'Thông tin chung' },
  { slug: 'tai-chinh', label: 'Tài chính' },
  { slug: 'dieu-kien-dam-bao-chat-luong', label: 'Điều kiện đảm bảo chất lượng' },
  { slug: 'ke-hoach-ket-qua', label: 'Kế hoạch và kết quả' },
  { slug: 'bao-cao-thuong-nien', label: 'Báo cáo thường niên' },
] as const;

// Slugs served from the `pages` collection by src/pages/[...slug].astro.
export const PAGE_ROUTES = [
  'gioi-thieu',
  'gioi-thieu/muc-tieu-su-menh-tam-nhin',
  'giao-duc-tuyen-sinh',
  'giao-duc-tuyen-sinh/chuong-trinh',
  'giao-duc-tuyen-sinh/phuong-phap',
  'giao-duc-tuyen-sinh/thong-tin',
  'chinh-sach-hoc-phi/quy-dinh-nha-truong',
  'chinh-sach-hoc-phi/quy-dinh-tai-chinh',
  'chinh-sach-bao-mat',
] as const;

const classesFiles = import.meta.glob('../data/classes.json', { eager: true });

let cache: Promise<Record<string, boolean>> | undefined;

/** Map of route path ("/gioi-thieu/") -> generated? Computed once per build. */
export function visibleRoutes(): Promise<Record<string, boolean>> {
  cache ??= (async () => {
    const [pages, teachers, council, menus, plans, fees, news, albums, notices] =
      await Promise.all([
        getPublished('pages'), getPublished('teachers'), getPublished('council'),
        getPublished('menus'), getPublished('plans'), getPublished('fees'),
        getPublished('news'), getPublished('albums'), getPublished('notices'),
      ]);
    const pageSlugs = new Set(pages.map((p) => p.data.slug.replace(/^\/|\/$/g, '')));
    const classes = Object.values(classesFiles)[0] as { default?: unknown } | undefined;
    const classesReal = !!classes && !JSON.stringify(classes).includes('TODO-OWNER');
    const formUrl = (siteConfig as Record<string, unknown>).admissionsFormUrl;
    // Owner-added facility photos (src/assets/photos/co-so-vat-chat/) also open the library.
    const facilityPhotos = photosIn('co-so-vat-chat').length > 0;

    const v: Record<string, boolean> = {
      '/': true,
      '/lien-he/': true,
      '/cong-khai/': true,
      '/giao-duc-tuyen-sinh/lop-hoc/': classesReal,
      '/giao-duc-tuyen-sinh/dang-ky/': typeof formUrl === 'string' && formUrl.startsWith('https://'),
      '/gioi-thieu/giao-vien/': teachers.length >= 1,
      '/gioi-thieu/hoi-dong-giao-duc/': council.length >= 1,
      '/giao-duc-tuyen-sinh/thuc-don/': menus.length >= 1,
      '/giao-duc-tuyen-sinh/ke-hoach/': plans.length >= 1,
      '/chinh-sach-hoc-phi/': fees.length >= 1,
      '/tin-tuc/': news.length >= 1,
      '/thu-vien/': albums.length >= 1 || facilityPhotos,
      '/thu-vien/co-so-vat-chat/': albums.some((a) => a.data.category === 'co-so-vat-chat') || facilityPhotos,
      '/thu-vien/hinh-anh-cac-be/': albums.some((a) => a.data.category === 'hinh-anh-cac-be'),
      '/thong-bao/': notices.length >= 1,
    };
    for (const s of PAGE_ROUTES) v[`/${s}/`] = pageSlugs.has(s);
    return v;
  })();
  return cache;
}

export async function isVisible(path: string): Promise<boolean> {
  return (await visibleRoutes())[path] === true;
}

/** getStaticPaths helper for a rest-param page that is either generated once or not at all. */
export async function onlyIf(path: string) {
  return (await isVisible(path)) ? [{ params: { p: undefined } }] : [];
}

export interface NavItem { label: string; href: string; children?: NavItem[] }

const TREE: NavItem[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/gioi-thieu/', children: [
    { label: 'Mục tiêu – Sứ mệnh – Tầm nhìn', href: '/gioi-thieu/muc-tieu-su-menh-tam-nhin/' },
    { label: 'Giáo viên của bé', href: '/gioi-thieu/giao-vien/' },
    { label: 'Hội đồng giáo dục', href: '/gioi-thieu/hoi-dong-giao-duc/' },
  ] },
  { label: 'Giáo dục – Tuyển sinh', href: '/giao-duc-tuyen-sinh/', children: [
    { label: 'Chương trình giáo dục', href: '/giao-duc-tuyen-sinh/chuong-trinh/' },
    { label: 'Phương pháp giáo dục', href: '/giao-duc-tuyen-sinh/phuong-phap/' },
    { label: 'Các lớp học', href: '/giao-duc-tuyen-sinh/lop-hoc/' },
    { label: 'Thông tin tuyển sinh', href: '/giao-duc-tuyen-sinh/thong-tin/' },
    { label: 'Đăng ký tuyển sinh', href: '/giao-duc-tuyen-sinh/dang-ky/' },
    { label: 'Thực đơn tuần', href: '/giao-duc-tuyen-sinh/thuc-don/' },
    { label: 'Kế hoạch giáo dục', href: '/giao-duc-tuyen-sinh/ke-hoach/' },
  ] },
  { label: 'Chính sách học phí', href: '/chinh-sach-hoc-phi/', children: [
    { label: 'Quy định nhà trường', href: '/chinh-sach-hoc-phi/quy-dinh-nha-truong/' },
    { label: 'Quy định tài chính', href: '/chinh-sach-hoc-phi/quy-dinh-tai-chinh/' },
  ] },
  { label: 'Tin tức – Sự kiện', href: '/tin-tuc/' },
  { label: 'Thư viện', href: '/thu-vien/', children: [
    { label: 'Cơ sở vật chất', href: '/thu-vien/co-so-vat-chat/' },
    { label: 'Hình ảnh các bé', href: '/thu-vien/hinh-anh-cac-be/' },
  ] },
  { label: 'Thông báo', href: '/thong-bao/' },
  { label: 'Liên hệ', href: '/lien-he/' },
  { label: 'Công khai', href: '/cong-khai/' }, // D9: 9th item + footer link
];

/** Nav tree with hidden routes removed. A parent whose own page is hidden
 *  but has visible children links to its first visible child. */
export async function buildNav(): Promise<NavItem[]> {
  const v = await visibleRoutes();
  const out: NavItem[] = [];
  for (const item of TREE) {
    const kids = (item.children ?? []).filter((c) => v[c.href]);
    if (v[item.href]) out.push({ ...item, children: kids.length ? kids : undefined });
    else if (kids.length) out.push({ label: item.label, href: kids[0].href, children: kids });
  }
  return out;
}

/** Human label for a known route ("/tin-tuc/" -> "Tin tức – Sự kiện"), or undefined. */
export function labelFor(href: string): string | undefined {
  for (const item of TREE) {
    if (item.href === href) return item.label;
    const kid = item.children?.find((c) => c.href === href);
    if (kid) return kid.label;
  }
  return undefined;
}

/** Breadcrumb trail for a path: Trang chủ + every ancestor that has a known label. */
export function crumbsFor(pathname: string, current: string): { label: string; href: string }[] {
  const parts = pathname.split('/').filter(Boolean);
  const out = [{ label: 'Trang chủ', href: '/' }];
  let path = '/';
  parts.forEach((seg, i) => {
    path += `${seg}/`;
    const last = i === parts.length - 1;
    const label = last ? current : labelFor(path);
    if (label) out.push({ label, href: path });
  });
  return out;
}
