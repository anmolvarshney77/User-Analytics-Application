const SESSION_KEY = "ua_session_id";
const FLUSH_MS = 3000;
const MAX_BATCH = 20;

const STRIP_QUERY_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
];

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

function scriptEl(): HTMLScriptElement | null {
  return document.currentScript as HTMLScriptElement | null;
}

function getApiBase(): string {
  const fromAttr = scriptEl()?.getAttribute("data-endpoint");
  if (fromAttr != null && fromAttr.trim() !== "") {
    return fromAttr.replace(/\/$/, "");
  }
  return `${location.protocol}//${location.host}`;
}

function getIngestKey(): string | null {
  const fromAttr = scriptEl()?.getAttribute("data-api-key");
  if (fromAttr != null && fromAttr.trim() !== "") return fromAttr.trim();
  return null;
}

/** Same page with different UTM/hash fragments maps to one heatmap URL. */
function canonicalPageUrl(): string {
  try {
    const u = new URL(location.href);
    u.hash = "";
    for (const name of STRIP_QUERY_PARAMS) u.searchParams.delete(name);
    let path = u.pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    u.pathname = path;
    return u.toString();
  } catch {
    return location.href.split("#")[0] ?? location.href;
  }
}

function documentDimensions(): { document_width: number; document_height: number } {
  const el = document.documentElement;
  const body = document.body;
  const document_width = Math.max(
    el.scrollWidth,
    el.clientWidth,
    body ? body.scrollWidth : 0,
    body ? body.clientWidth : 0
  );
  const document_height = Math.max(
    el.scrollHeight,
    el.clientHeight,
    body ? body.scrollHeight : 0,
    body ? body.clientHeight : 0
  );
  return { document_width, document_height };
}

function nowIso(): string {
  return new Date().toISOString();
}

const queue: Record<string, unknown>[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function postPayload(body: string, ingestKey: string | null): void {
  const base = getApiBase();
  const url = `${base}/api/events`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (ingestKey) headers["X-Analytics-Key"] = ingestKey;

  try {
    if (navigator.sendBeacon && ingestKey == null) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    /* fall through */
  }
  void fetch(url, {
    method: "POST",
    headers,
    body,
    keepalive: true,
  }).catch(() => {});
}

function flush(): void {
  if (flushTimer != null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!queue.length) return;

  const events = queue.splice(0, queue.length);
  const ingestKey = getIngestKey();
  const envelope: Record<string, unknown> = { events };
  if (ingestKey) envelope.api_key = ingestKey;
  postPayload(JSON.stringify(envelope), ingestKey);
}

function scheduleFlush(): void {
  if (queue.length >= MAX_BATCH) {
    flush();
    return;
  }
  if (flushTimer != null) return;
  flushTimer = setTimeout(flush, FLUSH_MS);
}

function enqueue(event: Record<string, unknown>): void {
  queue.push(event);
  scheduleFlush();
}

function trackPageView(): void {
  enqueue({
    session_id: getSessionId(),
    type: "page_view",
    page_url: canonicalPageUrl(),
    timestamp: nowIso(),
  });
}

function onPointerClick(ev: MouseEvent): void {
  if (!(ev instanceof MouseEvent)) return;
  const { document_width, document_height } = documentDimensions();
  enqueue({
    session_id: getSessionId(),
    type: "click",
    page_url: canonicalPageUrl(),
    timestamp: nowIso(),
    x: ev.pageX,
    y: ev.pageY,
    document_width,
    document_height,
  });
}

trackPageView();
document.addEventListener("click", onPointerClick, true);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flush();
});
window.addEventListener("pagehide", flush);
