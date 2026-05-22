type WorkerMessageType = 'ready' | 'progress' | 'stdout' | 'stderr' | 'done' | 'error';

type WorkerMessage = {
  id: number;
  type: WorkerMessageType;
  payload?: unknown;
};

export type RunCallbacks = {
  onStdout?: (text: string) => void;
  onStderr?: (text: string) => void;
  onProgress?: (payload: unknown) => void;
};

type Pending = {
  resolve: () => void;
  reject: (err: Error) => void;
  callbacks?: RunCallbacks;
};

export type PyodideRunner = {
  run: (code: string, packages?: string[], callbacks?: RunCallbacks) => Promise<void>;
  reset: () => void;
};

let runnerSingleton: PyodideRunner | null = null;

export function getRunner(): PyodideRunner {
  if (runnerSingleton) return runnerSingleton;

  let worker: Worker | null = null;
  let nextId = 1;
  const pending = new Map<number, Pending>();

  function ensureWorker() {
    if (worker) return worker;
    worker = new Worker(new URL('../workers/pyodide-worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const msg = event.data;
      if (!msg || typeof msg.id !== 'number' || typeof msg.type !== 'string') return;

      const entry = pending.get(msg.id);
      if (!entry) return;

      if (msg.type === 'stdout') entry.callbacks?.onStdout?.(String(msg.payload ?? ''));
      if (msg.type === 'stderr') entry.callbacks?.onStderr?.(String(msg.payload ?? ''));
      if (msg.type === 'progress') entry.callbacks?.onProgress?.(msg.payload);

      if (msg.type === 'error') {
        pending.delete(msg.id);
        entry.reject(new Error(String(msg.payload ?? 'Unknown error')));
        return;
      }

      if (msg.type === 'done') {
        pending.delete(msg.id);
        entry.resolve();
      }
    };

    worker.onerror = () => {
      for (const [id, entry] of pending) {
        pending.delete(id);
        entry.reject(new Error('Pyodide worker crashed'));
      }
      worker?.terminate();
      worker = null;
    };

    return worker;
  }

  runnerSingleton = {
    run: (code, packages, callbacks) => {
      const id = nextId++;
      const w = ensureWorker();

      return new Promise<void>((resolve, reject) => {
        pending.set(id, { resolve, reject, callbacks });
        w.postMessage({ id, type: 'run', code, packages: packages ?? [] });
      });
    },
    reset: () => {
      if (!worker) return;
      worker.terminate();
      worker = null;
      for (const [id, entry] of pending) {
        pending.delete(id);
        entry.reject(new Error('Pyodide runner was reset'));
      }
    },
  };

  return runnerSingleton;
}

