//@ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Cloudflare Pages sets CF_PAGES=1, CF_PAGES_BRANCH and CF_PAGES_URL on every build.
const onPages = process.env.CF_PAGES === '1';
const isProduction = onPages && process.env.CF_PAGES_BRANCH === 'main';

// Production: use the custom domain.
// Preview branches: use its own preview URL. Local: localhost.
const SITE_URL = isProduction
  ? process.env.PUBLIC_SITE_URL
  : (process.env.CF_PAGES_URL ?? 'http://localhost:4321');

if (isProduction && !SITE_URL) {
  throw new Error('PUBLIC_SITE_URL is not set for the production build. Set it in Cloudflare Pages > Settings > Environment variables.');
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    routing: { prefixDefaultLocale: false }
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'vi', locales: { vi: 'vi-VN', en: 'en-US' } },
      filter: (page) => !page.includes('/404'),
    }),
  ]
});
