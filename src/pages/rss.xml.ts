// RSS 2.0 feed for approved news (WEB-09, section 6.9). No dependency: plain XML.
import type { APIRoute } from 'astro';
import { getNews, entrySlug } from '../lib/entries';
import { site } from '../lib/site';
import { DEFAULT_DESCRIPTION } from '../lib/seo';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site: base }) => {
  const root = base ?? new URL('http://localhost:4321');
  const items = (await getNews()).slice(0, 30).map((n) => {
    const link = new URL(`/tin-tuc/${entrySlug(n)}/`, root).toString();
    return `    <item>
      <title>${esc(n.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${n.data.date.toUTCString()}</pubDate>${n.data.summary ? `
      <description>${esc(n.data.summary)}</description>` : ''}
    </item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(site.name)} – Tin tức</title>
    <link>${new URL('/', root).toString()}</link>
    <description>${esc(DEFAULT_DESCRIPTION)}</description>
    <language>vi</language>
${items.join('\n')}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
