import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// The QR sticker printed on every box points here (/b/<boxId>). Scanning it
// drops the customer into their full move inventory with this box highlighted.
// Crew who scan during packing get a discreet "log this box" link there.
export default async function BoxScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const box = await prisma.box.findUnique({
    where: { id },
    select: { moveId: true },
  });
  if (!box) notFound();

  redirect(`/c/${box.moveId}?box=${id}`);
}
