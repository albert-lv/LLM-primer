import { describe, it, expect } from 'vitest';
import { lintArticle } from '../../scripts/check-content.mjs';

describe('lintArticle', () => {
  const knownPapers = new Set(['vaswani2017-attention', 'brown2020-gpt3']);
  const inboxPapers = new Set(['future-paper-2025']);

  it('passes valid article', () => {
    const errors = lintArticle(
      { frontmatter: { tiers: ['intro', 'engineer'] }, body: 'See [[ref:vaswani2017-attention]]' },
      knownPapers,
      inboxPapers
    );
    expect(errors).toHaveLength(0);
  });

  it('errors when intro tier is missing', () => {
    const errors = lintArticle(
      { frontmatter: { tiers: ['engineer'] }, body: '' },
      knownPapers,
      inboxPapers
    );
    expect(errors.some((e) => e.includes('intro tier'))).toBe(true);
  });

  it('errors on unknown paper ref', () => {
    const errors = lintArticle(
      { frontmatter: { tiers: ['intro'] }, body: '[[ref:nonexistent-paper]]' },
      knownPapers,
      inboxPapers
    );
    expect(errors.some((e) => e.includes('unknown paper'))).toBe(true);
  });

  it('errors on inbox paper ref in body', () => {
    const errors = lintArticle(
      { frontmatter: { tiers: ['intro'] }, body: '[[ref:future-paper-2025]]' },
      knownPapers,
      inboxPapers
    );
    expect(errors.some((e) => e.includes('inbox paper'))).toBe(true);
  });

  it('errors on inbox paper in frontmatter', () => {
    const errors = lintArticle(
      { frontmatter: { tiers: ['intro'], papers: ['future-paper-2025'] }, body: '' },
      knownPapers,
      inboxPapers
    );
    expect(errors.some((e) => e.includes('inbox paper'))).toBe(true);
  });
});
