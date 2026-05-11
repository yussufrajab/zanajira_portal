import { useEffect, useRef } from 'react';

interface Props {
  pct: number;
  threshold?: number;
  compact?: boolean;
}

export default function ProfileProgressBar({ pct, threshold = 70, compact = false }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const clamped = Math.min(Math.max(pct, 0), 100);
  const isReady = clamped >= threshold;

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.setProperty('--progress-width', `${clamped}%`);
      barRef.current.style.width = `${clamped}%`;
    }
  }, [clamped]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-border rounded-pill overflow-hidden relative">
          <div
            ref={barRef}
            className="h-full rounded-pill transition-all duration-700 ease-out"
            style={{
              width: `${clamped}%`,
              background: isReady
                ? 'linear-gradient(90deg, #1B4F72, #C0932A)'
                : 'linear-gradient(90deg, #C07A10, #E8B030)',
            }}
          />
          {/* 70% marker */}
          <div
            className="absolute top-0 bottom-0 w-px bg-text-muted/60"
            style={{ left: `${threshold}%` }}
          />
        </div>
        <span className={`text-xs font-semibold font-body whitespace-nowrap ${isReady ? 'text-primary' : 'text-warning'}`}>
          {clamped}%
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-text-secondary font-body">Ukamilishaji wa Wasifu</span>
        <span className={`text-sm font-bold font-body ${isReady ? 'text-primary' : 'text-warning'}`}>
          {clamped}%
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-3 bg-border rounded-pill overflow-visible">
        <div
          ref={barRef}
          className="h-full rounded-pill transition-all duration-700 ease-out"
          style={{
            width: `${clamped}%`,
            background: isReady
              ? 'linear-gradient(90deg, #1B4F72 0%, #C0932A 100%)'
              : 'linear-gradient(90deg, #C07A10 0%, #E8B030 100%)',
          }}
        />
        {/* Threshold marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${threshold}%` }}
        >
          <div className="w-0.5 h-5 bg-text-secondary/40 rounded-pill" />
          <div className="absolute -bottom-6 whitespace-nowrap">
            <span className="text-[10px] text-text-muted font-body bg-surface px-1 rounded">
              Min {threshold}%
            </span>
          </div>
        </div>
      </div>

      {/* Status message */}
      <div className="mt-5">
        {isReady ? (
          <p className="text-xs text-success font-medium font-body flex items-center gap-1">
            <span>✓</span> Unaweza kuomba nafasi za kazi sasa!
          </p>
        ) : (
          <p className="text-xs text-warning font-medium font-body">
            Kamilisha wasifu wako ili uweze kuomba nafasi za kazi.
          </p>
        )}
      </div>
    </div>
  );
}
