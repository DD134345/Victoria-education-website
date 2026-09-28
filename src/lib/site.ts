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
