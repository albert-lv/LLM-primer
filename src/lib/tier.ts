export const TIERS = ['intro', 'engineer', 'research'] as const;
export type Tier = (typeof TIERS)[number];
export const DEFAULT_TIER: Tier = 'intro';
export const TIER_STORAGE_KEY = 'llm-primer:tier';

const isTier = (v: unknown): v is Tier =>
  typeof v === 'string' && (TIERS as readonly string[]).includes(v);

function readHashTier(): Tier | null {
  if (typeof window === 'undefined') return null;
  const m = window.location.hash.match(/(?:^#|&)tier=([^&]+)/);
  if (!m) return null;
  const v = decodeURIComponent(m[1]);
  return isTier(v) ? v : null;
}

export function getActiveTier(): Tier {
  if (typeof window === 'undefined') return DEFAULT_TIER;
  const h = readHashTier();
  if (h) return h;
  const s = window.localStorage.getItem(TIER_STORAGE_KEY);
  return isTier(s) ? s : DEFAULT_TIER;
}

export function setActiveTier(t: Tier): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TIER_STORAGE_KEY, t);
  document.documentElement.dataset.tier = t;
  window.dispatchEvent(new CustomEvent('llm-primer:tier-change', { detail: { tier: t } }));
}
