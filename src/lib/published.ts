import { getCollection, type CollectionKey } from 'astro:content';

export function isPublished(d: { approved?: boolean; approved_by?: string }): boolean {
  return d.approved === true && typeof d.approved_by === 'string' && d.approved_by.trim() !== '';
}

export async function getPublished<C extends CollectionKey>(name: C) {
  return getCollection(name, ({ data }) => isPublished(data as any));
}
