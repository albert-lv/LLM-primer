import { useState, useMemo } from 'react';

export default function ScalingLawCurve() {
  const [dataTokens, setDataTokens] = useState(20); // in billions
  const [computeFLOPs, setComputeFLOPs] = useState(1e21); // FLOPs
  const [showChinchilla, setShowChinchilla] = useState(true);

  // Chinchilla scaling law: N_opt ~ (C / 6)^0.5, D_opt ~ (C / 6)^0.5
  // where C is compute, N is model size, D is data size
  const chinchillaOptimalParams = useMemo(() => {
    return Math.pow(computeFLOPs / 6, 0.5) / 1e9; // in billions
  }, [computeFLOPs]);

  const chinchillaOptimalTokens = useMemo(() => {
    return Math.pow(computeFLOPs / 6, 0.5) / 1e9; // in billions
  }, [computeFLOPs]);

  // Generate curve points for visualization
  const curvePoints = useMemo(() => {
    const points = [];
    const maxParams = 200; // in billions
    for (let params = 1; params <= maxParams; params += 5) {
      // Approximate loss using Chinchilla scaling law
      // L(N, D) ≈ E + A/N^α + B/D^β
      const E = 1.69; // irreducible loss
      const A = 406.4;
      const B = 410.7;
      const alpha = 0.34;
      const beta = 0.28;

      const loss = E + A / Math.pow(params, alpha) + B / Math.pow(dataTokens, beta);
      points.push({ params, loss });
    }
    return points;
  }, [dataTokens]);

  const minLoss = Math.min(...curvePoints.map(p => p.loss));
  const maxLoss = Math.max(...curvePoints.map(p => p.loss));

  // SVG dimensions
  const width = 600;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  return (
    <div style={{
      background: 'var(--sl-color-bg-sidebar)',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      marginTop: '1.5rem',
    }}>
      <h3 style={{ marginTop: 0 }}>Scaling Law Curve</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--sl-color-gray-2)' }}>
        Visualize how model size and training data affect loss (Chinchilla scaling laws)
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            Training Data (Billions of Tokens)
          </span>
          <input
            type="range"
            value={dataTokens}
            onChange={(e) => setDataTokens(Number(e.target.value))}
            min={1}
            max={100}
            step={1}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--sl-color-gray-3)' }}>
            {dataTokens}B tokens
          </span>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            Compute Budget (log₁₀ FLOPs)
          </span>
          <input
            type="range"
            value={Math.log10(computeFLOPs)}
            onChange={(e) => setComputeFLOPs(Math.pow(10, Number(e.target.value)))}
            min={20}
            max={24}
            step={0.1}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--sl-color-gray-3)' }}>
            10^{Math.log10(computeFLOPs).toFixed(1)} FLOPs
          </span>
        </label>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showChinchilla}
            onChange={(e) => setShowChinchilla(e.target.checked)}
          />
          Show Chinchilla optimal point
        </label>
      </div>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          marginTop: '1.5rem',
          background: 'white',
          borderRadius: '0.5rem',
        }}
      >
        {/* X-axis */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="#666"
          strokeWidth="2"
        />
        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="#666"
          strokeWidth="2"
        />

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize="12"
          fill="#666"
        >
          Model Size (Billions of Parameters)
        </text>

        {/* Y-axis label */}
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          fontSize="12"
          fill="#666"
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          Loss
        </text>

        {/* Curve */}
        <polyline
          points={curvePoints.map((p, i) => {
            const x = margin.left + (p.params / 200) * chartWidth;
            const y = height - margin.bottom - ((p.loss - minLoss) / (maxLoss - minLoss)) * chartHeight;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="var(--sl-color-text-accent, #0070f3)"
          strokeWidth="3"
        />

        {/* Chinchilla optimal point */}
        {showChinchilla && (
          <>
            <circle
              cx={margin.left + (chinchillaOptimalParams / 200) * chartWidth}
              cy={height - margin.bottom - ((curvePoints.find(p => Math.abs(p.params - chinchillaOptimalParams) < 10)?.loss || minLoss) - minLoss) / (maxLoss - minLoss) * chartHeight}
              r="6"
              fill="#22c55e"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={margin.left + (chinchillaOptimalParams / 200) * chartWidth}
              y={height - margin.bottom - ((curvePoints.find(p => Math.abs(p.params - chinchillaOptimalParams) < 10)?.loss || minLoss) - minLoss) / (maxLoss - minLoss) * chartHeight - 15}
              textAnchor="middle"
              fontSize="11"
              fill="#22c55e"
              fontWeight="600"
            >
              Optimal
            </text>
          </>
        )}

        {/* X-axis ticks */}
        {[0, 50, 100, 150, 200].map((tick) => (
          <text
            key={tick}
            x={margin.left + (tick / 200) * chartWidth}
            y={height - margin.bottom + 20}
            textAnchor="middle"
            fontSize="10"
            fill="#666"
          >
            {tick}B
          </text>
        ))}
      </svg>

      {showChinchilla && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'var(--sl-color-gray-6)',
          borderRadius: '0.5rem',
          fontSize: '0.9rem',
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#22c55e' }}>
            Chinchilla Optimal Configuration:
          </div>
          <div style={{ color: 'var(--sl-color-gray-2)' }}>
            <div>Model Size: ~{chinchillaOptimalParams.toFixed(1)}B parameters</div>
            <div>Training Data: ~{chinchillaOptimalTokens.toFixed(1)}B tokens</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontStyle: 'italic' }}>
              For your compute budget of 10^{Math.log10(computeFLOPs).toFixed(1)} FLOPs
            </div>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'var(--sl-color-bg-sidebar)',
        border: '1px solid var(--sl-color-gray-5)',
        borderRadius: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--sl-color-gray-2)',
      }}>
        <strong>Note:</strong> This visualization uses simplified Chinchilla scaling laws.
        The actual relationship between model size, data, compute, and loss is more complex.
      </div>
    </div>
  );
}
