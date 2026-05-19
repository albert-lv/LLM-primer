import { describe, it, expect } from 'vitest';
import { buildCitedByIndex } from '../../src/lib/cited-by';

describe('buildCitedByIndex', () => {
  it('builds reverse index from article refs', () => {
    const articles = [
      { slug: 'foundations/tokenization', papers: ['vaswani2017-attention', 'sennrich2016-bpe'] },
      { slug: 'foundations/attention', papers: ['vaswani2017-attention'] },
    ];
    const idx = buildCitedByIndex(articles);
    expect(idx.get('vaswani2017-attention')).toEqual([
      'foundations/tokenization',
      'foundations/attention',
    ]);
    expect(idx.get('sennrich2016-bpe')).toEqual(['foundations/tokenization']);
  });

  it('deduplicates article slugs', () => {
    const articles = [
      { slug: 'article-a', papers: ['paper-1', 'paper-1'] },
    ];
    const idx = buildCitedByIndex(articles);
    expect(idx.get('paper-1')).toEqual(['article-a']);
  });

  it('returns empty map for no articles', () => {
    expect(buildCitedByIndex([])).toEqual(new Map());
  });
});
