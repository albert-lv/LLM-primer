const PYODIDE_VERSION = '0.28.0';
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

type RunRequest = {
  id: number;
  type: 'run';
  code: string;
  packages?: string[];
};

type OutgoingType = 'ready' | 'progress' | 'stdout' | 'stderr' | 'done' | 'error';

type OutgoingMessage = {
  id: number;
  type: OutgoingType;
  payload?: unknown;
};

function post(id: number, type: OutgoingType, payload?: unknown) {
  self.postMessage({ id, type, payload } satisfies OutgoingMessage);
}

let pyodide: any | null = null;
let loadPromise: Promise<any> | null = null;
let runQueue: Promise<void> = Promise.resolve();

async function ensurePyodide(forMessageId: number) {
  if (pyodide) return pyodide;
  if (!loadPromise) {
    loadPromise = (async () => {
      // `importScripts()` is not available in module workers; use dynamic import instead.
      const mod = await import(
        /* @vite-ignore */
        `${PYODIDE_BASE}pyodide.mjs`
      );
      const loaded = await mod.loadPyodide({ indexURL: PYODIDE_BASE });
      return loaded;
    })();
  }

  post(forMessageId, 'progress', { stage: 'loading-runtime' });
  pyodide = await loadPromise;

  pyodide.setStdout({
    batched: (text: string) => post(forMessageId, 'stdout', text),
  });
  pyodide.setStderr({
    batched: (text: string) => post(forMessageId, 'stderr', text),
  });

  post(forMessageId, 'ready');
  return pyodide;
}

async function runOne(message: RunRequest) {
  const { id, code } = message;
  const packages = Array.isArray(message.packages) ? message.packages : [];

  try {
    const runtime = await ensurePyodide(id);
    post(id, 'progress', { stage: 'loading-packages' });

    await runtime.loadPackagesFromImports(code);
    const extra = Array.from(new Set(packages.filter(Boolean)));
    if (extra.length > 0) await runtime.loadPackage(extra);

    post(id, 'progress', { stage: 'running' });
    await runtime.runPythonAsync(code);
    post(id, 'done');
  } catch (err: any) {
    const messageText = typeof err?.message === 'string' ? err.message : String(err);
    post(id, 'error', messageText);
    // Best-effort: also emit a stack trace if present so it shows in the UI.
    if (typeof err?.stack === 'string') post(id, 'stderr', err.stack);
    post(id, 'done');
  }
}

self.onmessage = (event: MessageEvent<RunRequest>) => {
  const msg = event.data;
  if (!msg || msg.type !== 'run') return;

  runQueue = runQueue
    .then(() => runOne(msg), () => runOne(msg))
    .catch(() => {});
};
