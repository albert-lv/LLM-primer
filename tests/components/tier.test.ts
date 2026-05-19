import { describe, it, expect, beforeEach } from 'vitest';
import { getActiveTier, setActiveTier, TIER_STORAGE_KEY, DEFAULT_TIER } from '../../src/lib/tier';

describe('tier', () => {
  beforeEach(() => {
    localStorage.clear();
    history.replaceState(null, '', '/');
  });

  it('default', () => expect(getActiveTier()).toBe(DEFAULT_TIER));

  it('persist', () => {
    setActiveTier('engineer');
    expect(localStorage.getItem(TIER_STORAGE_KEY)).toBe('engineer');
  });

  it('hash > storage', () => {
    localStorage.setItem(TIER_STORAGE_KEY, 'intro');
    history.replaceState(null, '', '/#tier=research');
    expect(getActiveTier()).toBe('research');
  });

  it('reject invalid', () => {
    localStorage.setItem(TIER_STORAGE_KEY, 'wizard');
    expect(getActiveTier()).toBe(DEFAULT_TIER);
  });
});
