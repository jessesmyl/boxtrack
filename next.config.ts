import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to accept cross-origin requests when the app is reached
  // through a Cloudflare quick tunnel (for phone access / Web Speech over https)
  // or directly via the machine's LAN IP. Quick-tunnel subdomains change each
  // session, so the wildcard keeps working without edits.
  allowedDevOrigins: ["*.trycloudflare.com", "192.168.68.66", "192.168.68.68"],
};

export default nextConfig;
