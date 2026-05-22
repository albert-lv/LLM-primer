import { useEffect, useMemo, useState } from 'react';
import { getRunner, type RunCallbacks } from '../../lib/pyodide-client';
import './island.css';

export interface RunnableCodeProps {
  code: string;
  lang?: string;
  packages?: string[];
  title?: string;
}

type Status = 'idle' | 'loading' | 'running' | 'done' | 'error';
type OutputLine = { kind: 'stdout' | 'stderr'; text: string };

function isMobileUserAgent(ua: string) {
  return /(iPhone|iPad|Android)/i.test(ua);
}

function splitLines(chunk: string) {
  return chunk.replace(/\r\n/g, '\n').split('\n');
}

export default function RunnableCode(props: RunnableCodeProps) {
  const code = props.code ?? '';
  const lang = props.lang ?? 'python';
  const packages = useMemo(() => props.packages ?? [], [props.packages]);
  const title = props.title ?? '可运行示例';

  const [isMobile, setIsMobile] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [lines, setLines] = useState<OutputLine[]>([]);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setIsMobile(isMobileUserAgent(navigator.userAgent));
  }, []);

  function append(kind: OutputLine['kind'], chunk: string) {
    const parts = splitLines(chunk);
    setLines((prev) => [...prev, ...parts.map((text) => ({ kind, text }))]);
  }

  async function handleRun() {
    if (isMobile) return;
    if (!code.trim()) return;

    setLines([]);
    setRunning(true);
    setStatus('loading');

    const callbacks: RunCallbacks = {
      onStdout: (text) => append('stdout', text),
      onStderr: (text) => append('stderr', text),
      onProgress: (payload) => {
        const stage = typeof (payload as any)?.stage === 'string' ? (payload as any).stage : '';
        if (stage === 'running') setStatus('running');
        if (stage === 'loading-runtime' || stage === 'loading-packages') setStatus('loading');
      },
    };

    try {
      await getRunner().run(code, packages, callbacks);
      setStatus('done');
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : String(err);
      append('stderr', message);
      setStatus('error');
    } finally {
      setRunning(false);
    }
  }

  function handleStop() {
    getRunner().reset();
    setRunning(false);
    setStatus('idle');
  }

  function handleReset() {
    setLines([]);
  }

  return (
    <div className="runnable-code island-card" aria-label="Runnable code block">
      <strong>{title}</strong>

      <pre className="code-area">
        <code className={`language-${lang}`}>{code}</code>
      </pre>

      <div className="runnable-actions">
        {!isMobile && (
          <button
            className="demo-button"
            type="button"
            onClick={running ? handleStop : handleRun}
            aria-label={running ? 'Stop running code' : 'Run code'}
          >
            {running ? 'Stop' : 'Run'}
          </button>
        )}

        <button className="demo-button secondary" type="button" onClick={handleReset} aria-label="Reset output">
          Reset
        </button>
      </div>

      {isMobile && <p className="progress">请在桌面端体验代码运行。</p>}
      {!isMobile && status === 'loading' && (
        <p className="progress">正在加载 Python 运行时（约 10MB），仅首次需要下载…</p>
      )}

      <pre className="runnable-output" role="log" aria-live="polite">
        {lines.map((line, index) => (
          <span className={line.kind === 'stderr' ? 'err' : undefined} key={`${index}-${line.kind}`}>
            {line.text}
            {'\n'}
          </span>
        ))}
      </pre>
    </div>
  );
}

