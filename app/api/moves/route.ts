import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const moves = await prisma.move.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { boxes: true } } },
  });
  return NextResponse.json(moves);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.clientName?.trim()) {
    return NextResponse.json({ error: "clientName required" }, { status: 400 });
  }
  const move = await prisma.move.create({
    data: {
      clientName: body.clientName.trim(),
      market: body.market === "AB" ? "AB" : "ON",
      fromAddr: body.fromAddr || null,
      toAddr: body.toAddr || null,
      homeSize: body.homeSize || null,
      moveDate: body.moveDate ? new Date(body.moveDate) : null,
    },
  });
  return NextResponse.json(move);
}
