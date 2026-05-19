#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

const REF_PATTERN = /\[\[ref:([a-z0-9-]+)\]\]/g;

export function lintArticle({ frontmatter, body }, knownPapers, inboxPapers) {
  const errors = [];

  // Rule 1: intro tier must be present
  const tiers = frontmatter.tiers ?? ['intro'];
  if (!tiers.includes('intro')) {
    errors.push('intro tier is required in tiers array');
  }

  // Rule 2: if multiple tiers, must include engineer or research
  if (tiers.length > 1 && !tiers.includes('engineer') && !tiers.includes('research')) {
    errors.push('when multiple tiers are specified, at least one must be "engineer" or "research"');
  }

  // Rule 3: all [[ref:xxx]] must be in known papers
  const bodyRefs = [...body.matchAll(REF_PATTERN)].map((m) => m[1]);
  for (const ref of bodyRefs) {
    if (inboxPapers.has(ref)) {
      errors.push(`ref [[ref:${ref}]] points to an inbox paper (not yet published)`);
    } else if (!knownPapers.has(ref)) {
      errors.push(`ref [[ref:${ref}]] refers to unknown paper`);
    }
  }

  // Rule 4: frontmatter.papers also checked
  const fmPapers = frontmatter.papers ?? [];
  for (const ref of fmPapers) {
    if (inboxPapers.has(ref)) {
      errors.push(`frontmatter paper "${ref}" is an inbox paper (not yet published)`);
    } else if (!knownPapers.has(ref)) {
      errors.push(`frontmatter paper "${ref}" refers to unknown paper`);
    }
  }

  return errors;
}

async function loadPaperSets() {
  const PAPERS_DIR = 'src/content/papers';
  const INBOX_DIR = 'src/content/papers/_inbox';

  const knownPapers = new Set();
  const inboxPapers = new Set();

  try {
    const files = await readdir(PAPERS_DIR);
    for (const f of files.filter((x) => x.endsWith('.yaml'))) {
      const stub = parseYaml(await readFile(join(PAPERS_DIR, f), 'utf8'));
      knownPapers.add(stub.id);
    }
  } catch {}

  try {
    const files = await readdir(INBOX_DIR);
    for (const f of files.filter((x) => x.endsWith('.yaml'))) {
      const stub = parseYaml(await readFile(join(INBOX_DIR, f), 'utf8'));
      inboxPapers.add(stub.id);
    }
  } catch {}

  return { knownPapers, inboxPapers };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  try {
    const frontmatter = parseYaml(match[1]);
    return { frontmatter, body: match[2] };
  } catch {
    return { frontmatter: {}, body: content };
  }
}

async function findMdxFiles(dir) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await findMdxFiles(fullPath)));
      } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch {}
  return files;
}

async function main() {
  const { knownPapers, inboxPapers } = await loadPaperSets();
  const docsDir = 'src/content/docs';
  const mdxFiles = await findMdxFiles(docsDir);

  let hasErrors = false;

  for (const filePath of mdxFiles) {
    const content = await readFile(filePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const errors = lintArticle({ frontmatter, body }, knownPapers, inboxPapers);

    if (errors.length > 0) {
      console.error(`\n❌ ${filePath}`);
      for (const err of errors) {
        console.error(`   - ${err}`);
      }
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\nContent lint failed.');
    process.exit(1);
  } else {
    console.log(`✅ Content lint passed (${mdxFiles.length} files checked)`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
