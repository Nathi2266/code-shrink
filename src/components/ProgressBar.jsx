export default function ProgressBar({ progress, label }) {
  return (
    <div className="w-full font-mono">
      <div className="mb-1 flex justify-between text-xs text-neon-dim">
        <span>{label || 'PROCESSING...'}</span>
        <span className="text-neon">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-sm border border-neon-dark bg-black">
        <div
          className="progress-bar-fill h-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
