// Section 6.2: robots.txt follows the same indexing switch as BaseLayout.
import type { APIRoute } from 'astro';
import { isIndexable } from '../lib/site';

export const GET: APIRoute = ({ site }) => {
  const body = isIndexable
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
