import QRCode from "qrcode";

// Phones scan the sticker, so the encoded URL must be absolute and reachable
// on the same network. Set NEXT_PUBLIC_BASE_URL to your machine's LAN address
// (e.g. http://192.168.1.20:3000) when testing from a phone.
function baseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function boxUrl(id: string) {
  return `${baseUrl()}/b/${id}`;
}

// Absolute link to a client's read-only inventory. This is what crew text or
// hand off to the customer, so it must be the public base URL, not a relative path.
export function clientMoveUrl(moveId: string) {
  return `${baseUrl()}/c/${moveId}`;
}

export async function qrDataUrl(id: string) {
  return QRCode.toDataURL(boxUrl(id), { margin: 1, width: 260 });
}
