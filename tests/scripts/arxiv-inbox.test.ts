import { describe, expect, it } from 'vitest';
import { keywordMatch, parseAtomEntries, slugifyTitle, toStub } from '../../scripts/arxiv-inbox.mjs';

const xml = `<feed><entry><id>http://arxiv.org/abs/2501.01234v1</id><title>Efficient Large Language Model Reasoning</title><summary>A transformer method for reasoning.</summary><published>2025-01-01T00:00:00Z</published><author><name>Ada Lovelace</name></author></entry></feed>`;

describe('arxiv inbox helpers', () => {
  it('parses Atom entries', () => {
    const [entry] = parseAtomEntries(xml);
    expect(entry.arxiv_id).toBe('2501.01234');
    expect(entry.authors).toEqual(['Ada Lovelace']);
  });

  it('filters by keyword and writes valid-ish stubs', () => {
    const [entry] = parseAtomEntries(xml);
    expect(keywordMatch(entry)).toBe(true);
    expect(slugifyTitle(entry.title)).toBe('efficient-large-language-model-reasoning');
    expect(toStub(entry)).toContain('inbox: true');
  });
});
