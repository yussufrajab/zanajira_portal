interface Props {
  pct: number;
  size?: number;
  strokeWidth?: number;
  threshold?: number;
}

export default function CircularProgress({ pct, size = 80, strokeWidth = 6, threshold = 70 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(pct, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;
  const isReady = clamped >= threshold;
  const color = isReady ? '#1B4F72' : '#C07A10';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#E2EAF4" strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold font-body" style={{ color }}>{clamped}%</span>
        {isReady && <span className="text-[8px] text-success font-body">✓</span>}
      </div>
    </div>
  );
}
