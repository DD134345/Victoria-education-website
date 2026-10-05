# Victoria education website

Static website for a new kindergarten in the Victoria Education system (Vietnam), built with
[Astro](https://astro.build). It is the website half of
[n8n-school-ops](https://github.com/DD134345/n8n-school-ops), which drafts and publishes its news
through n8n with a human approval step.

> Status: in development. Content and photos are still being filled in.

## Features

- Vietnamese-language site: introduction, teachers, classes, daily schedule and menu, admissions,
  photo library, news, notices, contact
- Mandatory public-disclosure pages (`/cong-khai/`) with an archive
- Content lives in `src/content/` (Markdown) and `src/data/` (JSON), so non-developers and
  n8n can update it without touching components
- News entries carry an `approved` flag: unapproved entries never reach the built site
- Sitemap, RSS feed, security headers and redirects for Cloudflare Pages

## Quality checks

`npm run verify` builds the site and runs checks for:

- **approval**: fails if an unapproved entry leaks into the build
- **SEO**, **routes**, **libraries** and **colour contrast**
- **EXIF**: photo metadata (including location) is stripped from every image at build time

## Run locally

Requires Node 22.12+.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # must pass before any commit
npm run verify     # full build + checks
```

Production builds need `PUBLIC_SITE_URL` set (Cloudflare Pages environment variable).

## Photos

`npm run photos:shotlist` lists the photos still needed; `npm run photos:import` previews an
import from `photo-inbox/` and `npm run photos:apply` applies it. Only publish photos of
children with a signed consent on record.
