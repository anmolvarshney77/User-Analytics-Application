import Link from "next/link";
import { AlertBanner } from "@/components/AlertBanner";
import { DemoLink } from "@/components/DemoLink";
import { DemoWalkthrough } from "@/components/DemoWalkthrough";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { fetchSessions } from "@/lib/api";
import { errorMessage, formatDateTime } from "@/lib/format";
import { healthUrl } from "@/lib/urls";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-white">{value}</p>
    </div>
  );
}

export default async function SessionsPage() {
  let rows: Awaited<ReturnType<typeof fetchSessions>> = [];
  let error: string | null = null;
  try {
    rows = await fetchSessions();
  } catch (e) {
    error = errorMessage(e, "Could not load sessions");
  }

  const totalEvents = rows.reduce((sum, r) => sum + r.event_count, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sessions"
        description="Each row is a browser session (localStorage UUID). Open a session to see the ordered event journey."
      />

      <DemoWalkthrough />

      {error ? (
        <AlertBanner variant="warning" title="Could not reach the API">
          <p>{error}</p>
          <p className="text-xs opacity-80">
            On Render free tier, wait 1–2 minutes and refresh. Wake the API first:{" "}
            <a href={healthUrl} className="underline" target="_blank" rel="noreferrer">
              /health
            </a>
          </p>
        </AlertBanner>
      ) : rows.length === 0 ? (
        <EmptyState>
          <p className="text-5xl opacity-40" aria-hidden>
            ◉
          </p>
          <p className="max-w-md text-zinc-400">
            No sessions yet. Use <strong className="text-zinc-200">Open demo</strong> above, click around, then refresh
            this page.
          </p>
          <DemoLink variant="button" label="Open demo page ↗" className="px-4 py-2.5" />
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Sessions" value={rows.length} />
            <StatCard label="Total events" value={totalEvents} />
            <StatCard
              label="Latest activity"
              value={rows[0] ? formatDateTime(rows[0].last_seen) : "—"}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-xl shadow-black/30">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/90 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3.5">Session</th>
                    <th className="px-4 py-3.5">Events</th>
                    <th className="px-4 py-3.5">First seen</th>
                    <th className="px-4 py-3.5">Last seen</th>
                    <th className="px-4 py-3.5 text-right"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {rows.map((r) => (
                    <tr key={r.session_id} className="transition hover:bg-violet-500/5">
                      <td className="px-4 py-3.5">
                        <span
                          className="line-clamp-1 max-w-[200px] font-mono text-xs text-violet-300 sm:max-w-xs sm:text-sm"
                          title={r.session_id}
                        >
                          {r.session_id}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold tabular-nums text-zinc-200">
                          {r.event_count}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-400">{formatDateTime(r.first_seen)}</td>
                      <td className="px-4 py-3.5 text-zinc-400">{formatDateTime(r.last_seen)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/sessions/${encodeURIComponent(r.session_id)}`}
                          className="inline-flex rounded-lg bg-violet-600/90 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-violet-500/30 transition hover:bg-violet-500"
                        >
                          Journey →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
