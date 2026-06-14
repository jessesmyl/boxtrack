import { customAlphabet } from "nanoid";

// Unambiguous alphabet (no 0/O/1/I/L) so a box id is easy to read off a sticker.
export const newBoxId = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 7);
