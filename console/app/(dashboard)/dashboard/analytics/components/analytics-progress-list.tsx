interface ProgressItem {
  label: string;
  count: number;
  percentage: number;
}

interface AnalyticsProgressListProps {
  items: ProgressItem[];
  emptyMessage: string;
  formatLabel?: (label: string) => string;
}

export function AnalyticsProgressList({
  items,
  emptyMessage,
  formatLabel = (l) => l.toLowerCase(),
}: AnalyticsProgressListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <ul className="space-y-3" role="list">
      {items.map((item) => (
        <li key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground capitalize">
              {formatLabel(item.label)}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {item.count.toLocaleString()} ({item.percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${item.percentage}%` }}
              role="presentation"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
