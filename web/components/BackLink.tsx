import Link from "next/link";
import { cn } from "@/lib/cn";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 transition",
        "hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-sm",
      )}
    >
      <span className="transition group-hover:-translate-x-0.5" aria-hidden>
        ←
      </span>
      {children}
    </Link>
  );
}
