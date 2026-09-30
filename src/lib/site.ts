// Site facts come ONLY from src/data/site-config.json (written by the owner).
// Values still marked "TODO-OWNER" are placeholders; WEB-13 replaces them.
import siteConfig from '../data/site-config.json';

export const site = {
  name: siteConfig.name,
  legalName: siteConfig.legal_name,
  address: siteConfig.address,
  hotline: siteConfig.hotline,
  zalo: siteConfig.zalo,
  email: siteConfig.email,
  hours: siteConfig.hours,
  founded: siteConfig.founded,
  parentOrganization: siteConfig.parent_organization,
  social: siteConfig.social,
};

export const isPlaceholder = (v: unknown): boolean =>
  typeof v === 'string' && v.includes('TODO-OWNER');

// Section 6.2 indexing switch.
// Production = Cloudflare Pages build of branch main. Previews are never indexable.
export const isProduction =
  process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH === 'main';

export const isIndexable =
  isProduction && import.meta.env.PUBLIC_ALLOW_INDEXING === 'true';

/** True for a real owner value (non-empty string, not a TODO-OWNER placeholder). */
export const isReal = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '' && !isPlaceholder(v);

/** Address as one line from the real parts only ('' while still placeholder). */
export const addressText: string = (() => {
  const a: unknown = site.address;
  if (a && typeof a === 'object') {
    return Object.values(a as Record<string, unknown>).filter(isReal).join(', ');
  }
  return isReal(a) ? a : '';
})();

/** True when at least the street is real (a city alone is not an address). */
export const hasStreetAddress: boolean = (() => {
  const a: unknown = site.address;
  return !!a && typeof a === 'object' && isReal((a as Record<string, unknown>).street);
})();

/** Opening hours "07:00 – 17:30" from the owner-provided range ('' if unset). */
export const hoursText: string = (() => {
  const h: unknown = site.hours;
  if (h && typeof h === 'object') {
    const { start, end } = h as Record<string, unknown>;
    return isReal(start) && isReal(end) ? `${start} – ${end}` : '';
  }
  return isReal(h) ? h : '';
})();

export const telHref: string = isReal(site.hotline) ? `tel:${site.hotline.replace(/[^\d+]/g, '')}` : '';

/** Google Maps search link for the real address ('' until the street is set). */
export const mapsHref: string = hasStreetAddress
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name}, ${addressText}`)}`
  : '';
