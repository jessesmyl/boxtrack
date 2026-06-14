"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ChartIcon, PlusIcon } from "./icons";
import { isBareRoute } from "./TopHeader";

export function BottomNav() {
  const pathname = usePathname();
  if (isBareRoute(pathname)) return null;

  const homeActive = pathname === "/";
  const dataActive = pathname.startsWith("/dashboard");

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-md items-stretch px-6">
        <Link
          href="/"
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${
            homeActive ? "text-brand" : "text-slate-400"
          }`}
        >
          <HomeIcon className="h-6 w-6" />
          Moves
        </Link>

        <div className="w-16 shrink-0" aria-hidden />

        <Link
          href="/dashboard"
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${
            dataActive ? "text-brand" : "text-slate-400"
          }`}
        >
          <ChartIcon className="h-6 w-6" />
          Data
        </Link>

        {/* Center create button → opens the New move form on home */}
        <Link
          href="/?new=1"
          aria-label="New move"
          className="absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-white shadow-lg shadow-blue-600/30 ring-4 ring-[var(--background)] transition active:scale-95"
        >
          <PlusIcon className="h-6 w-6" />
        </Link>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
