import Link from "next/link";
import { apiBase } from "@/lib/api";

const internalLinks = [
  { href: "/sessions", label: "Sessions" },
  { href: "/heatmap", label: "Heatmap" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const demoUrl = `${apiBase}/demo/`;
  return (
    <div className="flex min-h-full flex-col bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-3">
          <Link href="/sessions" className="group flex items-baseline gap-2">
            <span className="rounded-md bg-violet-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
              UA
            </span>
            <span className="text-lg font-semibold tracking-tight text-white group-hover:text-violet-200">
              User analytics
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {internalLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
            >
              Open demo ↗
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        Dashboard reads from <code className="text-zinc-400">{apiBase}</code>
      </footer>
    </div>
  );
}
