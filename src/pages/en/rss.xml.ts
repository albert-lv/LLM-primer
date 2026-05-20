import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('docs', ({ id }) => id.startsWith('en/blog/'));

  const items = blog
    .filter((entry) => (entry.data as any).updated)
    .sort((a, b) => {
      const dateA = (a.data as any).updated ? new Date((a.data as any).updated).getTime() : 0;
      const dateB = (b.data as any).updated ? new Date((b.data as any).updated).getTime() : 0;
      return dateB - dateA;
    })
    .map((post) => ({
      title: post.data.title,
      pubDate: (post.data as any).updated ? new Date((post.data as any).updated) : new Date(),
      description: post.data.description || '',
      link: `/en/${post.id.replace(/^en\//, '').replace(/\.mdx?$/, '')}/`,
    }));

  return rss({
    title: 'LLM Primer - Blog Updates',
    description: 'In-depth articles and insights about Large Language Models',
    site: context.site || 'https://llm-primer.pages.dev',
    items,
    customData: '<language>en</language>',
  });
}
