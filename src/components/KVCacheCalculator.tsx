import { useState } from 'react';

export default function KVCacheCalculator() {
  const [seqLen, setSeqLen] = useState(2048);
  const [batchSize, setBatchSize] = useState(1);
  const [numLayers, setNumLayers] = useState(32);
  const [hiddenSize, setHiddenSize] = useState(4096);
  const [numHeads, setNumHeads] = useState(32);
  const [precision, setPrecision] = useState<'fp16' | 'fp32'>('fp16');

  const headDim = hiddenSize / numHeads;
  const bytesPerParam = precision === 'fp16' ? 2 : 4;

  // KV cache size = 2 (K and V) × batch × seq_len × layers × hidden_size × bytes
  const kvCacheBytes = 2 * batchSize * seqLen * numLayers * hiddenSize * bytesPerParam;
  const kvCacheMB = kvCacheBytes / (1024 * 1024);
  const kvCacheGB = kvCacheMB / 1024;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} GB`;
  };

  return (
    <div style={{
      background: 'var(--sl-color-bg-sidebar)',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      marginTop: '1.5rem',
    }}>
      <h3 style={{ marginTop: 0 }}>KV Cache Calculator</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--sl-color-gray-2)' }}>
        Calculate KV cache memory requirements for LLM inference
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Sequence Length</span>
          <input
            type="number"
            value={seqLen}
            onChange={(e) => setSeqLen(Number(e.target.value))}
            min={1}
            max={131072}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--sl-color-gray-4)',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: 'inherit',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Batch Size</span>
          <input
            type="number"
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            min={1}
            max={128}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--sl-color-gray-4)',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: 'inherit',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Number of Layers</span>
          <input
            type="number"
            value={numLayers}
            onChange={(e) => setNumLayers(Number(e.target.value))}
            min={1}
            max={128}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--sl-color-gray-4)',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: 'inherit',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Hidden Size</span>
          <input
            type="number"
            value={hiddenSize}
            onChange={(e) => setHiddenSize(Number(e.target.value))}
            min={128}
            max={16384}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--sl-color-gray-4)',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: 'inherit',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Number of Heads</span>
          <input
            type="number"
            value={numHeads}
            onChange={(e) => setNumHeads(Number(e.target.value))}
            min={1}
            max={128}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--sl-color-gray-4)',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: 'inherit',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Precision</span>
          <select
            value={precision}
            onChange={(e) => setPrecision(e.target.value as 'fp16' | 'fp32')}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--sl-color-gray-4)',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option value="fp16">FP16 (2 bytes)</option>
            <option value="fp32">FP32 (4 bytes)</option>
          </select>
        </label>
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        background: 'var(--sl-color-gray-6)',
        borderRadius: '0.5rem',
      }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--sl-color-gray-2)', marginBottom: '0.75rem' }}>
          <strong>Calculated KV Cache Size:</strong>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--sl-color-text-accent)' }}>
          {formatSize(kvCacheMB)}
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--sl-color-gray-2)' }}>
          <div>Head Dimension: {headDim}</div>
          <div>Per Token: {((kvCacheBytes / seqLen / batchSize) / 1024).toFixed(2)} KB</div>
          <div>Formula: 2 × B × L × N × D × bytes_per_param</div>
        </div>
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'var(--sl-color-bg-sidebar)',
        border: '1px solid var(--sl-color-gray-5)',
        borderRadius: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--sl-color-gray-2)',
      }}>
        <strong>Quick Presets:</strong>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setSeqLen(2048); setBatchSize(1); setNumLayers(32); setHiddenSize(4096); setNumHeads(32); setPrecision('fp16');
            }}
            style={{
              padding: '0.4rem 0.75rem',
              border: '1px solid var(--sl-color-gray-4)',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            LLaMA-7B-like
          </button>
          <button
            onClick={() => {
              setSeqLen(4096); setBatchSize(1); setNumLayers(40); setHiddenSize(5120); setNumHeads(40); setPrecision('fp16');
            }}
            style={{
              padding: '0.4rem 0.75rem',
              border: '1px solid var(--sl-color-gray-4)',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            LLaMA-13B-like
          </button>
          <button
            onClick={() => {
              setSeqLen(8192); setBatchSize(1); setNumLayers(80); setHiddenSize(8192); setNumHeads(64); setPrecision('fp16');
            }}
            style={{
              padding: '0.4rem 0.75rem',
              border: '1px solid var(--sl-color-gray-4)',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            LLaMA-70B-like
          </button>
        </div>
      </div>
    </div>
  );
}
