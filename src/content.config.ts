import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// News/announcements. n8n may create files here, always with approved: false.
// Only a person flips approved to true (hard rule: never publish without a human tick).
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    lang: z.enum(['vi', 'en']).default('vi'),
    approved: z.boolean().default(false),
    approved_by: z.string().optional(),
    source: z.enum(['manual', 'n8n']).default('manual'),
  }),
});

export const collections = { news };
