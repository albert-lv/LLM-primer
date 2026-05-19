import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://llm-primer.pages.dev',
  integrations: [
    react(),
    starlight({
      title: 'LLM Primer',
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
        { label: '术语 / Glossary', link: '/glossary/' },
        { label: '博客 / Blog', autogenerate: { directory: 'blog' } },
        { label: 'Papers', link: '/papers/' },
      ],
    }),
  ],
});
