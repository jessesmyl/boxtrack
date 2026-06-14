"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { boxName } from "@/lib/box";
import { Logo } from "../../Brand";
import type { Market } from "@/lib/brand";

type Box = {
  id: string;
  label: number;
  room: string | null;
  category: string | null;
  fragile: boolean;
  items: string[];
  photos: string[];
};

export default function ClientInventory({
  moveId,
  clientName,
  market,
  boxes,
  highlightBoxId,
}: {
  moveId: string;
  clientName: string;
  market: Market;
  boxes: Box[];
  highlightBoxId: string | null;
}) {
  const [q, setQ] = useState("");
  const highlightRef = useRef<HTMLLIElement | null>(null);

  const fragileCount = useMemo(() => boxes.filter((b) => b.fragile).length, [boxes]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return boxes;
    return boxes.filter((b) =>
      [b.room, b.category, `box ${b.label}`, ...b.items]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(term))
    );
  }, [q, boxes]);

  const byRoom = useMemo(() => {
    const map = new Map<string, Box[]>();
    for (const b of filtered) {
      const key = b.room || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return [...map.entries()];
  }, [filtered]);

  // Arrived via a box scan → scroll the highlighted box into view.
  useEffect(() => {
    if (highlightBoxId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightBoxId]);

  const scannedBox = highlightBoxId
    ? boxes.find((b) => b.id === highlightBoxId)
    : undefined;

  return (
    <div className="rise" style={{ ["--accent" as string]: market.accent }}>
      {/* Branded header */}
      <header className="mb-5 flex items-center gap-3">
        <Logo size={46} color={market.accent} />
        <div className="min-w-0">
          <div
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: market.accent }}
          >
            {market.company}
          </div>
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
            {clientName}
          </h1>
          <p className="text-sm text-slate-500">
            {boxes.length} box{boxes.length === 1 ? "" : "es"}
            {fragileCount > 0 && ` · ${fragileCount} fragile`}
          </p>
        </div>
      </header>

      {/* Scanned-box banner */}
      {scannedBox && (
        <div
          className="mb-4 flex items-center gap-3 rounded-2xl border p-4"
          style={{ borderColor: market.accent, background: market.accentSoft }}
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-base font-bold text-white"
            style={{ background: market.accent }}
          >
            {scannedBox.label}
          </span>
          <div className="text-sm">
            <span className="font-bold text-slate-900">
              {boxName(scannedBox.room, scannedBox.label)}
            </span>
            <span className="block text-slate-600">Showing what&apos;s inside this box.</span>
          </div>
        </div>
      )}

      {/* Sticky search */}
      <div className="sticky top-0 z-10 -mx-4 mb-5 bg-[var(--background)]/90 px-4 py-2 backdrop-blur">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍  Search for an item, room or box…"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:ring-2"
          style={{
            // accent focus ring/border via inline so it tracks the market
            ["--tw-ring-color" as string]: market.accentSoft,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = market.accent)}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
        />
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          {boxes.length === 0 ? "No boxes logged yet." : "No matches found."}
        </p>
      )}

      {byRoom.map(([room, items]) => (
        <section key={room} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {room} · {items.length}
          </h2>
          <ul className="space-y-2.5">
            {items.map((b) => {
              const isHit = b.id === highlightBoxId;
              return (
                <li
                  key={b.id}
                  ref={isHit ? highlightRef : undefined}
                  className={`rounded-2xl border bg-white p-4 shadow-sm ${
                    isHit ? "pulse-ring" : "border-slate-200"
                  }`}
                  style={isHit ? { borderColor: market.accent } : undefined}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-base font-bold text-white"
                      style={{ background: market.accent }}
                    >
                      {b.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900">
                        {boxName(b.room, b.label)}
                        {b.fragile && (
                          <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">
                            FRAGILE
                          </span>
                        )}
                      </div>
                      {b.category && (
                        <div className="text-sm text-slate-500">{b.category}</div>
                      )}
                    </div>
                  </div>

                  {b.items.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {b.items.map((text, i) => (
                        <li key={i} className="flex gap-2 text-base text-slate-700">
                          <span className="text-slate-300">•</span>
                          {text}
                        </li>
                      ))}
                    </ul>
                  )}

                  {b.photos.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {b.photos.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={url}
                          src={url}
                          alt=""
                          className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 object-cover"
                        />
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* Discreet crew shortcut — only when arrived via a box scan. Clients ignore it. */}
      {scannedBox && (
        <div className="mt-8 border-t border-slate-200 pt-4 text-center">
          <Link
            href={`/move/${moveId}/log/${scannedBox.id}`}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            Crew · log this box →
          </Link>
        </div>
      )}

      <footer className="mt-10 text-center text-xs text-slate-400">
        {market.company} · {market.region}
      </footer>
    </div>
  );
}
