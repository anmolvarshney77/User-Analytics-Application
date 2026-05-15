"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/sessions", label: "Sessions", match: (p: string) => p === "/sessions" || p.startsWith("/sessions/") },
  { href: "/heatmap", label: "Heatmap", match: (p: string) => p === "/heatmap" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              active
                ? "rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold text-white ring-1 ring-zinc-700"
                : "rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800/60 hover:text-white"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
