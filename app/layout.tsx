import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentOS",
  description:
    "Autonomous research → storyline → drafting pipeline for B2B campaign content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-fg" />
              <span className="text-[15px] font-semibold tracking-tight">
                ContentOS
              </span>
            </Link>
            <span className="text-xs text-faint">Market Research · V1</span>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
