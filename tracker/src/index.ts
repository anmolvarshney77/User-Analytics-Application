const SESSION_KEY = "ua_session_id";

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

function getApiBase(): string {
  const current = document.currentScript as HTMLScriptElement | null;
  const fromAttr = current?.getAttribute("data-endpoint");
  if (fromAttr != null && fromAttr.trim() !== "") {
    return fromAttr.replace(/\/$/, "");
  }
  return `${location.protocol}//${location.host}`;
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

function sendEvent(payload: Record<string, unknown>): void {
  const base = getApiBase();
  const url = `${base}/api/events`;
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    /* fall through */
  }
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

function trackPageView(): void {
  sendEvent({
    session_id: getSessionId(),
    type: "page_view",
    page_url: location.href,
    timestamp: nowIso(),
  });
}

function onPointerClick(ev: MouseEvent): void {
  if (!(ev instanceof MouseEvent)) return;
  const { document_width, document_height } = documentDimensions();
  sendEvent({
    session_id: getSessionId(),
    type: "click",
    page_url: location.href,
    timestamp: nowIso(),
    x: ev.pageX,
    y: ev.pageY,
    document_width,
    document_height,
  });
}

trackPageView();
document.addEventListener("click", onPointerClick, true);
