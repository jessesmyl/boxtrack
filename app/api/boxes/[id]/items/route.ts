import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Add one item to a box's contents list.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boxId } = await params;
  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  const item = await prisma.item.create({
    data: { boxId, text: text.trim() },
  });
  return NextResponse.json(item);
}
