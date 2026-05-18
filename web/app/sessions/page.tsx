import { AlertBanner } from "@/components/AlertBanner";
import { DemoLink } from "@/components/DemoLink";
import { DemoWalkthrough } from "@/components/DemoWalkthrough";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { fetchSessions } from "@/lib/api";
import { errorMessage, formatDateTime } from "@/lib/format";
import { healthUrl } from "@/lib/urls";

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
          <p className="text-xs opacity-90">
            On Render free tier, wait 1–2 minutes and refresh. Wake the API first:{" "}
            <a href={healthUrl} target="_blank" rel="noreferrer">
              /health
            </a>
          </p>
        </AlertBanner>
      ) : rows.length === 0 ? (
        <EmptyState title="No sessions yet">
          <p className="max-w-md text-sm text-zinc-400">
            Use <strong className="font-medium text-zinc-200">Open demo</strong> above, click around, then refresh
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

          <Card variant="elevated" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/90 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3.5 font-medium">Session</th>
                    <th className="px-4 py-3.5 font-medium">Events</th>
                    <th className="px-4 py-3.5 font-medium">First seen</th>
                    <th className="px-4 py-3.5 font-medium">Last seen</th>
                    <th className="px-4 py-3.5 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {rows.map((r) => (
                    <tr key={r.session_id} className="transition-colors hover:bg-violet-500/[0.06]">
                      <td className="px-4 py-3.5">
                        <span
                          className="line-clamp-1 max-w-[200px] font-mono text-xs text-violet-300 sm:max-w-xs sm:text-sm"
                          title={r.session_id}
                        >
                          {r.session_id}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold tabular-nums text-zinc-200 ring-1 ring-zinc-700/50">
                          {r.event_count}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-400">{formatDateTime(r.first_seen)}</td>
                      <td className="px-4 py-3.5 text-zinc-400">{formatDateTime(r.last_seen)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          href={`/sessions/${encodeURIComponent(r.session_id)}`}
                          variant="compact"
                          size="sm"
                        >
                          Journey →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
