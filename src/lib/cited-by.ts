export interface ArticleRef {
  slug: string;
  papers: string[];
}

export function buildCitedByIndex(articles: ArticleRef[]): Map<string, string[]> {
  const idx = new Map<string, string[]>();
  for (const a of articles) {
    for (const p of a.papers) {
      const arr = idx.get(p) ?? [];
      if (!arr.includes(a.slug)) arr.push(a.slug);
      idx.set(p, arr);
    }
  }
  return idx;
}
