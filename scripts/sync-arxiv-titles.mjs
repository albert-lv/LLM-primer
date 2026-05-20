#!/usr/bin/env node
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';

const PAPERS = 'src/content/papers';
const ENRICHED = 'src/content/papers/.enriched';

const files = (await readdir(PAPERS)).filter(f => f.endsWith('.yaml'));
let updated = 0;

for (const f of files) {
  const yamlPath = join(PAPERS, f);
  const stub = parse(await readFile(yamlPath, 'utf8'));
  const cachePath = join(ENRICHED, `${stub.id}.json`);
  let cache;
  try {
    cache = JSON.parse(await readFile(cachePath, 'utf8'));
  } catch {
    continue;
  }

  let changed = false;
  if (!stub.title && cache.title) {
    stub.title = cache.title;
    changed = true;
  }
  if (stub.year == null && cache.year) {
    stub.year = cache.year;
    changed = true;
  }
  if ((!stub.authors || stub.authors.length === 0) && cache.authors?.length) {
    stub.authors = cache.authors;
    changed = true;
  }

  if (changed) {
    // Re-order keys for readability
    const ordered = {};
    for (const k of ['id', 'arxiv_id', 'doi', 'source_url', 'title', 'year', 'authors',
                     'tldr_zh', 'tldr_en', 'tags', 'modules', 'domains',
                     'prerequisites', 'inbox']) {
      if (stub[k] !== undefined) ordered[k] = stub[k];
    }
    await writeFile(yamlPath, stringify(ordered, { lineWidth: 0 }));
    updated++;
    console.log(`updated ${stub.id}`);
  }
}
console.log(`Total updated: ${updated}`);
