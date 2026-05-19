import { useMemo, useState } from 'react';
import logits from '../../data/sampling-logits.json';
import './island.css';

type Entry = { token: string; logit: number };
const entries = logits as Entry[];

function softmax(items: Entry[], temperature: number) {
  const t = Math.max(temperature, 0.05);
  const max = Math.max(...items.map((x) => x.logit / t));
  const exp = items.map((x) => Math.exp(x.logit / t - max));
  const total = exp.reduce((a, b) => a + b, 0);
  return items.map((item, i) => ({ ...item, p: exp[i] / total }));
}

function filterDistribution(distribution: ReturnType<typeof softmax>, topK: number, topP: number) {
  const sorted = [...distribution].sort((a, b) => b.p - a.p).slice(0, topK);
  let cumulative = 0;
  const filtered = [];
  for (const item of sorted) {
    cumulative += item.p;
    filtered.push(item);
    if (cumulative >= topP) break;
  }
  const norm = filtered.reduce((sum, item) => sum + item.p, 0);
  return filtered.map((item) => ({ ...item, p: item.p / norm }));
}

export default function SamplingPlayground() {
  const [temperature, setTemperature] = useState(0.8);
  const [topK, setTopK] = useState(10);
  const [topP, setTopP] = useState(0.9);
  const [cursor, setCursor] = useState(0);
  const distribution = useMemo(() => filterDistribution(softmax(entries, temperature), topK, topP), [temperature, topK, topP]);
  const chosen = distribution[cursor % distribution.length] ?? distribution[0];

  return (
    <section className="island-card" aria-label="Sampling playground">
      <div className="controls-grid">
        <label>Temperature <strong>{temperature.toFixed(2)}</strong><input type="range" min="0.1" max="2" step="0.05" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} /></label>
        <label>Top-k <strong>{topK}</strong><input type="range" min="1" max="40" step="1" value={topK} onChange={(e) => setTopK(Number(e.target.value))} /></label>
        <label>Top-p <strong>{topP.toFixed(2)}</strong><input type="range" min="0.1" max="1" step="0.05" value={topP} onChange={(e) => setTopP(Number(e.target.value))} /></label>
      </div>
      <button className="demo-button" type="button" onClick={() => setCursor((x) => x + 1)}>确定性取样下一项</button>
      {chosen && <p className="next-token">下一个 token：<strong>{chosen.token}</strong>（{(chosen.p * 100).toFixed(1)}%）</p>}
      <div className="bars">
        {distribution.slice(0, 15).map((item) => (
          <div className="bar-row" key={item.token}>
            <span>{item.token}</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${item.p * 100}%` }} /></div>
            <span>{(item.p * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
