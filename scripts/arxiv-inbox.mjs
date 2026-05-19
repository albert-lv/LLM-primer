#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT_DIR = 'src/content/papers/_inbox';
const KEYWORDS = ['language model', 'large language model', 'transformer', 'retrieval augmented', 'reasoning', 'alignment', 'tokenization', 'attention', 'inference'];
const CATEGORIES = ['cs.CL', 'cs.LG'];

export function parseAtomEntries(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((entry) => {
    const e = entry[1];
    const get = (tag) => (e.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? '').trim().replace(/\s+/g, ' ');
    const idUrl = get('id');
    const arxiv_id = idUrl.match(/abs\/(\d+\.\d+)(?:v\d+)?/)?.[1];
    return {
      arxiv_id,
      title: decodeXml(get('title')),
      abstract: decodeXml(get('summary')),
      year: Number((get('published') || '').slice(0, 4)) || new Date().getUTCFullYear(),
      authors: [...e.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map((m) => decodeXml(m[1].trim())),
    };
  }).filter((x) => x.arxiv_id && x.title);
}

export function keywordMatch(paper, keywords = KEYWORDS) {
  const haystack = `${paper.title} ${paper.abstract}`.toLowerCase();
  return keywords.some((kw) => haystack.includes(kw));
}

export function slugifyTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'paper';
}

export function toStub(paper) {
  const id = `${paper.year}-${slugifyTitle(paper.title)}`.replace(/-+/g, '-');
  const authors = paper.authors?.length ? paper.authors : ['TODO'];
  return `id: ${id}\narxiv_id: "${paper.arxiv_id}"\ntitle: ${JSON.stringify(paper.title)}\nyear: ${paper.year}\nauthors:\n${authors.map((a) => `  - ${JSON.stringify(a)}`).join('\n')}\ntldr_zh: |\n  TODO：阅读论文后补充中文 TLDR，说明核心问题、方法、实验结论，以及它对 LLM Primer 对应章节的价值。\ntldr_en: |\n  TODO: Read the paper and summarize the core problem, method, evidence, limitations, and why it matters for the relevant LLM Primer article.\ntags:\n  - inbox\n  - arxiv\nmodules:\n  - foundations\ninbox: true\n`;
}

function decodeXml(text) {
  return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

async function fetchCategory(category) {
  const query = encodeURIComponent(`cat:${category}`);
  const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=50`;
  const response = await fetch(url, { headers: { 'User-Agent': 'llm-primer/0.1 (mailto:llm-primer@example.com)' } });
  if (!response.ok) throw new Error(`arXiv ${category} ${response.status}`);
  return parseAtomEntries(await response.text());
}

async function exists(path) {
  try { await readFile(path, 'utf8'); return true; } catch { return false; }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const seen = new Set();
  let written = 0;
  for (const category of CATEGORIES) {
    const entries = await fetchCategory(category);
    for (const paper of entries.filter(keywordMatch)) {
      if (seen.has(paper.arxiv_id)) continue;
      seen.add(paper.arxiv_id);
      const id = `${paper.year}-${slugifyTitle(paper.title)}`.replace(/-+/g, '-');
      const path = join(OUT_DIR, `${id}.yaml`);
      if (await exists(path)) continue;
      await writeFile(path, toStub(paper), 'utf8');
      written += 1;
    }
  }
  console.log(`wrote ${written} inbox candidates`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
