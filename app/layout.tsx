import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TopHeader } from "./components/TopHeader";
import { BottomNav } from "./components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fast Track · BoxTrack",
  description: "Box inventory & move tracking",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full">
        <TopHeader />
        <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
