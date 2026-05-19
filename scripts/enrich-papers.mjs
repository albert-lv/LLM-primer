#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

const PAPERS_DIR = 'src/content/papers';
const ENRICHED_DIR = 'src/content/papers/.enriched';

export function parseArxivAtom(xml) {
  const e = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1] ?? '';
  const title = e.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim().replace(/\s+/g, ' ') ?? '';
  const summary = e.match(/<summary>([\s\S]*?)<\/summary>/)?.[1].trim().replace(/\s+/g, ' ') ?? '';
  const published = e.match(/<published>([\s\S]*?)<\/published>/)?.[1] ?? '';
  const year = published ? new Date(published).getUTCFullYear() : null;
  const authors = [...e.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map((m) => m[1].trim());
  return { title, abstract: summary, authors, year };
}

export function extractCitationCount(json) {
  if (!json || typeof json !== 'object') return null;
  if (typeof json.cited_by_count === 'number') return json.cited_by_count;
  return null;
}

async function fetchArxiv(id) {
  const r = await fetch(`http://export.arxiv.org/api/query?id_list=${id}`, {
    headers: { 'User-Agent': 'llm-primer/0.1 (mailto:llm-primer@example.com)' },
  });
  if (!r.ok) throw new Error(`arxiv ${id} ${r.status}`);
  return parseArxivAtom(await r.text());
}

async function fetchOpenAlex(arxivId) {
  try {
    const r = await fetch(
      `https://api.openalex.org/works/https://arxiv.org/abs/${arxivId}`,
      {
        headers: {
          'User-Agent': 'llm-primer/0.1 (mailto:llm-primer@example.com)',
        },
      }
    );
    if (!r.ok) return null;
    const json = await r.json();
    return extractCitationCount(json);
  } catch {
    return null;
  }
}

async function main() {
  await mkdir(ENRICHED_DIR, { recursive: true });
  const files = (await readdir(PAPERS_DIR)).filter((x) => x.endsWith('.yaml'));
  for (const f of files) {
    const stub = parseYaml(await readFile(join(PAPERS_DIR, f), 'utf8'));
    if (!stub.arxiv_id) {
      console.log(`skip ${stub.id}: no arxiv_id`);
      continue;
    }
    const cache = join(ENRICHED_DIR, `${stub.id}.json`);
    let cached = null;
    try {
      cached = JSON.parse(await readFile(cache, 'utf8'));
    } catch {}
    const ageMs = cached?.fetchedAt ? Date.now() - new Date(cached.fetchedAt).getTime() : Infinity;
    if (cached && ageMs < 7 * 24 * 3600 * 1000) continue;
    try {
      const data = await fetchArxiv(stub.arxiv_id);
      const cited_by_count = await fetchOpenAlex(stub.arxiv_id);
      await writeFile(
        cache,
        JSON.stringify(
          { ...data, cited_by_count, source: 'arxiv+openalex', fetchedAt: new Date().toISOString() },
          null,
          2
        )
      );
      console.log(`enriched ${stub.id}${cited_by_count != null ? ` (${cited_by_count} citations)` : ''}`);
      await new Promise((r) => setTimeout(r, 3000)); // rate limit
    } catch (e) {
      console.error(`${stub.id}: ${e.message}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
