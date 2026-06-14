import { colorAt } from "@/lib/colors";

type Slice = { label: string; value: number; color: string };

function Donut({ data, size = 200 }: { data: Slice[]; size?: number }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const stroke = 30;
  const r = size / 2 - stroke / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e5e5" strokeWidth={stroke} />
        ) : (
          data.map((d, i) => {
            const len = (d.value / total) * C;
            const el = (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })
        )}
      </g>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        className="fill-slate-900"
        fontSize="28"
        fontWeight="800"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        className="fill-slate-500"
        fontSize="13"
        fontWeight="600"
      >
        boxes
      </text>
    </svg>
  );
}

// Takes a {category: count} map and renders a donut + legend.
export default function CategoryChart({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, [, v]) => a + v, 0);
  const data: Slice[] = entries.map(([label, value], i) => ({
    label,
    value,
    color: colorAt(i),
  }));

  if (total === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
        No categories logged yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
      <Donut data={data} />
      <ul className="w-full flex-1 space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-3">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded"
              style={{ backgroundColor: d.color }}
            />
            <span className="flex-1 font-semibold text-slate-700">{d.label}</span>
            <span className="font-bold text-slate-900">{d.value}</span>
            <span className="w-10 text-right text-sm text-slate-500">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
