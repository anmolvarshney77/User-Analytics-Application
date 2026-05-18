import { AlertBanner } from "@/components/AlertBanner";
import { BackLink } from "@/components/BackLink";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
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
        <BackLink href="/sessions">Back to sessions</BackLink>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">Session journey</h1>
        <p className="mt-2 break-all font-mono text-xs text-zinc-500 sm:text-sm">{sessionId}</p>
      </div>

      {error ? (
        <AlertBanner variant="error" title="Failed to load events">
          <p>{error}</p>
        </AlertBanner>
      ) : events.length === 0 ? (
        <EmptyState title="No events for this session" className="px-6 py-12">
          <p className="text-sm text-zinc-500">This session has no recorded events yet.</p>
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Badge variant="sky">
              {pageViews} page view{pageViews !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="amber">
              {clicks} click{clicks !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="default">{events.length} total</Badge>
          </div>

          <ol className="relative space-y-4 border-l-2 border-violet-500/25 pl-8">
            {events.map((ev) => (
              <li key={ev._id} className="relative">
                <span
                  className={`absolute -left-[1.65rem] top-3 h-3 w-3 rounded-full ring-4 ring-zinc-950 ${
                    ev.type === "click" ? "bg-amber-400" : "bg-sky-400"
                  }`}
                  aria-hidden
                />
                <Card className="p-4 transition-colors hover:border-zinc-700/90">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={ev.type === "click" ? "eventClick" : "eventPageView"}
                      uppercase
                    >
                      {ev.type.replace("_", " ")}
                    </Badge>
                    <time className="text-xs text-zinc-500">{formatDateTime(ev.timestamp, "medium")}</time>
                  </div>
                  <p className="mt-2 break-all font-mono text-xs text-zinc-400 sm:text-sm">{ev.page_url}</p>
                  {ev.type === "click" && ev.x != null && ev.y != null && (
                    <p className="mt-2 rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-1.5 font-mono text-xs text-zinc-500">
                      page ({ev.x}, {ev.y}) · document {ev.document_width}×{ev.document_height}
                    </p>
                  )}
                </Card>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
