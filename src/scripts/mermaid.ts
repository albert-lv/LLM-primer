import mermaid from 'mermaid';

type MermaidTheme = 'default' | 'dark';

type MermaidState = {
  mounted: boolean;
  currentTheme: MermaidTheme | null;
};

const GLOBAL_KEY = '__llm_primer_mermaid__';

function getTheme(): 'light' | 'dark' {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function getMermaidTheme(): MermaidTheme {
  return getTheme() === 'light' ? 'default' : 'dark';
}

function ensureInitialized(state: MermaidState): boolean {
  const theme = getMermaidTheme();
  if (state.currentTheme === theme) return false;
  state.currentTheme = theme;
  mermaid.initialize({
    startOnLoad: false,
    theme,
    securityLevel: 'strict',
    fontFamily: 'inherit',
  });
  return true;
}

function extractSource(pre: HTMLPreElement): string {
  // Expressive Code wraps each line in <div class="ec-line">; textContent across sibling divs
  // omits newlines, so we extract lines individually and join with \n.
  const lines = pre.querySelectorAll<HTMLElement>('.ec-line');
  if (lines.length > 0) {
    return Array.from(lines)
      .map((l) => {
        const code = l.querySelector('.code');
        return ((code ?? l).textContent ?? '').replace(/\u00a0/g, ' ');
      })
      .join('\n')
      .trim();
  }
  return (pre.textContent ?? '').replace(/\u00a0/g, ' ').trim();
}

function toDiagram(pre: HTMLPreElement): HTMLElement | null {
  const wrapper = pre.closest<HTMLElement>('.expressive-code');
  const replaceTarget = wrapper ?? pre;
  if (replaceTarget.dataset.mermaidRendered === 'true') return null;

  const source = extractSource(pre);
  if (!source) return null;

  const container = document.createElement('div');
  container.className = 'sl-mermaid mermaid';
  container.dataset.mermaidSource = source;
  container.textContent = source;

  replaceTarget.dataset.mermaidRendered = 'true';
  replaceTarget.replaceWith(container);
  return container;
}

function resetForRerender(container: HTMLElement) {
  const source = container.dataset.mermaidSource ?? '';
  container.removeAttribute('data-processed');
  container.replaceChildren();
  container.textContent = source;
}

async function renderAll(state: MermaidState) {
  const themeChanged = ensureInitialized(state);

  const touched: HTMLElement[] = [];
  const candidates = document.querySelectorAll(
    'pre[data-language="mermaid"], pre code.language-mermaid, pre code.lang-mermaid',
  );

  for (const candidate of candidates) {
    const pre =
      candidate instanceof HTMLPreElement ? candidate : candidate.closest('pre');
    if (!(pre instanceof HTMLPreElement)) continue;
    const container = toDiagram(pre);
    if (container) touched.push(container);
  }

  if (themeChanged) {
    const existing = Array.from(
      document.querySelectorAll<HTMLElement>('.sl-mermaid.mermaid[data-processed]'),
    );
    for (const container of existing) resetForRerender(container);
    touched.push(...existing);
  }

  if (touched.length === 0) return;

  try {
    await mermaid.run({ nodes: touched });
  } catch {
    // Leave the original text content in place as a readable fallback.
  }
}

function getState(): MermaidState {
  const g = globalThis as unknown as Record<string, MermaidState | undefined>;
  return (
    g[GLOBAL_KEY] ??
    (g[GLOBAL_KEY] = {
      mounted: false,
      currentTheme: null,
    })
  );
}

export function mountMermaidDiagrams() {
  const state = getState();
  if (state.mounted) return;
  state.mounted = true;

  const scheduleRender = (() => {
    let timer: number | null = null;
    return () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = null;
        void renderAll(state);
      }, 0);
    };
  })();

  document.addEventListener('astro:page-load', scheduleRender);
  document.addEventListener('astro:after-swap', scheduleRender);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleRender, { once: true });
  } else {
    scheduleRender();
  }

  const observer = new MutationObserver(() => scheduleRender());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

