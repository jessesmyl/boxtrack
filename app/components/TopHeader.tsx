"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "../Brand";

// Operator chrome is hidden on the client side (/c/*) and the box-scan
// redirect (/b/*), which customers see on their own phones.
export function isBareRoute(pathname: string) {
  return (
    pathname.startsWith("/c/") ||
    pathname.startsWith("/b/") ||
    /\/home$/.test(pathname)
  );
}

export function TopHeader() {
  const pathname = usePathname();
  if (isBareRoute(pathname)) return null;
  return (
    <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
      <Link href="/">
        <Wordmark />
      </Link>
    </header>
  );
}
