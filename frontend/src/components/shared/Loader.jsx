export default function Loader({ text = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizeClasses[size]} border-2 border-white/10 border-t-accent rounded-full animate-spin`} />
      <p className="text-sm text-white/40">{text}</p>
    </div>
  );
}

export function ProgressBar({ percent = 0, status = '', message = '' }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-white/60">{message || status}</span>
        <span className="text-sm font-mono text-accent">{percent}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}
