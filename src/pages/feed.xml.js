import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { sortedIndexPosts, postUrl } from '../lib/blog';

export async function GET(context) {
  const posts = sortedIndexPosts(await getCollection('blog'));
  return rss({
    title: 'Jin-Guo Liu Group',
    description: 'Quantum computation, tensor networks, and open-source scientific computing at HKUST(GZ).',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
    })),
  });
}
