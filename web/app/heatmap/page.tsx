"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchHeatmap, fetchPageUrls, type HeatmapClick } from "@/lib/api";

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
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 text-sm text-zinc-500">
        No clicks for this URL yet.
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] w-full overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <p className="mb-3 text-xs text-zinc-500">
        Dots use normalized document space: each point is placed at (x / docWidth, y / docHeight) for its captured
        snapshot, so scroll and resizes are handled per event.
      </p>
      <div
        className="relative mx-auto rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 ring-1 ring-zinc-700/80"
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
              className="pointer-events-none absolute h-4 w-4 rounded-full bg-fuchsia-500/70 shadow-lg shadow-fuchsia-500/30 ring-2 ring-fuchsia-400/40"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
      </div>
      <p className="mt-3 text-xs text-zinc-500">{clicks.length} clicks</p>
    </div>
  );
}

export default function HeatmapPage() {
  const [urls, setUrls] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [clicks, setClicks] = useState<HeatmapClick[]>([]);
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
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHeatmap(url);
        if (!cancelled) setClicks(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Load failed");
          setClicks([]);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Heatmap</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Choose a page URL with stored clicks. Positions come from <code className="text-zinc-300">pageX</code> /{" "}
          <code className="text-zinc-300">pageY</code> normalized by each event&apos;s document size.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Known URLs</label>
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setCustomUrl("");
            }}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none ring-violet-500/0 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          >
            <option value="">— Select —</option>
            {urls.map((u) => (
              <option key={u} value={u}>
                {u.length > 80 ? `${u.slice(0, 80)}…` : u}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Or paste exact URL</label>
          <input
            type="url"
            placeholder="https://…"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          Refresh
        </button>
        {loading && <span className="text-sm text-zinc-500">Loading…</span>}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>

      <DotPlot clicks={clicks} />
    </div>
  );
}
