export default function Progress({
  value,
  total,
}: {
  value: number;
  total: number;
}) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-brand transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
