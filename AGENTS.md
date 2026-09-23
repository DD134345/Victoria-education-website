# AGENTS.md — Victoria education website

Public information site for a new Victoria kindergarten. Astro (static). This repo is mounted as a
git submodule at `website/` inside `n8n-local`; the agent team there develops it.

## Hard rules (same commitments as n8n-local — never break)

1. **Never publish without a human tick.** Content arriving from n8n lands in `src/content/news/`
   with `approved: false`. Only a person sets `approved: true`; pages render approved entries only.
2. **No chatbots / auto-replies to parents** on the site.
3. **No student personal data** — no names, photos of identifiable children, health, grades,
   admissions forms that store data here.
4. **No secrets in the repo.** `.env` is ignored.
5. **Never `git push`.** Agents leave changes in the working tree; the owner commits and pushes.

## Design

- Build and restyle with the **design-taste-frontend** skill (primary). For calm/premium polish use
  **high-end-visual-design**; for fixing existing pages use **redesign-existing-projects**; use
  **full-output-enforcement** when output is incomplete.
- **hallmark** is for audits only (its slop test), not for building.
- Audience: parents of young children, Vietnamese first, English second. Warm, calm, readable;
  large tap targets; works on cheap phones; passes WCAG AA contrast.

## Structure

- `src/pages/` — routes. `src/content/news/` — news/announcements (Markdown, frontmatter per
  `src/content.config.ts`). `public/` — static assets.
- Verify every change with `npm run build` (must succeed with no errors).

## Astro development

Start the dev server in background mode: `astro dev --background`
(manage with `astro dev stop`, `astro dev status`, `astro dev logs`).

Docs: https://docs.astro.build — check before related work:
[routing](https://docs.astro.build/en/guides/routing/) ·
[components](https://docs.astro.build/en/basics/astro-components/) ·
[content collections](https://docs.astro.build/en/guides/content-collections/) ·
[styling](https://docs.astro.build/en/guides/styling/) ·
[i18n](https://docs.astro.build/en/guides/internationalization/)
