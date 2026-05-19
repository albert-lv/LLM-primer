import { useMemo, useState } from 'react';
import { getEncoding } from 'js-tiktoken';
import './island.css';

type TokenPiece = { text: string; token: number };

let encoder: ReturnType<typeof getEncoding> | null | undefined;

function getEncoder() {
  if (encoder !== undefined) return encoder;
  try {
    encoder = getEncoding('o200k_base');
  } catch {
    try {
      encoder = getEncoding('cl100k_base');
    } catch {
      encoder = null;
    }
  }
  return encoder;
}

function decodePieces(text: string): TokenPiece[] {
  const enc = getEncoder();
  if (!enc) {
    return Array.from(text).map((char, i) => ({ text: char, token: i }));
  }
  const tokens = enc.encode(text);
  return tokens.map((token) => {
    try {
      return { token, text: enc.decode([token]) };
    } catch {
      return { token, text: `#${token}` };
    }
  });
}

export default function TokenizerDemo() {
  const [text, setText] = useState('大语言模型把文本切成 token，再预测下一个 token。');
  const pieces = useMemo(() => decodePieces(text), [text]);

  return (
    <section className="island-card" aria-label="Tokenizer demo">
      <label className="control-label" htmlFor="tokenizer-input">输入文本</label>
      <textarea id="tokenizer-input" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
      <div className="metrics">
        <span>字符：{Array.from(text).length}</span>
        <span>Token：{pieces.length}</span>
      </div>
      <div className="token-pills" aria-live="polite">
        {pieces.map((piece, index) => (
          <span className="token-pill" style={{ '--hue': String((index * 47) % 360) } as React.CSSProperties} title={`token ${piece.token}`} key={`${piece.token}-${index}`}>
            {piece.text || '∅'}
          </span>
        ))}
      </div>
      {!getEncoder() && <p className="hint">Tokenizer 加载失败，已退回到按字符切分演示。</p>}
    </section>
  );
}
