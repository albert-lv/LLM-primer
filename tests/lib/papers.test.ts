import { describe, it, expect } from 'vitest';
import { extractPaperRefs, formatPaperCitation } from '../../src/lib/papers';

describe('papers lib', () => {
  it('extractPaperRefs dedupes and preserves order', () => {
    const md = 'See [[ref:vaswani2017-attention]] and [[ref:brown2020-gpt3]] and [[ref:vaswani2017-attention]] again';
    expect(extractPaperRefs(md)).toEqual(['vaswani2017-attention', 'brown2020-gpt3']);
  });

  it('extractPaperRefs returns empty for no refs', () => {
    expect(extractPaperRefs('no refs here')).toEqual([]);
  });

  it('formatPaperCitation single author', () => {
    const c = { id: 'test', authors: ['John Smith'], year: 2023, title: 'A Great Paper' };
    expect(formatPaperCitation(c)).toBe('John Smith (2023). A Great Paper.');
  });

  it('formatPaperCitation multiple authors uses et al.', () => {
    const c = { id: 'test', authors: ['Alice', 'Bob', 'Carol'], year: 2021, title: 'Multi-Author Work' };
    expect(formatPaperCitation(c)).toBe('Alice et al. (2021). Multi-Author Work.');
  });
});
