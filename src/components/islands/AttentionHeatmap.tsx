import { useState } from 'react';
import data from '../../data/attention-demo.json';
import './island.css';

type DemoData = { tokens: string[]; weights: number[][] };
const demo = data as DemoData;

export default function AttentionHeatmap() {
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);
  return (
    <section className="island-card" aria-label="Attention heatmap">
      <p className="hint">行表示正在更新的 token，列表示它关注的上下文 token；颜色越深，权重越高。</p>
      <div className="heatmap-wrap">
        <table className="heatmap">
          <thead>
            <tr><th>query \ key</th>{demo.tokens.map((token, i) => <th className={hover?.col === i ? 'active' : ''} key={token}>{token}</th>)}</tr>
          </thead>
          <tbody>
            {demo.tokens.map((rowToken, r) => (
              <tr key={rowToken}>
                <th className={hover?.row === r ? 'active' : ''}>{rowToken}</th>
                {demo.weights[r].map((weight, c) => (
                  <td key={`${r}-${c}`} onMouseEnter={() => setHover({ row: r, col: c })} onFocus={() => setHover({ row: r, col: c })} onMouseLeave={() => setHover(null)}>
                    <span className="cell" tabIndex={0} style={{ background: `rgba(59, 130, 246, ${0.12 + weight * 0.88})` }} aria-label={`${rowToken} attends to ${demo.tokens[c]}: ${weight.toFixed(2)}`}>
                      {weight.toFixed(2)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
