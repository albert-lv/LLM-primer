import { useMemo, useState } from 'react';
import './island.css';

type Row = {
  id: string;
  title: string;
  relevance: number;
  cost: number;
};

function scoreOf(row: Row) {
  if (row.cost <= 0) return Number.POSITIVE_INFINITY;
  return row.relevance / row.cost;
}

function formatScore(score: number) {
  if (!Number.isFinite(score)) return '∞';
  return score.toFixed(2);
}

export default function PriorityCalculator() {
  const [rows, setRows] = useState<Row[]>([
    { id: 'tokenization', title: 'Tokenization', relevance: 5, cost: 2 },
    { id: 'kv-cache', title: 'KV Cache', relevance: 4, cost: 3 },
    { id: 'alignment', title: 'Alignment', relevance: 3, cost: 4 },
  ]);

  const sorted = useMemo(() => {
    return [...rows]
      .map((row) => ({ ...row, score: scoreOf(row) }))
      .sort((a, b) => b.score - a.score);
  }, [rows]);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    const id = `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setRows((prev) => [...prev, { id, title: 'New', relevance: 3, cost: 3 }]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  const bestId = sorted[0]?.id;

  return (
    <section className="island-card" aria-label="Priority calculator">
      <p className="hint">score = relevance / cost（按 score 倒序）</p>

      <div className="island-actions">
        <button className="demo-button" type="button" onClick={addRow}>
          + 添加一行
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="island-table">
          <thead>
            <tr>
              <th style={{ minWidth: '10rem' }}>title</th>
              <th className="num">relevance</th>
              <th className="num">cost</th>
              <th className="num">score</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className={row.id === bestId ? 'top' : undefined}>
                <td>
                  <input
                    aria-label="title"
                    value={row.title}
                    onChange={(e) => updateRow(row.id, { title: e.target.value })}
                  />
                </td>
                <td className="num">
                  <input
                    aria-label="relevance"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={Number.isFinite(row.relevance) ? row.relevance : 0}
                    onChange={(e) => updateRow(row.id, { relevance: Number(e.target.value) })}
                  />
                </td>
                <td className="num">
                  <input
                    aria-label="cost"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={Number.isFinite(row.cost) ? row.cost : 0}
                    onChange={(e) => updateRow(row.id, { cost: Number(e.target.value) })}
                  />
                </td>
                <td className="num">
                  <strong>{formatScore(scoreOf(row))}</strong>
                </td>
                <td>
                  <button className="demo-button secondary" type="button" onClick={() => removeRow(row.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

