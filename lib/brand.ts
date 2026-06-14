// One app, two markets. Every Move carries a `market` and the whole
// client-facing experience (name, region, accent colour) is derived from it.
// Ops chrome stays brand-blue for consistency; the accent differentiates
// the two businesses on client pages, badges and stickers.

export type MarketId = "AB" | "ON";

export type Market = {
  id: MarketId;
  company: string; // full business name
  short: string; // wordmark suffix after "Fast Track"
  region: string; // human region label
  accent: string; // primary accent hex
  accentSoft: string; // soft bg for chips/badges
  accentText: string; // text colour on soft bg
};

export const MARKETS: Record<MarketId, Market> = {
  AB: {
    id: "AB",
    company: "Fast Track Movers",
    short: "Movers",
    region: "Alberta",
    accent: "#2563eb", // brand blue
    accentSoft: "#eff6ff",
    accentText: "#1d4ed8",
  },
  ON: {
    id: "ON",
    company: "Fast Track Muskoka",
    short: "Muskoka",
    region: "Muskoka, Ontario",
    accent: "#0d9488", // lake-country teal
    accentSoft: "#f0fdfa",
    accentText: "#0f766e",
  },
};

export const MARKET_LIST: Market[] = [MARKETS.ON, MARKETS.AB];

export function getMarket(id: string | null | undefined): Market {
  return MARKETS[(id as MarketId) ?? "ON"] ?? MARKETS.ON;
}
