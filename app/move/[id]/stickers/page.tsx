import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { qrDataUrl } from "@/lib/qr";
import { getMarket } from "@/lib/brand";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function StickersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const move = await prisma.move.findUnique({
    where: { id },
    include: { boxes: { orderBy: { label: "asc" } } },
  });
  if (!move) notFound();

  const market = getMarket(move.market);

  const stickers = await Promise.all(
    move.boxes.map(async (b) => ({
      label: b.label,
      id: b.id,
      qr: await qrDataUrl(b.id),
    }))
  );

  return (
    <div className="rise">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link
          href={`/move/${move.id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          ‹ Back
        </Link>
        <PrintButton />
      </div>

      <p className="no-print mb-4 text-sm text-slate-500">
        {stickers.length} stickers for {move.clientName}. Print, cut, and stick one on
        each box. Scanning takes the customer straight to that box in their inventory.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stickers.map((s) => (
          <div
            key={s.id}
            className="flex flex-col items-center rounded-xl border bg-white p-3"
            style={{ borderColor: market.accent }}
          >
            <div
              className="mb-1 w-full rounded-md py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ background: market.accent }}
            >
              {market.company}
            </div>
            <Image
              src={s.qr}
              alt={`QR for box ${s.label}`}
              width={130}
              height={130}
              unoptimized
            />
            <div className="mt-1 text-lg font-bold text-slate-900">Box {s.label}</div>
            <div className="text-xs tracking-widest text-slate-400">{s.id}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase text-slate-500">
              {move.clientName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
