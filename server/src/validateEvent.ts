export type IncomingEvent = {
  session_id: unknown;
  type: unknown;
  page_url: unknown;
  timestamp: unknown;
  x?: unknown;
  y?: unknown;
  document_width?: unknown;
  document_height?: unknown;
};

function asString(v: unknown, field: string): string {
  if (typeof v !== "string" || !v.trim()) {
    throw new Error(`${field} must be a non-empty string`);
  }
  return v;
}

function asDate(v: unknown, field: string): Date {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "number" && Number.isFinite(v)) return new Date(v);
  if (typeof v === "string") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  throw new Error(`${field} must be a valid ISO date or timestamp`);
}

function asNumber(v: unknown, field: string): number {
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new Error(`${field} must be a finite number`);
  }
  return v;
}

export function normalizeEvent(raw: IncomingEvent) {
  const type = asString(raw.type, "type");
  if (type !== "page_view" && type !== "click") {
    throw new Error("type must be page_view or click");
  }
  const session_id = asString(raw.session_id, "session_id");
  const page_url = asString(raw.page_url, "page_url");
  const timestamp = asDate(raw.timestamp, "timestamp");

  if (type === "page_view") {
    return {
      session_id,
      type: "page_view" as const,
      page_url,
      timestamp,
      x: null,
      y: null,
      document_width: null,
      document_height: null,
    };
  }

  return {
    session_id,
    type: "click" as const,
    page_url,
    timestamp,
    x: asNumber(raw.x, "x"),
    y: asNumber(raw.y, "y"),
    document_width: asNumber(raw.document_width, "document_width"),
    document_height: asNumber(raw.document_height, "document_height"),
  };
}
