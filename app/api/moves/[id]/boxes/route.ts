import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newBoxId } from "@/lib/ids";

// Create one or more empty boxes for a move (count defaults to 1).
// Boxes are created blank and filled in later when the sticker is scanned.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: moveId } = await params;
  const body = await req.json().catch(() => ({}));
  const count = Math.min(Math.max(Number(body.count) || 1, 1), 100);

  const last = await prisma.box.findFirst({
    where: { moveId },
    orderBy: { label: "desc" },
  });
  let label = (last?.label ?? 0) + 1;

  const created = [];
  for (let i = 0; i < count; i++) {
    const box = await prisma.box.create({
      data: { id: newBoxId(), moveId, label: label++ },
    });
    created.push(box);
  }
  return NextResponse.json(created);
}
