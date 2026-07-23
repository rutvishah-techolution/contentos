"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  {
    href: "/",
    label: "Campaigns",
    match: (p: string) => p === "/" || p.startsWith("/campaigns"),
    icon: (
      <path d="M3 4.5h10M3 8h10M3 11.5h6" strokeWidth="1.4" strokeLinecap="round" />
    ),
  },
  {
    href: "/news",
    label: "News",
    match: (p: string) => p.startsWith("/news"),
    icon: (
      <>
        <path d="M3 5.5h7v7H3z" strokeWidth="1.4" strokeLinejoin="round" />
        <path
          d="M10 7h2.5A1.5 1.5 0 0 1 14 8.5v2.5a1.5 1.5 0 0 1-3 0V5"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M4.5 7.5h4M4.5 9.5h4M4.5 11h2.5" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
  },
  {
    href: "/workspace",
    label: "Workspace",
    match: (p: string) => p.startsWith("/workspace"),
    icon: (
      <>
        <rect x="2.5" y="2.5" width="4.5" height="11" rx="1" strokeWidth="1.4" />
        <rect x="9" y="2.5" width="4.5" height="6" rx="1" strokeWidth="1.4" />
      </>
    ),
  },
  {
    href: "/knowledge",
    label: "Knowledge base",
    match: (p: string) => p.startsWith("/knowledge"),
    icon: (
      <path
        d="M3 3.5A1.5 1.5 0 0 1 4.5 2H13v12H4.5A1.5 1.5 0 0 1 3 12.5v-9Z M13 11H4.5A1.5 1.5 0 0 0 3 12.5"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function Sidebar({
  personaCount,
  userName,
}: {
  personaCount: number;
  userName?: string;
}) {
  const pathname = usePathname() || "/";

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
        <span className="h-2.5 w-2.5 rounded-sm bg-fg" />
        <span className="text-[15px] font-semibold tracking-tight text-fg">
          ContentOS
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-surface-2 font-medium text-fg"
                  : "text-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                className="shrink-0"
              >
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3">
        {userName && (
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-fg">
              {userName.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-fg">{userName}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Log out"
              className="shrink-0 text-xs text-faint hover:text-fg"
            >
              Log out
            </button>
          </div>
        )}
        <div className="px-2 pt-2 text-xs text-faint">
          {personaCount} research personas · V1
        </div>
      </div>
    </aside>
  );
}
