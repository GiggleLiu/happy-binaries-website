import type { CollectionEntry } from 'astro:content';

export function postUrl(entry: CollectionEntry<'blog'>): string {
  return entry.data.lang === 'zh' && entry.data.translationOf
    ? `/blog/${entry.data.translationOf}/zh/`
    : `/blog/${entry.id}/`;
}

// Listable posts: English posts, plus original Chinese posts (those that
// aren't a `-zh` translation companion of an English post — those are
// reached only via the English post's "中文版" link, not listed on their own).
export function sortedIndexPosts(entries: CollectionEntry<'blog'>[]) {
  return entries
    .filter((e) => e.data.lang === 'en' || !e.data.translationOf)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
