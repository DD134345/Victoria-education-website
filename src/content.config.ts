import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';   // same import the scaffold uses; check zod version for .email()/.url() syntax

// Shared approval block. The Publisher copies these from the Sheet stamp (rule 2.1).
const approval = {
  approved: z.boolean().default(false),
  approved_by: z.string().email().optional(),
  approved_at: z.string().regex(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/).optional(), // DD/MM/YYYY HH:mm
  sheet_row: z.number().int().positive().optional(),
  content_hash: z.string().length(64).optional(),                                // sha256 hex
  source: z.enum(['manual', 'n8n', 'fanpage', 'gdoc']).default('manual'),
};
const vnDate = z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/);                         // DD/MM/YYYY

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    slug: z.string(), title: z.string().min(3).max(120),
    description: z.string().max(160).optional(),
    doc_id: z.string().optional(), doc_revision: z.string().optional(),
    synced_at: z.string().optional(), ...approval,
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: ({ image }) => z.object({
    title: z.string().max(120), date: z.coerce.date(), summary: z.string().max(200).optional(),
    category: z.enum(['su-kien', 'hoc-tap', 'dinh-duong', 'tuyen-sinh']).default('su-kien'),
    cover: image().optional(), cover_alt: z.string().optional(),
    photos_consent_checked: z.boolean().default(false),
    fb_post_id: z.string().optional(), fb_url: z.string().url().optional(),
    lang: z.enum(['vi', 'en']).default('vi'), version: z.number().int().default(1), ...approval,
  }).refine((d) => !d.cover || d.photos_consent_checked, { message: 'cover image without photo-consent check' }),
});

const notices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notices' }),
  schema: z.object({
    title: z.string().max(120), date: z.coerce.date(), valid_until: z.coerce.date().optional(),
    summary: z.string().max(200).optional(), lang: z.enum(['vi', 'en']).default('vi'), ...approval,
  }),
});

const disclosure = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/disclosure' }),
  schema: z.object({
    group: z.enum(['thong-tin-chung', 'tai-chinh', 'dieu-kien-dam-bao-chat-luong', 'ke-hoach-ket-qua', 'bao-cao-thuong-nien']),
    title: z.string(), school_year: z.string().regex(/^\d{4}-\d{4}$/),
    published_at: vnDate, updated_at: vnDate,
    pdf: z.string().startsWith('/cong-khai/').optional(),
    superseded_by: z.string().optional(), ...approval,
  }),
});

const albums = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/albums' }),
  schema: ({ image }) => z.object({
    title: z.string(), category: z.enum(['co-so-vat-chat', 'hinh-anh-cac-be']),
    date: z.coerce.date(), photos: z.array(z.object({ src: image(), alt: z.string().min(3) })).min(1),
    consent_register_ref: z.string().optional(), ...approval,
  }).refine((d) => d.category !== 'hinh-anh-cac-be' || !!d.consent_register_ref,
            { message: 'child photos need consent_register_ref' }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({ author_label: z.string(), written_consent: z.literal(true), ...approval }),
});

// JSON data collections (one file = one entry)
const menus = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/menus' }),
  schema: z.object({
    week_start: vnDate,
    days: z.array(z.object({ date: vnDate, breakfast: z.string(), lunch: z.string(),
                             afternoon: z.string(), snack: z.string().optional() })).min(1).max(6),
    ...approval,
  }),
});

const fees = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/fees' }),
  schema: z.object({
    school_year: z.string().regex(/^\d{4}-\d{4}$/), effective_from: vnDate,
    rows: z.array(z.object({ item: z.string(), amount_vnd: z.number().int().nonnegative(),
                             unit: z.string(), note: z.string().optional() })).min(1),
    ...approval,
  }),
});

const plans = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/plans' }),
  schema: z.object({
    kind: z.enum(['thang', 'tuan']), period: z.string(), title: z.string(),
    summary: z.string(), file: z.string().optional(), ...approval,
  }),
});

const person = z.object({
  order: z.number().int(), name: z.string(), role: z.string(), qualification: z.string().optional(),
  years: z.number().int().nonnegative().optional(), quote: z.string().max(140).optional(),
  photo: z.string().optional(), photo_consent: z.literal(true), ...approval,
});
const teachers = defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/data/teachers' }), schema: person });
const council  = defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/data/council' }),  schema: person });

export const collections = { pages, news, notices, disclosure, albums, testimonials, menus, fees, plans, teachers, council };
