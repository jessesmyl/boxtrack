import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const box = await prisma.box.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { createdAt: "asc" } },
      items: { orderBy: { createdAt: "asc" } },
      move: true,
    },
  });
  if (!box) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(box);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["room", "category", "fragile", "fillLevel", "notes"]) {
    if (key in body) data[key] = body[key];
  }
  const box = await prisma.box.update({ where: { id }, data });
  return NextResponse.json(box);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photos = await prisma.photo.findMany({
    where: { boxId: id },
    select: { url: true },
  });
  await Promise.all(
    photos.map(async (p) => {
      try {
        await unlink(path.join(process.cwd(), "public", p.url));
      } catch {
        // already gone — ignore
      }
    })
  );
  await prisma.box.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
