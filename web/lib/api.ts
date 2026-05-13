const rawBase = process.env.NEXT_PUBLIC_API_BASE?.trim();
export const apiBase = (rawBase ? rawBase.replace(/\/$/, "") : "http://localhost:4000") as string;

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

export async function fetchSessions(): Promise<SessionSummary[]> {
  const res = await fetch(`${apiBase}/api/sessions`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sessions failed: ${res.status}`);
  return res.json();
}

export async function fetchSessionEvents(sessionId: string): Promise<StoredEvent[]> {
  const enc = encodeURIComponent(sessionId);
  const res = await fetch(`${apiBase}/api/sessions/${enc}/events`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Events failed: ${res.status}`);
  return res.json();
}

export async function fetchPageUrls(): Promise<string[]> {
  const res = await fetch(`${apiBase}/api/pages`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Pages failed: ${res.status}`);
  const data = (await res.json()) as { page_urls: string[] };
  return data.page_urls ?? [];
}

export async function fetchHeatmap(pageUrl: string): Promise<HeatmapClick[]> {
  const q = encodeURIComponent(pageUrl);
  const res = await fetch(`${apiBase}/api/heatmap?pageUrl=${q}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Heatmap failed: ${res.status}`);
  return res.json();
}
