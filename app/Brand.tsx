import { getMarket, type Market } from "@/lib/brand";

// Default company name (ops chrome). Client pages pass an explicit market.
export const COMPANY = "Fast Track";

// Logo mark — box glyph in a solid tile. Colour follows the market accent
// (defaults to brand blue for ops chrome).
export function Logo({ size = 28, color }: { size?: number; color?: string }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg text-white"
      style={{ width: size, height: size, background: color ?? "var(--brand)" }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
        <path d="M3 7.5 12 12l9-4.5" />
        <path d="M12 12v9" />
      </svg>
    </span>
  );
}

// Ops wordmark — neutral "Fast Track" with a blue accent. Used in the top header.
export function Wordmark() {
  return (
    <span className="flex items-center gap-2 font-semibold text-slate-900">
      <Logo size={28} />
      Fast Track <span className="text-brand">Ops</span>
    </span>
  );
}

// Market wordmark — full branded name in that market's accent colour.
// Used on client pages and stickers.
export function MarketWordmark({
  market,
  size = 28,
}: {
  market: Market | string;
  size?: number;
}) {
  const m = typeof market === "string" ? getMarket(market) : market;
  return (
    <span className="flex items-center gap-2 font-semibold text-slate-900">
      <Logo size={size} color={m.accent} />
      <span>
        Fast Track <span style={{ color: m.accent }}>{m.short}</span>
      </span>
    </span>
  );
}
