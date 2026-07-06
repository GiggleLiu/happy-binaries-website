import type { CollectionEntry } from 'astro:content';

export function postUrl(entry: CollectionEntry<'blog'>): string {
  return entry.data.lang === 'zh' && entry.data.translationOf
    ? `/blog/${entry.data.translationOf}/zh/`
    : `/blog/${entry.id}/`;
}

export function sortedEnPosts(entries: CollectionEntry<'blog'>[]) {
  return entries
    .filter((e) => e.data.lang === 'en')
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
