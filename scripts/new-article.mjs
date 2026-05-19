#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const MODULES = new Set(['foundations', 'training', 'inference', 'applications']);
const LANGS = new Set(['zh', 'en']);

export function parseArgs(argv) {
  const args = { lang: 'zh' };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`);
    const name = key.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${name}`);
    args[name] = value;
    i += 1;
  }
  if (!args.slug) throw new Error('Missing --slug');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.slug)) throw new Error('--slug must be kebab-case');
  if (!args.module || !MODULES.has(args.module)) throw new Error(`--module must be one of ${[...MODULES].join(', ')}`);
  if (!LANGS.has(args.lang)) throw new Error('--lang must be zh or en');
  return args;
}

export function articlePath({ slug, module, lang = 'zh' }) {
  return lang === 'en'
    ? join('src', 'content', 'docs', 'en', module, `${slug}.mdx`)
    : join('src', 'content', 'docs', module, `${slug}.mdx`);
}

export function componentPrefix(lang = 'zh') {
  return lang === 'en' ? '../../../../components' : '../../../components';
}

function titleize(slug) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export function articleTemplate({ slug, module, lang = 'zh' }) {
  const prefix = componentPrefix(lang);
  const title = titleize(slug);
  const introHeading = lang === 'en' ? 'Intuition' : '直觉版';
  const engineerHeading = lang === 'en' ? 'Engineering view' : '工程版';
  return `---
title: ${title}
description: TODO: describe what this article explains.
module: ${module}
order: 999
status: draft
tiers: [intro, engineer]
papers: []
---

import TierSwitcher from '${prefix}/TierSwitcher.astro';
import TierBlock from '${prefix}/TierBlock.astro';
import PaperList from '${prefix}/PaperList.astro';

<TierSwitcher />

<TierBlock tier="intro">

## ${introHeading}

TODO: explain the core idea for first-time readers.

</TierBlock>

<TierBlock tier="engineer">

## ${engineerHeading}

TODO: add implementation details, trade-offs, and failure modes.

</TierBlock>

<PaperList ids={[]} />
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = articlePath(args);
  const abs = join(ROOT, target);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, articleTemplate(args), { encoding: 'utf8', flag: 'wx' });
  console.log(`created ${target}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
