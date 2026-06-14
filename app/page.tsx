import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getMarket, MARKET_LIST } from "@/lib/brand";
import Progress from "./Progress";
import NewMove from "./NewMove";

export const dynamic = "force-dynamic";

// OPS HOME — every move the team has run, across both markets. Filterable.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const activeMarket = m === "AB" || m === "ON" ? m : null;

  const moves = await prisma.move.findMany({
    orderBy: { createdAt: "desc" },
    include: { boxes: { select: { room: true, category: true } } },
  });

  const shown = activeMarket ? moves.filter((mv) => mv.market === activeMarket) : moves;

  const filters: { id: string | null; label: string }[] = [
    { id: null, label: "All" },
    ...MARKET_LIST.map((mk) => ({ id: mk.id, label: mk.short })),
  ];

  return (
    <div className="rise">
      <NewMove />

      {/* Market filter */}
      <div className="mt-6 flex gap-2">
        {filters.map((f) => {
          const active = activeMarket === f.id;
          return (
            <Link
              key={f.label}
              href={f.id ? `/?m=${f.id}` : "/"}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <h2 className="mb-3 mt-5 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {shown.length} move{shown.length === 1 ? "" : "s"}
      </h2>
      <ul className="space-y-3">
        {shown.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No moves yet. Tap the blue + to create your first one.
          </li>
        )}
        {shown.map((mv) => {
          const total = mv.boxes.length;
          const logged = mv.boxes.filter((b) => b.room || b.category).length;
          const completed = mv.status === "completed";
          const market = getMarket(mv.market);
          return (
            <li key={mv.id}>
              <Link
                href={`/move/${mv.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-bold text-slate-900">
                      {mv.clientName}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                        style={{ background: market.accentSoft, color: market.accentText }}
                      >
                        {market.short}
                      </span>
                      <span className="text-sm text-slate-500">
                        {mv.homeSize ? `${mv.homeSize} · ` : ""}
                        {total} box{total === 1 ? "" : "es"}
                      </span>
                    </div>
                  </div>
                  {completed ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      ✓ Done
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand">
                      Active
                    </span>
                  )}
                </div>

                {total > 0 && (
                  <div className="mt-4">
                    <Progress value={logged} total={total} />
                    <div className="mt-1.5 text-xs font-medium text-slate-500">
                      {logged} of {total} logged
                    </div>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
