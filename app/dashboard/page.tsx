import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getMarket } from "@/lib/brand";
import CategoryChart from "../CategoryChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const moves = await prisma.move.findMany({
    orderBy: { createdAt: "desc" },
    include: { boxes: { select: { room: true, category: true } } },
  });

  const totalMoves = moves.length;
  const totalBoxes = moves.reduce((a, m) => a + m.boxes.length, 0);
  const completed = moves.filter((m) => m.status === "completed").length;

  const counts: Record<string, number> = {};
  for (const m of moves) {
    for (const b of m.boxes) {
      if (b.category) counts[b.category] = (counts[b.category] ?? 0) + 1;
    }
  }

  const bySize: Record<string, { boxes: number; moves: number }> = {};
  for (const m of moves) {
    const key = m.homeSize || "Unspecified";
    if (!bySize[key]) bySize[key] = { boxes: 0, moves: 0 };
    bySize[key].boxes += m.boxes.length;
    bySize[key].moves += 1;
  }
  const sizeRows = Object.entries(bySize).sort((a, b) => b[1].moves - a[1].moves);

  return (
    <div className="rise">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-slate-900">Move data</h1>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Moves" value={totalMoves} />
        <Stat label="Boxes" value={totalBoxes} />
        <Stat label="Completed" value={completed} />
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-slate-800">Boxes by category</h2>
        <CategoryChart counts={counts} />
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Average boxes by home size</h2>
        <p className="mb-4 mt-0.5 text-sm text-slate-500">
          Use this to size quotes. Gets sharper as you log more moves.
        </p>
        {sizeRows.length === 0 ? (
          <p className="text-slate-500">No moves yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {sizeRows.map(([size, s]) => (
              <li key={size} className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">{size}</span>
                <span>
                  <span className="text-lg font-extrabold text-brand">
                    {Math.round(s.boxes / s.moves)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {" "}
                    avg · {s.moves} move{s.moves === 1 ? "" : "s"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-bold text-slate-800">Every move</h2>
        {moves.length === 0 ? (
          <p className="text-slate-500">No moves yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {moves.map((m) => {
              const logged = m.boxes.filter((b) => b.room || b.category).length;
              const market = getMarket(m.market);
              return (
                <li key={m.id}>
                  <Link
                    href={`/move/${m.id}`}
                    className="-mx-2 flex items-center justify-between rounded-lg px-2 py-3 transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-bold text-slate-900">{m.clientName}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                          style={{ background: market.accentSoft, color: market.accentText }}
                        >
                          {market.short}
                        </span>
                        <span className="text-sm text-slate-500">
                          {m.homeSize ? `${m.homeSize} · ` : ""}
                          {m.status === "completed" ? "completed" : "active"}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-extrabold text-slate-900">
                        {m.boxes.length}
                      </div>
                      <div className="text-xs text-slate-500">{logged} logged</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <div className="text-2xl font-extrabold text-slate-900">{value}</div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
    </div>
  );
}
