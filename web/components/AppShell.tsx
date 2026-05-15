import Link from "next/link";
import { apiBase } from "@/lib/api";
import { NavLinks } from "./NavLinks";

export function AppShell({ children }: { children: React.ReactNode }) {
  const demoUrl = `${apiBase}/demo/`;

  return (
    <div className="relative flex min-h-full flex-col bg-zinc-950 text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.15),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        aria-hidden
      />

      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-3">
          <Link href="/sessions" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white shadow-lg shadow-violet-900/30">
              UA
            </span>
            <div>
              <span className="block text-base font-semibold tracking-tight text-white group-hover:text-violet-200">
                User analytics
              </span>
              <span className="block text-xs text-zinc-500">Sessions · journeys · heatmaps</span>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLinks />
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-violet-900/30 transition hover:bg-violet-500 hover:shadow-violet-800/40"
            >
              Open demo ↗
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-zinc-800/80 bg-zinc-950/50 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 text-center text-xs text-zinc-500 sm:flex-row sm:justify-between sm:text-left">
          <span>API endpoint</span>
          <code className="max-w-full truncate rounded-md bg-zinc-900 px-2 py-1 font-mono text-[11px] text-zinc-400">
            {apiBase}
          </code>
        </div>
      </footer>
    </div>
  );
}
