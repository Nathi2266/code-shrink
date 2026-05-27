export default function StatsBar({ stats }) {
  if (!stats) return null;

  const items = [
    { label: 'LINES SAVED', value: `${stats.linesSaved >= 0 ? '+' : ''}${stats.linesSaved}` },
    { label: 'CHARS SAVED', value: `${stats.charsSaved >= 0 ? '+' : ''}${stats.charsSaved?.toLocaleString()}` },
    { label: 'REDUCTION', value: `${stats.reduction}%` },
    { label: 'OUTPUT LINES', value: stats.outputLines?.toLocaleString() },
  ];

  return (
    <div className="flex flex-wrap gap-3 font-mono">
      {items.map(item => (
        <div key={item.label} className="stat-badge px-3 py-1.5 rounded text-xs flex items-center gap-2">
          <span style={{ color: 'rgba(0,255,65,0.5)' }}>{item.label}:</span>
          <span className="text-neon font-semibold neon-glow-sm">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
