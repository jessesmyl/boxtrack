"use client";

import { useState } from "react";
import { btnPrimary, btnSecondary } from "@/lib/ui";

// Crew-facing: hand a client their read-only inventory in one tap. On a phone
// this opens the native share sheet (Messages / WhatsApp / email); on a laptop
// it falls back to copying the link. The link needs no login — anyone with it
// sees this move's inventory, so it's an unguessable move id by design.
export default function ShareClientLink({
  clientUrl,
  clientName,
  company,
}: {
  clientUrl: string;
  clientName: string;
  company: string;
}) {
  const [copied, setCopied] = useState(false);

  const message = `Hi ${clientName}, here's your live box inventory from ${company}. Search for anything, see photos, and check nothing's missing: ${clientUrl}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(clientUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard needs https or localhost; ignore and let them long-press the field
    }
  }

  async function send() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${company} · ${clientName}`, text: message, url: clientUrl });
        return;
      } catch {
        // user dismissed the share sheet — no-op
        return;
      }
    }
    copy();
  }

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-base font-bold text-slate-800">Share with client</h2>
      <p className="mb-3 text-sm text-slate-500">
        Send the customer a link to their inventory. No app, no login, works on any phone.
      </p>

      <button onClick={send} className={`${btnPrimary} mb-2 w-full py-3 text-base`}>
        📲 Send client their inventory
      </button>

      <div className="flex gap-2">
        <input
          readOnly
          value={clientUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
        />
        <button onClick={copy} className={`${btnSecondary} shrink-0 px-4 py-2.5 text-sm`}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <a
          href={`sms:?&body=${encodeURIComponent(message)}`}
          className={`${btnSecondary} shrink-0 px-4 py-2.5 text-sm`}
        >
          💬 Text
        </a>
      </div>
    </section>
  );
}
