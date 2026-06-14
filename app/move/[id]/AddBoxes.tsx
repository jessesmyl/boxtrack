"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";

export default function AddBoxes({ moveId }: { moveId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function add(count: number) {
    setBusy(true);
    await fetch(`/api/moves/${moveId}/boxes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-1 gap-3">
      <button
        onClick={() => add(1)}
        disabled={busy}
        className={`${btnPrimary} flex-1 py-3 text-base`}
      >
        + Box
      </button>
      <button
        onClick={() => add(10)}
        disabled={busy}
        className={`${btnPrimary} px-5 py-3 text-base`}
      >
        +10
      </button>
    </div>
  );
}
