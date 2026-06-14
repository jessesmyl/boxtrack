"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ROOMS, CATEGORIES, FILL_LEVELS } from "@/lib/constants";
import { boxName } from "@/lib/box";
import { btnPrimary, btnDanger } from "@/lib/ui";

type BoxState = {
  id: string;
  moveId: string;
  label: number;
  room: string | null;
  category: string | null;
  fragile: boolean;
  fillLevel: string | null;
  notes: string | null;
};

type Photo = { id: string; url: string };
type Item = { id: string; text: string };

export default function BoxLogger({
  box,
  initialPhotos,
  initialItems,
}: {
  box: BoxState;
  initialPhotos: Photo[];
  initialItems: Item[];
}) {
  const router = useRouter();
  const [room, setRoom] = useState(box.room);
  const [category, setCategory] = useState(box.category);
  const [fragile, setFragile] = useState(box.fragile);
  const [fillLevel, setFillLevel] = useState(box.fillLevel);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [listening, setListening] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  function flashSaved() {
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  }

  async function save(patch: Partial<BoxState>) {
    setStatus("saving");
    await fetch(`/api/boxes/${box.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    flashSaved();
  }

  function pickRoom(r: string) {
    const next = room === r ? null : r;
    setRoom(next);
    save({ room: next });
  }
  function pickCategory(c: string) {
    const next = category === c ? null : c;
    setCategory(next);
    save({ category: next });
  }
  function toggleFragile() {
    const next = !fragile;
    setFragile(next);
    save({ fragile: next });
  }
  function pickFill(f: string) {
    const next = fillLevel === f ? null : f;
    setFillLevel(next);
    save({ fillLevel: next });
  }

  async function addItem(text: string) {
    const t = text.trim();
    if (!t) return;
    setStatus("saving");
    const res = await fetch(`/api/boxes/${box.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: t }),
    });
    const item = await res.json();
    setItems((prev) => [...prev, item]);
    setDraft("");
    flashSaved();
  }

  async function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/items/${id}`, { method: "DELETE" });
  }

  async function shrink(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const max = 1280;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.8);
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const dataUrl = await shrink(file);
    const res = await fetch(`/api/boxes/${box.id}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const photo = await res.json();
    setPhotos((p) => [...p, photo]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function startVoice() {
    // Tapping the mic while it's already listening stops it.
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const SR =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice needs Chrome or Safari on the phone.");
      return;
    }
    // Web Speech only runs in a secure context. localhost is exempt, but a phone
    // hitting this over http://<LAN-ip> is not — surface that instead of failing silently.
    if (!window.isSecureContext) {
      alert(
        "Voice input needs a secure (https) connection. Over Wi-Fi on plain http it's blocked by the browser, so type the item instead.",
      );
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new (SR as any)();
    recRef.current = rec;
    rec.lang = "en-US";
    rec.continuous = true; // keep listening so several items can be spoken in a row
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (ev: any) => {
      // Only handle results new since the last event, and only final ones.
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) addItem(ev.results[i][0].transcript);
      }
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (ev: any) => {
      setListening(false);
      if (ev?.error === "not-allowed" || ev?.error === "service-not-allowed") {
        alert("Microphone access was blocked. Allow mic permission for this site and try again.");
      } else if (ev?.error && ev.error !== "aborted" && ev.error !== "no-speech") {
        alert(`Voice input error: ${ev.error}`);
      }
    };
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  async function removeBox() {
    if (!window.confirm(`Delete ${boxName(room, box.label)}? This cannot be undone.`))
      return;
    await fetch(`/api/boxes/${box.id}`, { method: "DELETE" });
    router.push(`/move/${box.moveId}`);
  }

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between border-b border-slate-200 bg-[var(--background)]/90 px-4 py-3 backdrop-blur">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {boxName(room, box.label)}
        </h1>
        <span
          className={`text-sm font-semibold ${
            status === "saved" ? "text-green-600" : "text-slate-400"
          }`}
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "✓ Saved" : ""}
        </span>
      </div>

      <Card icon="🏠" title="Which room?">
        <Chips options={[...ROOMS]} selected={room} onPick={pickRoom} />
      </Card>

      <Card icon="📦" title="What's inside?">
        <Chips options={[...CATEGORIES]} selected={category} onPick={pickCategory} />
      </Card>

      <Card icon="📝" title="Items in this box">
        {items.length > 0 && (
          <ul className="mb-3 space-y-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2.5"
              >
                <span className="text-base text-slate-800">{it.text}</span>
                <button
                  onClick={() => removeItem(it.id)}
                  className="ml-3 shrink-0 text-2xl leading-none text-slate-400 hover:text-red-500"
                  aria-label="Remove item"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mb-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem(draft);
            }}
            placeholder="Add an item…"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={() => addItem(draft)}
            disabled={!draft.trim()}
            className={`${btnPrimary} shrink-0 px-5 py-3 text-base`}
          >
            Add
          </button>
        </div>

        <button
          onClick={startVoice}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold transition ${
            listening
              ? "bg-red-500 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {listening ? "● Listening… say an item" : "🎤 Speak to add an item"}
        </button>
      </Card>

      <Card icon="📷" title="Photo">
        <div className="flex flex-wrap gap-3">
          {photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.url}
              alt="box"
              className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
            />
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            <span className="text-3xl">{uploading ? "…" : "📷"}</span>
            <span className="text-xs font-semibold">{uploading ? "Saving" : "Add"}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPhoto}
            className="hidden"
          />
        </div>
      </Card>

      <Card icon="📏" title="How full?">
        <div className="grid grid-cols-4 gap-2">
          {FILL_LEVELS.map((f) => (
            <button
              key={f.value}
              onClick={() => pickFill(f.value)}
              className={`rounded-xl py-3.5 text-lg font-bold transition-colors ${
                fillLevel === f.value
                  ? "bg-brand text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      <button
        onClick={toggleFragile}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold transition ${
          fragile
            ? "bg-red-500 text-white"
            : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        {fragile ? "⚠ Marked fragile" : "Mark fragile"}
      </button>

      <button onClick={removeBox} className={`${btnDanger} mt-6 w-full py-3 text-base`}>
        🗑 Delete box
      </button>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
        {icon && <span className="text-lg">{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Chips({
  options,
  selected,
  onPick,
}: {
  options: string[];
  selected: string | null;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected === o;
        return (
          <button
            key={o}
            onClick={() => onPick(o)}
            className={`rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${
              active
                ? "bg-brand text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {active && "✓ "}
            {o}
          </button>
        );
      })}
    </div>
  );
}
