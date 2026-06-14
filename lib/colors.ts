// Stable palette for category segments — assigned by sorted index so the same
// category gets a consistent-ish color within a chart.
export const PALETTE = [
  "#2563eb", // blue
  "#16a34a", // green
  "#f59e0b", // amber
  "#db2777", // pink
  "#7c3aed", // violet
  "#0891b2", // cyan
  "#dc2626", // red
  "#65a30d", // lime
  "#9333ea", // purple
  "#737373", // neutral
];

export function colorAt(index: number) {
  return PALETTE[index % PALETTE.length];
}
