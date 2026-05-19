import { describe, it, expect } from 'vitest';
import { parseArxivAtom, extractCitationCount } from '../../scripts/enrich-papers.mjs';

describe('parseArxivAtom', () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Attention Is All You Need</title>
    <summary>The dominant sequence transduction models...</summary>
    <published>2017-06-12T00:00:00Z</published>
    <author><name>Ashish Vaswani</name></author>
    <author><name>Noam Shazeer</name></author>
  </entry>
</feed>`;

  it('extracts title', () => {
    const result = parseArxivAtom(sampleXml);
    expect(result.title).toBe('Attention Is All You Need');
  });

  it('extracts year', () => {
    const result = parseArxivAtom(sampleXml);
    expect(result.year).toBe(2017);
  });

  it('extracts authors', () => {
    const result = parseArxivAtom(sampleXml);
    expect(result.authors).toEqual(['Ashish Vaswani', 'Noam Shazeer']);
  });

  it('extracts abstract', () => {
    const result = parseArxivAtom(sampleXml);
    expect(result.abstract).toContain('dominant sequence');
  });
});

describe('extractCitationCount', () => {
  it('extracts number from OpenAlex response', () => {
    expect(extractCitationCount({ cited_by_count: 12345 })).toBe(12345);
  });

  it('returns null for missing field', () => {
    expect(extractCitationCount({ title: 'test' })).toBeNull();
  });

  it('returns null for null input', () => {
    expect(extractCitationCount(null)).toBeNull();
  });
});
