import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

// Accepts a base64 data URL from the camera capture and stores it under
// /public/uploads. Fine for local dev; swap for object storage in production.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { dataUrl } = await req.json();
  if (!dataUrl?.startsWith("data:image")) {
    return NextResponse.json({ error: "image data required" }, { status: 400 });
  }

  const base64 = dataUrl.split(",")[1];
  const buf = Buffer.from(base64, "base64");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const fname = `${id}-${Date.now()}.jpg`;
  await writeFile(path.join(dir, fname), buf);

  const photo = await prisma.photo.create({
    data: { boxId: id, url: `/uploads/${fname}` },
  });
  return NextResponse.json(photo);
}
