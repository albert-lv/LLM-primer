import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

export default defineConfig({
  site: 'https://llm-primer.pages.dev',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [
    react(),
    starlight({
      title: 'LLM Primer',
      customCss: ['./src/styles/custom.css'],
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      head: [{
        tag: 'script',
        content: `(()=>{try{var u=new URL(location.href);var h=u.hash.match(/(?:^#|&)tier=([^&]+)/);var t=h?decodeURIComponent(h[1]):localStorage.getItem('llm-primer:tier');if(['intro','engineer','research'].indexOf(t)>=0)document.documentElement.dataset.tier=t;}catch(e){}})();`,
      }],
      sidebar: [
        { label: '首页 / Home', link: '/' },
        { label: '基础 / Foundations', autogenerate: { directory: 'foundations' } },
        { label: '训练 / Training', autogenerate: { directory: 'training' } },
        { label: '推理 / Inference', autogenerate: { directory: 'inference' } },
        { label: '应用 / Applications', autogenerate: { directory: 'applications' } },
        { label: '术语 / Glossary', link: '/glossary/' },
        { label: '博客 / Blog', autogenerate: { directory: 'blog' } },
        { label: 'Papers', link: '/papers/' },
      ],
    }),
  ],
});
