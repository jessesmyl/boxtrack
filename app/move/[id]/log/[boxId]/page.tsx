import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BoxLogger from "./BoxLogger";

export const dynamic = "force-dynamic";

// OPS SIDE — crew log a box during packing. Reached from the move's box list
// (or the discreet crew link on a scanned box). Same fast, tap-only flow.
export default async function LogBoxPage({
  params,
}: {
  params: Promise<{ id: string; boxId: string }>;
}) {
  const { id, boxId } = await params;
  const box = await prisma.box.findUnique({
    where: { id: boxId },
    include: {
      photos: { orderBy: { createdAt: "asc" } },
      items: { orderBy: { createdAt: "asc" } },
      move: true,
    },
  });
  if (!box || box.moveId !== id) notFound();

  return (
    <>
      <Link
        href={`/move/${box.moveId}`}
        className="text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        ‹ {box.move.clientName}
      </Link>
      <BoxLogger
        box={{
          id: box.id,
          moveId: box.moveId,
          label: box.label,
          room: box.room,
          category: box.category,
          fragile: box.fragile,
          fillLevel: box.fillLevel,
          notes: box.notes,
        }}
        initialPhotos={box.photos.map((p) => ({ id: p.id, url: p.url }))}
        initialItems={box.items.map((it) => ({ id: it.id, text: it.text }))}
      />
    </>
  );
}
