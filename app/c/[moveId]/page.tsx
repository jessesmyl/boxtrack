import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMarket } from "@/lib/brand";
import ClientInventory from "./ClientInventory";

export const dynamic = "force-dynamic";

// CLIENT SIDE — read-only inventory a customer opens on their phone.
// Reached directly via a share link, or by scanning a box QR (which lands
// here with ?box=<boxId> so we can highlight and scroll to that box).
export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ moveId: string }>;
  searchParams: Promise<{ box?: string }>;
}) {
  const { moveId } = await params;
  const { box: highlightBoxId } = await searchParams;

  const move = await prisma.move.findUnique({
    where: { id: moveId },
    include: {
      boxes: {
        orderBy: { label: "asc" },
        include: {
          items: { orderBy: { createdAt: "asc" } },
          photos: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
  if (!move) notFound();

  const market = getMarket(move.market);

  const boxes = move.boxes.map((b) => ({
    id: b.id,
    label: b.label,
    room: b.room,
    category: b.category,
    fragile: b.fragile,
    items: b.items.map((it) => it.text),
    photos: b.photos.map((p) => p.url),
  }));

  return (
    <ClientInventory
      moveId={move.id}
      clientName={move.clientName}
      market={market}
      boxes={boxes}
      highlightBoxId={highlightBoxId ?? null}
    />
  );
}
