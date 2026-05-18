"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertBanner } from "@/components/AlertBanner";
import { DemoLink } from "@/components/DemoLink";
import { DemoWalkthrough } from "@/components/DemoWalkthrough";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField, inputClassName } from "@/components/ui/FormField";
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
      <EmptyState title="No clicks for this URL yet" className="min-h-[280px] justify-center py-12">
        <p className="text-sm text-zinc-500">Generate clicks on the demo page, then refresh.</p>
      </EmptyState>
    );
  }

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="border-b border-zinc-800 px-4 py-3">
        <p className="text-xs leading-relaxed text-zinc-500">
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
    </Card>
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
          setError(errorMessage(e, "Load failed"));
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
    <div className="space-y-8">
      <PageHeader
        title="Heatmap"
        description="Aggregate click positions for a page URL. Coordinates use pageX/pageY normalized by each event's document size."
      />

      <DemoWalkthrough />

      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="known-url"
            label="Known URLs"
            hint={
              urls.length === 0 ? (
                <>
                  No URLs yet. Try <DemoLink variant="inline" label={demoUrl} />.
                </>
              ) : undefined
            }
          >
            <select
              id="known-url"
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setCustomUrl("");
              }}
              className={inputClassName}
            >
              <option value="">— Select —</option>
              {urls.map((u) => (
                <option key={u} value={u}>
                  {u.length > 80 ? `${u.slice(0, 80)}…` : u}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="custom-url" label="Or paste exact URL">
            <input
              id="custom-url"
              type="url"
              placeholder={demoUrl}
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className={inputClassName}
            />
          </FormField>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-800/90 pt-4">
          <Button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading || !effectiveUrl.trim()}
          >
            {loading ? "Loading…" : "Refresh heatmap"}
          </Button>
        </div>
      </Card>

      {error ? (
        <AlertBanner variant="error" title="Could not load heatmap">
          <p>{error}</p>
        </AlertBanner>
      ) : null}

      {loading && !clicks.length ? (
        <Card className="flex min-h-[280px] animate-pulse items-center justify-center text-sm text-zinc-500">
          Loading heatmap…
        </Card>
      ) : (
        <DotPlot clicks={clicks} />
      )}
    </div>
  );
}
