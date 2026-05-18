import Link from "next/link";
import { apiBase } from "@/lib/api";
import { DemoLink } from "./DemoLink";
import { NavLinks } from "./NavLinks";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col bg-zinc-950 text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.18),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        aria-hidden
      />

      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/75">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-3">
          <Link
            href="/sessions"
            className="group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white shadow-lg shadow-violet-900/35 ring-1 ring-white/10 transition group-hover:shadow-violet-800/40">
              UA
            </span>
            <div>
              <span className="block text-base font-semibold tracking-tight text-white transition group-hover:text-violet-200">
                User analytics
              </span>
              <span className="block text-xs text-zinc-500">Sessions · journeys · heatmaps</span>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main">
            <NavLinks />
            <DemoLink variant="nav" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">{children}</main>

      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/60 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-xs text-zinc-500 sm:flex-row sm:justify-between sm:text-left">
          <span className="font-medium text-zinc-600">API endpoint</span>
          <code className="max-w-full truncate rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 font-mono text-[11px] text-zinc-400">
            {apiBase}
          </code>
        </div>
      </footer>
    </div>
  );
}
