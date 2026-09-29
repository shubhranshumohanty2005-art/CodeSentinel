export default function RiskScoreGauge({ score = 0 }) {
  const getColor = (s) => {
    if (s <= 25) return '#22C55E';
    if (s <= 50) return '#EAB308';
    if (s <= 75) return '#F97316';
    return '#EF4444';
  };

  const getLabel = (s) => {
    if (s <= 25) return 'Low Risk';
    if (s <= 50) return 'Medium';
    if (s <= 75) return 'High';
    return 'Critical';
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          {/* Score arc */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-white/40">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color }}>{getLabel(score)}</span>
    </div>
  );
}
