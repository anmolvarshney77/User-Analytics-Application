import { AlertBanner } from "@/components/AlertBanner";
import { BackLink } from "@/components/BackLink";
import { EmptyState } from "@/components/EmptyState";
import { fetchSessionEvents } from "@/lib/api";
import { errorMessage, formatDateTime } from "@/lib/format";

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
    error = errorMessage(e, "Failed to load events");
  }

  const pageViews = events.filter((e) => e.type === "page_view").length;
  const clicks = events.filter((e) => e.type === "click").length;

  return (
    <div className="space-y-8">
      <div>
        <BackLink href="/sessions">← Back to sessions</BackLink>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Session journey</h1>
        <p className="mt-2 break-all font-mono text-xs text-zinc-500 sm:text-sm">{sessionId}</p>
      </div>

      {error ? (
        <AlertBanner variant="error" title="Failed to load events">
          <p>{error}</p>
        </AlertBanner>
      ) : events.length === 0 ? (
        <EmptyState className="px-6 py-12 text-zinc-400">No events for this session.</EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
              {pageViews} page view{pageViews !== 1 ? "s" : ""}
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
              {clicks} click{clicks !== 1 ? "s" : ""}
            </span>
            <span className="rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1 text-xs font-medium text-zinc-400">
              {events.length} total
            </span>
          </div>

          <ol className="relative space-y-4 border-l-2 border-violet-500/30 pl-8">
            {events.map((ev) => (
              <li key={ev._id} className="relative">
                <span
                  className={`absolute -left-[1.65rem] top-3 h-3 w-3 rounded-full ring-4 ring-zinc-950 ${
                    ev.type === "click" ? "bg-amber-400" : "bg-sky-400"
                  }`}
                />
                <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        ev.type === "click"
                          ? "rounded-md bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-200"
                          : "rounded-md bg-sky-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-sky-200"
                      }
                    >
                      {ev.type.replace("_", " ")}
                    </span>
                    <time className="text-xs text-zinc-500">{formatDateTime(ev.timestamp, "medium")}</time>
                  </div>
                  <p className="mt-2 break-all font-mono text-xs text-zinc-400 sm:text-sm">{ev.page_url}</p>
                  {ev.type === "click" && ev.x != null && ev.y != null && (
                    <p className="mt-2 rounded-md bg-zinc-950/60 px-2 py-1.5 font-mono text-xs text-zinc-500">
                      page ({ev.x}, {ev.y}) · document {ev.document_width}×{ev.document_height}
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
