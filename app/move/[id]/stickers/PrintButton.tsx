"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
    >
      Print
    </button>
  );
}
