import Link from "next/link";
import { fetchSessions } from "@/lib/api";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function SessionsPage() {
  let rows: Awaited<ReturnType<typeof fetchSessions>> = [];
  let error: string | null = null;
  try {
    rows = await fetchSessions();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load sessions";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Sessions</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Each row is a browser session (localStorage UUID). Open a session to see the ordered event journey.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <p className="font-medium">Could not reach the API</p>
          <p className="mt-1 text-amber-200/80">{error}</p>
          <p className="mt-2 text-xs text-amber-200/60">
            Ensure the server is running and set <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_API_BASE</code> in{" "}
            <code className="rounded bg-black/30 px-1">web/.env.local</code> if needed.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center text-zinc-400">
          No sessions yet. Send events from the demo page, then refresh.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Events</th>
                  <th className="px-4 py-3">First seen</th>
                  <th className="px-4 py-3">Last seen</th>
                  <th className="px-4 py-3 text-right"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {rows.map((r) => (
                  <tr key={r.session_id} className="transition hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-violet-300 sm:text-sm">
                      <span className="line-clamp-1 max-w-[200px] sm:max-w-xs" title={r.session_id}>
                        {r.session_id}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-200">{r.event_count}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatDate(r.first_seen)}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatDate(r.last_seen)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/sessions/${encodeURIComponent(r.session_id)}`}
                        className="inline-flex rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500"
                      >
                        Journey
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
