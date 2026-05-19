const REF = /\[\[ref:([a-z0-9-]+)\]\]/g;

export function extractPaperRefs(md: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of md.matchAll(REF)) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      out.push(m[1]);
    }
  }
  return out;
}

export interface Citation {
  id: string;
  authors: string[];
  year: number;
  title: string;
}

export function formatPaperCitation(c: Citation): string {
  const a = c.authors.length === 1 ? c.authors[0] : `${c.authors[0]} et al.`;
  return `${a} (${c.year}). ${c.title}.`;
}
