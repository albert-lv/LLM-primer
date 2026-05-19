import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://llm-primer.pages.dev',
  integrations: [
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
      sidebar: [{ label: '首页', link: '/' }],
    }),
  ],
});
