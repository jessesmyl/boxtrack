import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { boxName } from "@/lib/box";

export const dynamic = "force-dynamic";

export default async function GalleryPage({
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
        include: { photos: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!move) notFound();

  const shots = move.boxes.flatMap((b) =>
    b.photos.map((p) => ({
      url: p.url,
      label: b.label,
      room: b.room,
      fragile: b.fragile,
      takenAt: p.createdAt,
    }))
  );

  return (
    <div className="rise">
      <Link
        href={`/move/${move.id}`}
        className="text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        ‹ Back
      </Link>
      <header className="mb-5 mt-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Condition record
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {move.clientName} · {shots.length} photo{shots.length === 1 ? "" : "s"},
          timestamped at pack time
        </p>
      </header>

      {shots.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No photos yet. Snap one on each box when packing.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shots.map((s, i) => (
            <figure
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.url} alt={`Box ${s.label}`} className="aspect-square w-full object-cover" />
              <figcaption className="p-3 text-xs">
                <span className="text-sm font-bold text-slate-900">
                  {boxName(s.room, s.label)}
                </span>
                {s.fragile && <span className="ml-1 font-bold text-red-600">· FRAGILE</span>}
                <div className="mt-0.5 text-slate-400">
                  {new Date(s.takenAt).toLocaleString()}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
