import Link from "next/link";
import { fetchSessionEvents } from "@/lib/api";

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function SessionJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionId = decodeURIComponent(id);

  let events: Awaited<ReturnType<typeof fetchSessionEvents>> = [];
  let error: string | null = null;
  try {
    events = await fetchSessionEvents(sessionId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load events";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/sessions" className="text-sm font-medium text-violet-400 hover:text-violet-300">
            ← Sessions
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Journey</h1>
          <p className="mt-1 font-mono text-xs text-zinc-500 break-all sm:text-sm">{sessionId}</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
      ) : events.length === 0 ? (
        <p className="text-zinc-400">No events for this session.</p>
      ) : (
        <ol className="relative space-y-0 border-l border-zinc-800 pl-6">
          {events.map((ev, i) => (
            <li key={ev._id} className="pb-8 last:pb-0">
              <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-violet-500 ring-4 ring-zinc-950" />
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={
                    ev.type === "click"
                      ? "rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200"
                      : "rounded-md bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-200"
                  }
                >
                  {ev.type}
                </span>
                <span className="text-xs text-zinc-500">{formatTime(ev.timestamp)}</span>
              </div>
              <p className="mt-2 font-mono text-xs text-zinc-400 break-all sm:text-sm">{ev.page_url}</p>
              {ev.type === "click" && ev.x != null && ev.y != null && (
                <p className="mt-1 text-xs text-zinc-500">
                  page ({ev.x}, {ev.y}) · doc {ev.document_width}×{ev.document_height}
                </p>
              )}
              {i < events.length - 1 && <div className="mt-4 h-px w-full bg-zinc-800/60" />}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
