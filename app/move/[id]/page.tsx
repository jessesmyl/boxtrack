import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { boxName } from "@/lib/box";
import { getMarket } from "@/lib/brand";
import { clientMoveUrl } from "@/lib/qr";
import { btnSecondary } from "@/lib/ui";
import Progress from "../../Progress";
import CategoryChart from "../../CategoryChart";
import AddBoxes from "./AddBoxes";
import MoveActions from "./MoveActions";
import ShareClientLink from "./ShareClientLink";

export const dynamic = "force-dynamic";

export default async function MovePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const move = await prisma.move.findUnique({
    where: { id },
    include: {
      boxes: {
        orderBy: { label: "asc" },
        include: { _count: { select: { photos: true, items: true } } },
      },
    },
  });
  if (!move) notFound();

  const total = move.boxes.length;
  const logged = move.boxes.filter((b) => b.room || b.category).length;
  const completed = move.status === "completed";
  const market = getMarket(move.market);

  const catCounts: Record<string, number> = {};
  for (const b of move.boxes) {
    if (b.category) catCounts[b.category] = (catCounts[b.category] ?? 0) + 1;
  }
  const hasCats = Object.keys(catCounts).length > 0;

  return (
    <div className="rise">
      <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ‹ All moves
      </Link>

      {/* Header card with progress */}
      <div className="mb-4 mt-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {move.clientName}
          </h1>
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
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{ background: market.accentSoft, color: market.accentText }}
          >
            {market.company}
          </span>
          {move.homeSize && (
            <span className="text-sm text-slate-500">{move.homeSize}</span>
          )}
        </div>

        {total > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-600">
                {logged} of {total} boxes logged
              </span>
              <span className="text-xl font-extrabold text-brand">
                {Math.round((logged / total) * 100)}%
              </span>
            </div>
            <Progress value={logged} total={total} />
          </div>
        )}
      </div>

      <div className="mb-3 flex gap-3">
        <AddBoxes moveId={move.id} />
        {total > 0 && (
          <Link
            href={`/move/${move.id}/stickers`}
            className={`${btnSecondary} px-5 py-3 text-center text-base`}
          >
            Stickers
          </Link>
        )}
      </div>

      {total > 0 && (
        <>
          <ShareClientLink
            clientUrl={clientMoveUrl(move.id)}
            clientName={move.clientName}
            company={market.company}
          />
          <div className="mb-6 grid grid-cols-2 gap-3">
            <Link
              href={`/c/${move.id}`}
              className={`${btnSecondary} py-3 text-center text-base`}
            >
              👤 Client view
            </Link>
            <Link
              href={`/move/${move.id}/gallery`}
              className={`${btnSecondary} py-3 text-center text-base`}
            >
              🖼 Photos
            </Link>
          </div>
        </>
      )}

      {hasCats && (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-800">Boxes by category</h2>
          <CategoryChart counts={catCounts} />
        </section>
      )}

      <ul className="space-y-2.5">
        {move.boxes.map((b) => {
          const done = b.room || b.category;
          return (
            <li key={b.id}>
              <Link
                href={`/move/${move.id}/log/${b.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-base font-bold ${
                      done ? "bg-brand text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {b.label}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">
                      {done ? (
                        boxName(b.room, b.label)
                      ) : (
                        <span className="font-semibold text-slate-400">
                          Box {b.label} · not logged
                        </span>
                      )}
                      {b.fragile && (
                        <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">
                          FRAGILE
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      {b.category || "—"}
                      {b._count.items > 0 &&
                        ` · ${b._count.items} item${b._count.items === 1 ? "" : "s"}`}
                      {b._count.photos > 0 &&
                        ` · ${b._count.photos} photo${b._count.photos === 1 ? "" : "s"}`}
                    </div>
                  </div>
                </div>
                <span className={`text-2xl ${done ? "text-green-500" : "text-slate-300"}`}>
                  {done ? "✓" : "›"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <MoveActions moveId={move.id} clientName={move.clientName} status={move.status} />
    </div>
  );
}
