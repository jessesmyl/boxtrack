"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnSecondary, btnDanger } from "@/lib/ui";

export default function MoveActions({
  moveId,
  clientName,
  status,
}: {
  moveId: string;
  clientName: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const completed = status === "completed";

  async function toggleComplete() {
    setBusy(true);
    await fetch(`/api/moves/${moveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: completed ? "active" : "completed" }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (
      !window.confirm(
        `Delete "${clientName}" and all its boxes and photos? This cannot be undone.`
      )
    )
      return;
    setBusy(true);
    await fetch(`/api/moves/${moveId}`, { method: "DELETE" });
    router.push("/");
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-5">
      <button
        onClick={toggleComplete}
        disabled={busy}
        className={`${btnSecondary} mb-3 w-full py-3 text-base`}
      >
        {completed ? "↩ Reopen move" : "✓ Mark move complete"}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className={`${btnDanger} w-full py-3 text-base`}
      >
        🗑 Delete move
      </button>
    </div>
  );
}
