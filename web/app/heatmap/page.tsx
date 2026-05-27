"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertBanner } from "@/components/AlertBanner";
import { DemoLink } from "@/components/DemoLink";
import { DemoWalkthrough } from "@/components/DemoWalkthrough";
import { PageHeader } from "@/components/PageHeader";
import { fetchHeatmap, fetchPageUrls, type HeatmapClick } from "@/lib/api";
import { errorMessage } from "@/lib/format";
import { demoUrl } from "@/lib/urls";

function DotPlot({ clicks }: { clicks: HeatmapClick[] }) {
  const aspect = useMemo(() => {
    const valid = clicks.filter((c) => c.document_width > 0 && c.document_height > 0);
    if (!valid.length) return 16 / 10;
    const w = Math.max(...valid.map((c) => c.document_width));
    const h = Math.max(...valid.map((c) => c.document_height));
    return w / h;
  }, [clicks]);

  if (!clicks.length) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 text-center text-sm text-zinc-500">
        <p>No clicks for this URL yet.</p>
        <p className="text-xs text-zinc-600">Generate clicks on the demo page, then refresh.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-xl shadow-black/30">
      <div className="border-b border-zinc-800 px-4 py-3">
        <p className="text-xs text-zinc-500">
          Normalized document space — each dot at (x ÷ width, y ÷ height) for that event&apos;s snapshot.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-500 shadow shadow-fuchsia-500/50" />
            Click
          </span>
          <span className="tabular-nums text-zinc-500">{clicks.length} points</span>
        </div>
      </div>
      <div className="max-h-[70vh] overflow-auto p-4">
        <div
          className="relative mx-auto rounded-lg bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 ring-1 ring-zinc-700/80"
          style={{
            width: "min(960px, 100%)",
            aspectRatio: String(aspect),
          }}
        >
          {clicks.map((c) => {
            const dw = c.document_width > 0 ? c.document_width : 1;
            const dh = c.document_height > 0 ? c.document_height : 1;
            const left = (c.x / dw) * 100;
            const top = (c.y / dh) * 100;
            return (
              <div
                key={c._id}
                title={`${c.x}, ${c.y} · ${new Date(c.timestamp).toLocaleString()}`}
                className="pointer-events-none absolute h-3 w-3 rounded-full bg-fuchsia-500 shadow-lg shadow-fuchsia-500/40 ring-2 ring-fuchsia-300/50"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function HeatmapPage() {
  const [urls, setUrls] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [clicks, setClicks] = useState<HeatmapClick[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [clickTotal, setClickTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchPageUrls()
      .then((u) => {
        setUrls(u);
        setSelected((prev) => prev || u[0] || "");
      })
      .catch(() => setUrls([]));
  }, []);

  const effectiveUrl = customUrl.trim() || selected;

  useEffect(() => {
    let cancelled = false;
    const url = effectiveUrl.trim();

    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!url) {
        setClicks([]);
        setTruncated(false);
        setClickTotal(0);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHeatmap(url);
        if (!cancelled) {
          setClicks(data.clicks);
          setTruncated(data.truncated);
          setClickTotal(data.total);
        }
      } catch (e) {
        if (!cancelled) {
          setError(errorMessage(e, "Load failed"));
          setClicks([]);
          setTruncated(false);
          setClickTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [effectiveUrl, refreshKey]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Heatmap"
        description="Aggregate click positions for a page URL. Coordinates use pageX/pageY normalized by each event's document size."
      />

      <DemoWalkthrough />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="known-url" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Known URLs
            </label>
            <select
              id="known-url"
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setCustomUrl("");
              }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25"
            >
              <option value="">— Select —</option>
              {urls.map((u) => (
                <option key={u} value={u}>
                  {u.length > 80 ? `${u.slice(0, 80)}…` : u}
                </option>
              ))}
            </select>
            {urls.length === 0 && (
              <p className="text-xs text-zinc-600">
                No URLs yet. Try <DemoLink variant="inline" label={demoUrl} />
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="custom-url" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Or paste exact URL
            </label>
            <input
              id="custom-url"
              type="url"
              placeholder={demoUrl}
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading || !effectiveUrl.trim()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading…" : "Refresh heatmap"}
          </button>
        </div>
      </div>

      {error ? (
        <AlertBanner variant="error" title="Could not load heatmap">
          <p>{error}</p>
        </AlertBanner>
      ) : null}

      {truncated ? (
        <AlertBanner variant="warning" title="Showing a sample of clicks">
          <p>
            Loaded {clicks.length} of {clickTotal} clicks (server cap). Narrow with a date filter via API{" "}
            <code className="text-xs">?since=ISO</code> if you add UI later.
          </p>
        </AlertBanner>
      ) : null}

      {loading && !clicks.length ? (
        <div className="flex min-h-[280px] animate-pulse items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-500">
          Loading heatmap…
        </div>
      ) : (
        <DotPlot clicks={clicks} />
      )}
    </div>
  );
}
