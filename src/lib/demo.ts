// Demo preview data — DEV ONLY.
// index.astro imports this module ONLY when import.meta.env.DEV is true AND the
// real data for a section is empty. Production builds must contain zero demo
// content (enforced by scripts/verify-demo.mjs). Every demo title is prefixed
// "[Mẫu]" and every demo section carries a visible "Nội dung mẫu" badge.
// Images are our own SVG placeholders (soft green/pink gradients, no photos of
// real children, nothing copied from any reference site).
import type { ImageMetadata } from 'astro';
import newsCover1 from '../assets/demo/news-1.svg';
import newsCover2 from '../assets/demo/news-2.svg';
import newsCover3 from '../assets/demo/news-3.svg';
import scheduleShot from '../assets/demo/schedule.svg';
import albumShot1 from '../assets/demo/album-1.svg';
import albumShot2 from '../assets/demo/album-2.svg';
import albumShot3 from '../assets/demo/album-3.svg';
import avatarA from '../assets/demo/avatar-1.svg';
import avatarB from '../assets/demo/avatar-2.svg';
import partnerLogo1 from '../assets/demo/partner-1.svg';
import partnerLogo2 from '../assets/demo/partner-2.svg';

/** Visible label shown on every demo section. Also a verify-demo.mjs marker. */
export const DEMO_BADGE = 'Nội dung mẫu';

export interface DemoImage {
  src: ImageMetadata;
  alt: string;
}

const d = (iso: string): Date => new Date(`${iso}T00:00:00+07:00`);

/** Short intro shown above the "Vì sao" cards in dev preview only. */
export const demoOverview =
  'Đoạn giới thiệu minh hoạ cho khối xem trước giao diện. Nhà trường sẽ thay bằng nội dung chính thức trước khi xuất bản.';

export interface DemoReason {
  title: string;
  text: string;
}

export const demoReasons: DemoReason[] = [
  {
    title: '[Mẫu] Không gian xanh an toàn',
    text: 'Mô tả minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng nội dung chính thức.',
  },
  {
    title: '[Mẫu] Thầy cô tận tâm',
    text: 'Mô tả minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng nội dung chính thức.',
  },
  {
    title: '[Mẫu] Bữa ăn đủ dinh dưỡng',
    text: 'Mô tả minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng nội dung chính thức.',
  },
];

export interface DemoNewsItem {
  title: string;
  date: Date;
  summary: string;
  category: 'su-kien' | 'hoc-tap' | 'dinh-duong';
  cover: ImageMetadata;
  coverAlt: string;
}

export const demoNews: DemoNewsItem[] = [
  {
    title: '[Mẫu] Ngày hội đến trường của bé',
    date: d('2026-09-05'),
    summary: 'Bài viết minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng tin chính thức.',
    category: 'su-kien',
    cover: newsCover1,
    coverAlt: 'Ảnh minh hoạ cho tin mẫu',
  },
  {
    title: '[Mẫu] Giờ học khám phá màu sắc',
    date: d('2026-08-28'),
    summary: 'Bài viết minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng tin chính thức.',
    category: 'hoc-tap',
    cover: newsCover2,
    coverAlt: 'Ảnh minh hoạ cho tin mẫu',
  },
  {
    title: '[Mẫu] Thực đơn tuần mới cho bé',
    date: d('2026-08-20'),
    summary: 'Bài viết minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng tin chính thức.',
    category: 'dinh-duong',
    cover: newsCover3,
    coverAlt: 'Ảnh minh hoạ cho tin mẫu',
  },
];

export interface DemoNoticeItem {
  title: string;
  date: Date;
  summary: string;
}

export const demoNotices: DemoNoticeItem[] = [
  {
    title: '[Mẫu] Lịch nghỉ lễ minh hoạ',
    date: d('2026-09-01'),
    summary: 'Thông báo minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng nội dung chính thức.',
  },
  {
    title: '[Mẫu] Dặn dò giờ đón trả trẻ',
    date: d('2026-08-25'),
    summary: 'Thông báo minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng nội dung chính thức.',
  },
  {
    title: '[Mẫu] Họp phụ huynh đầu năm',
    date: d('2026-08-18'),
    summary: 'Thông báo minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng nội dung chính thức.',
  },
];

export interface DemoFact {
  value: string;
  label: string;
}

export const demoFacts: DemoFact[] = [
  { value: '12', label: '[Mẫu] Lớp học (minh hoạ)' },
  { value: '36', label: '[Mẫu] Thầy cô (minh hoạ)' },
  { value: '2.000m²', label: '[Mẫu] Sân chơi (minh hoạ)' },
];

export interface DemoMethod {
  title: string;
  description: string;
}

export const demoMethods: DemoMethod[] = [
  {
    title: '[Mẫu] Học qua chơi',
    description: 'Mô tả minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng nội dung chính thức.',
  },
  {
    title: '[Mẫu] Khám phá thiên nhiên',
    description: 'Mô tả minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng nội dung chính thức.',
  },
  {
    title: '[Mẫu] Làm quen tiếng Anh',
    description: 'Mô tả minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng nội dung chính thức.',
  },
  {
    title: '[Mẫu] Rèn kỹ năng sống',
    description: 'Mô tả minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng nội dung chính thức.',
  },
];

export interface DemoScheduleItem {
  time: string;
  activity: string;
  description: string;
}

export const demoSchedule: DemoScheduleItem[] = [
  { time: '07:00', activity: '[Mẫu] Đón trẻ', description: 'Khung giờ minh hoạ, nhà trường sẽ thay bằng thời gian biểu chính thức.' },
  { time: '08:00', activity: '[Mẫu] Thể dục sáng', description: 'Khung giờ minh hoạ, nhà trường sẽ thay bằng thời gian biểu chính thức.' },
  { time: '09:00', activity: '[Mẫu] Hoạt động học', description: 'Khung giờ minh hoạ, nhà trường sẽ thay bằng thời gian biểu chính thức.' },
  { time: '10:30', activity: '[Mẫu] Ăn trưa', description: 'Khung giờ minh hoạ, nhà trường sẽ thay bằng thời gian biểu chính thức.' },
  { time: '12:00', activity: '[Mẫu] Ngủ trưa', description: 'Khung giờ minh hoạ, nhà trường sẽ thay bằng thời gian biểu chính thức.' },
  { time: '16:30', activity: '[Mẫu] Trả trẻ (đến 17:30)', description: 'Khung giờ minh hoạ, nhà trường sẽ thay bằng thời gian biểu chính thức.' },
];

export const demoScheduleImages: DemoImage[] = [
  { src: scheduleShot, alt: 'Ảnh minh hoạ thời gian biểu' },
  { src: albumShot2, alt: 'Ảnh minh hoạ hoạt động' },
  { src: albumShot3, alt: 'Ảnh minh hoạ hoạt động' },
];

export interface DemoTestimonial {
  authorLabel: string;
  content: string;
  avatar: string;
}

export const demoParentTestimonials: DemoTestimonial[] = [
  {
    authorLabel: 'Phụ huynh mẫu A',
    content: 'Lời nhắn minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng cảm nhận chính thức đã được đồng ý.',
    avatar: avatarA.src,
  },
  {
    authorLabel: 'Phụ huynh mẫu B',
    content: 'Lời nhắn minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng cảm nhận chính thức đã được đồng ý.',
    avatar: avatarB.src,
  },
  {
    authorLabel: 'Phụ huynh mẫu C',
    content: 'Lời nhắn minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng cảm nhận chính thức đã được đồng ý.',
    avatar: avatarA.src,
  },
];

export const demoTeacherTestimonials: DemoTestimonial[] = [
  {
    authorLabel: 'Giáo viên mẫu A',
    content: 'Lời nhắn minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng cảm nhận chính thức đã được đồng ý.',
    avatar: avatarB.src,
  },
  {
    authorLabel: 'Giáo viên mẫu B',
    content: 'Lời nhắn minh hoạ cho bản xem trước giao diện, nhà trường sẽ thay bằng cảm nhận chính thức đã được đồng ý.',
    avatar: avatarA.src,
  },
];

export interface DemoAlbum {
  title: string;
  dateLabel: string;
  categoryLabel: string;
  photos: DemoImage[];
}

export const demoAlbum: DemoAlbum = {
  title: '[Mẫu] Album minh hoạ',
  dateLabel: '05/09/2026',
  categoryLabel: 'Cơ sở vật chất (minh hoạ)',
  photos: [
    { src: albumShot1, alt: 'Ảnh minh hoạ 1 trong album mẫu' },
    { src: albumShot2, alt: 'Ảnh minh hoạ 2 trong album mẫu' },
    { src: albumShot3, alt: 'Ảnh minh hoạ 3 trong album mẫu' },
  ],
};

export interface DemoPartner {
  name: string;
  image: ImageMetadata;
}

export const demoPartners: DemoPartner[] = [
  { name: '[Mẫu] Đối tác đồng hành A', image: partnerLogo1 },
  { name: '[Mẫu] Đối tác đồng hành B', image: partnerLogo2 },
];
