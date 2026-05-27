const rawBase = process.env.NEXT_PUBLIC_API_BASE?.trim();
export const apiBase = (rawBase ? rawBase.replace(/\/$/, "") : "http://localhost:4000") as string;

/** Render free-tier edge sometimes returns 429/503 under burst traffic; retry briefly. */
async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  const maxAttempts = 4;
  const retryOn = new Set([429, 502, 503]);
  let last: Response | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, init);
    last = res;
    if (res.ok || !retryOn.has(res.status) || attempt === maxAttempts) return res;
    const ms = 400 * 2 ** (attempt - 1);
    await new Promise((r) => setTimeout(r, ms));
  }
  return last!;
}

function assertOk(res: Response, label: string): void {
  if (res.ok) return;
  if (res.status === 429) {
    throw new Error(
      `${label}: 429 — Render's edge rate-limits bursts on free web services. Wait 1–2 minutes and refresh, or upgrade the API to Starter for a stable demo.`
    );
  }
  throw new Error(`${label} failed: ${res.status}`);
}

export type SessionSummary = {
  session_id: string;
  event_count: number;
  first_seen: string;
  last_seen: string;
};

export type StoredEvent = {
  _id: string;
  session_id: string;
  type: "page_view" | "click";
  page_url: string;
  timestamp: string;
  x: number | null;
  y: number | null;
  document_width: number | null;
  document_height: number | null;
};

export type HeatmapClick = {
  _id: string;
  session_id: string;
  x: number;
  y: number;
  document_width: number;
  document_height: number;
  timestamp: string;
};

export type SessionsResponse = {
  sessions: SessionSummary[];
  total: number;
  limit: number;
  offset: number;
};

export async function fetchSessions(
  limit = 50,
  offset = 0
): Promise<SessionsResponse> {
  const q = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const res = await fetchWithRetry(`${apiBase}/api/sessions?${q}`, { cache: "no-store" });
  assertOk(res, "Sessions");
  return res.json();
}

export async function fetchSessionEvents(sessionId: string): Promise<StoredEvent[]> {
  const enc = encodeURIComponent(sessionId);
  const res = await fetchWithRetry(`${apiBase}/api/sessions/${enc}/events`, { cache: "no-store" });
  assertOk(res, "Events");
  return res.json();
}

export async function fetchPageUrls(): Promise<string[]> {
  const res = await fetchWithRetry(`${apiBase}/api/pages`, { cache: "no-store" });
  assertOk(res, "Pages");
  const data = (await res.json()) as { page_urls: string[] };
  return data.page_urls ?? [];
}

export type HeatmapResponse = {
  clicks: HeatmapClick[];
  total: number;
  limit: number;
  truncated: boolean;
  since: string | null;
};

export async function fetchHeatmap(
  pageUrl: string,
  options?: { limit?: number; since?: string }
): Promise<HeatmapResponse> {
  const q = new URLSearchParams({ pageUrl });
  if (options?.limit != null) q.set("limit", String(options.limit));
  if (options?.since) q.set("since", options.since);
  const res = await fetchWithRetry(`${apiBase}/api/heatmap?${q}`, { cache: "no-store" });
  assertOk(res, "Heatmap");
  return res.json();
}
