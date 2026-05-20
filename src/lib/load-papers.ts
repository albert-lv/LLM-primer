import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface EnrichedPaper {
  id: string;
  arxiv_id?: string;
  doi?: string;
  source_url?: string;
  title?: string;
  year?: number;
  authors?: string[];
  tldr_zh: string;
  tldr_en: string;
  tags: string[];
  modules: string[];
  domains: string[];
  inbox: boolean;
  // enriched fields
  abstract?: string;
  cited_by_count?: number | null;
}

export async function loadPapers(): Promise<EnrichedPaper[]> {
  const collection = await getCollection('papers');
  const publishedPapers = collection.filter((p) => !p.data.inbox);

  const enriched: EnrichedPaper[] = [];

  for (const paper of publishedPapers) {
    let enrichedData: Record<string, unknown> = {};
    try {
      const cachePath = join(
        process.cwd(),
        'src/content/papers/.enriched',
        `${paper.data.id}.json`
      );
      const raw = await readFile(cachePath, 'utf8');
      enrichedData = JSON.parse(raw);
    } catch {
      // no enrichment data available
    }

    enriched.push({
      ...paper.data,
      abstract: (enrichedData.abstract as string) ?? undefined,
      cited_by_count: (enrichedData.cited_by_count as number | null) ?? null,
    });
  }

  // Sort by year descending
  enriched.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  return enriched;
}
