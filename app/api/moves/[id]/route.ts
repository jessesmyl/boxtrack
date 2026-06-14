import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

async function removePhotoFiles(urls: string[]) {
  await Promise.all(
    urls.map(async (u) => {
      try {
        await unlink(path.join(process.cwd(), "public", u));
      } catch {
        // file already gone — ignore
      }
    })
  );
}

// Edit a move (rename, change home size, mark complete/active).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["clientName", "homeSize", "status", "fromAddr", "toAddr"]) {
    if (key in body) data[key] = body[key];
  }
  const move = await prisma.move.update({ where: { id }, data });
  return NextResponse.json(move);
}

// Delete a move and everything under it (boxes + photos cascade in the DB;
// we also unlink the photo files from disk).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photos = await prisma.photo.findMany({
    where: { box: { moveId: id } },
    select: { url: true },
  });
  await removePhotoFiles(photos.map((p) => p.url));
  await prisma.move.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
