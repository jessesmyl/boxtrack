"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HOME_SIZES } from "@/lib/constants";
import { MARKET_LIST } from "@/lib/brand";
import { btnPrimary } from "@/lib/ui";

export default function NewMove() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [market, setMarket] = useState<string>("ON");
  const [homeSize, setHomeSize] = useState("");
  const [saving, setSaving] = useState(false);

  // The bottom-nav "+" links to /?new=1 — open the form when that's present.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setOpen(true);
    }
  }, []);

  async function create() {
    if (!clientName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/moves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName, homeSize, market }),
    });
    const move = await res.json();
    router.push(`/move/${move.id}`);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={`${btnPrimary} w-full py-4 text-base`}>
        + New move
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label className="mb-1.5 block text-sm font-semibold text-slate-600">Market</label>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {MARKET_LIST.map((m) => {
          const active = market === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMarket(m.id)}
              className="rounded-xl border px-4 py-3 text-left transition-colors"
              style={
                active
                  ? { borderColor: m.accent, background: m.accentSoft }
                  : { borderColor: "#cbd5e1", background: "#fff" }
              }
            >
              <span
                className="block text-base font-bold"
                style={{ color: active ? m.accentText : "#334155" }}
              >
                {m.company}
              </span>
              <span className="block text-xs text-slate-500">{m.region}</span>
            </button>
          );
        })}
      </div>

      <label className="mb-1.5 block text-sm font-semibold text-slate-600">Client name</label>
      <input
        autoFocus
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        placeholder="e.g. The Smiths"
        className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
      />

      <label className="mb-1.5 block text-sm font-semibold text-slate-600">Home size</label>
      <div className="mb-5 flex flex-wrap gap-2">
        {HOME_SIZES.map((s) => (
          <button
            key={s}
            onClick={() => setHomeSize(homeSize === s ? "" : s)}
            className={`rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${
              homeSize === s
                ? "bg-brand text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={create}
          disabled={!clientName.trim() || saving}
          className={`${btnPrimary} flex-1 py-3 text-base`}
        >
          {saving ? "Creating…" : "Create move"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-xl px-5 py-3 text-base font-semibold text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
