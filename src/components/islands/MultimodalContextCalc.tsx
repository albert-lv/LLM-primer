import { useMemo, useState } from 'react';
import './island.css';

export default function MultimodalContextCalc() {
  const [textTokens, setTextTokens] = useState(1200);
  const [imageCount, setImageCount] = useState(1);
  const [tokensPerImage, setTokensPerImage] = useState(576);
  const [audioSeconds, setAudioSeconds] = useState(0);
  const [tokensPerSecond, setTokensPerSecond] = useState(50);

  const { imageTokens, audioTokens, total, parts } = useMemo(() => {
    const safeImageCount = Math.max(0, imageCount);
    const safeTokensPerImage = Math.max(0, tokensPerImage);
    const safeAudioSeconds = Math.max(0, audioSeconds);
    const safeTokensPerSecond = Math.max(0, tokensPerSecond);
    const safeTextTokens = Math.max(0, textTokens);

    const imageTokens = safeImageCount * safeTokensPerImage;
    const audioTokens = safeAudioSeconds * safeTokensPerSecond;
    const total = safeTextTokens + imageTokens + audioTokens;
    const denom = total <= 0 ? 1 : total;

    return {
      imageTokens,
      audioTokens,
      total,
      parts: [
        { label: 'Text', value: safeTextTokens, pct: (safeTextTokens / denom) * 100 },
        { label: 'Image', value: imageTokens, pct: (imageTokens / denom) * 100 },
        { label: 'Audio', value: audioTokens, pct: (audioTokens / denom) * 100 },
      ],
    };
  }, [audioSeconds, imageCount, textTokens, tokensPerImage, tokensPerSecond]);

  return (
    <section className="island-card" aria-label="Multimodal context calculator">
      <div className="controls-grid">
        <label>
          Text tokens <strong>{Math.max(0, textTokens)}</strong>
          <input type="number" min="0" step="50" value={textTokens} onChange={(e) => setTextTokens(Number(e.target.value))} />
        </label>
        <label>
          Images <strong>{Math.max(0, imageCount)}</strong>
          <input type="number" min="0" step="1" value={imageCount} onChange={(e) => setImageCount(Number(e.target.value))} />
        </label>
        <label>
          Tokens / image <strong>{Math.max(0, tokensPerImage)}</strong>
          <input type="number" min="0" step="16" value={tokensPerImage} onChange={(e) => setTokensPerImage(Number(e.target.value))} />
        </label>
        <label>
          Audio seconds <strong>{Math.max(0, audioSeconds)}</strong>
          <input type="number" min="0" step="10" value={audioSeconds} onChange={(e) => setAudioSeconds(Number(e.target.value))} />
        </label>
        <label>
          Tokens / sec <strong>{Math.max(0, tokensPerSecond)}</strong>
          <input type="number" min="0" step="5" value={tokensPerSecond} onChange={(e) => setTokensPerSecond(Number(e.target.value))} />
        </label>
      </div>

      <div className="metrics">
        <div>
          <span className="hint">L_total</span>
          <div className="next-token">
            <strong>{total.toLocaleString()}</strong> tokens
          </div>
        </div>
        <div className="hint">
          Image tokens: <strong>{imageTokens.toLocaleString()}</strong> · Audio tokens: <strong>{audioTokens.toLocaleString()}</strong>
        </div>
      </div>

      <div className="bars" aria-label="Token composition">
        {parts.map((p) => (
          <div className="bar-row" key={p.label}>
            <span>{p.label}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${p.pct}%` }} />
            </div>
            <span>{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

