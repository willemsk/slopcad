import {h} from 'preact';

export function UcsIcon() {
  return (
    <div
      className="ucs-icon"
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
        <g stroke="var(--text-muted)" stroke-width="2" fill="none">
          <line x1="5" y1="35" x2="5" y2="5" />
          <polygon
            points="5,1 2,7 8,7"
            fill="var(--text-muted)"
            stroke="none"
          />
          <line x1="5" y1="35" x2="35" y2="35" />
          <polygon
            points="39,35 33,32 33,38"
            fill="var(--text-muted)"
            stroke="none"
          />
          <rect x="5" y="30" width="5" height="5" stroke="var(--text-muted)" />
          <text
            x="32"
            y="28"
            fill="var(--text-muted)"
            stroke="none"
            font-size="10"
            font-family="sans-serif"
          >
            X
          </text>
          <text
            x="10"
            y="10"
            fill="var(--text-muted)"
            stroke="none"
            font-size="10"
            font-family="sans-serif"
          >
            Y
          </text>
        </g>
      </svg>
    </div>
  );
}
