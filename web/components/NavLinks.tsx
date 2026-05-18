"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/sessions", label: "Sessions" },
  { href: "/heatmap", label: "Heatmap" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((l) => {
        const active = isActive(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
              active
                ? "bg-violet-600/15 font-semibold text-white ring-1 ring-violet-500/35"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
