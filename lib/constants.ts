// Tap-only options. No typing in the field flow keeps box logging to ~5 seconds.

export const ROOMS = [
  "Kitchen",
  "Living Room",
  "Master Bed",
  "Bedroom",
  "Bathroom",
  "Office",
  "Garage",
  "Basement",
  "Dining",
  "Other",
] as const;

export const CATEGORIES = [
  "Kitchen",
  "Books",
  "Clothes",
  "Electronics",
  "Decor",
  "Toys",
  "Tools",
  "Garage",
  "Misc",
] as const;

export const FILL_LEVELS = [
  { value: "quarter", label: "¼" },
  { value: "half", label: "½" },
  { value: "threequarter", label: "¾" },
  { value: "full", label: "Full" },
] as const;

export const HOME_SIZES = ["1-bed", "2-bed", "3-bed", "4-bed+", "Office"] as const;
