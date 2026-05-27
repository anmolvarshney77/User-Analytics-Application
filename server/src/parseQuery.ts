export function parseLimit(
  raw: unknown,
  defaultLimit: number,
  maxLimit: number
): number {
  if (raw === undefined || raw === "") return defaultLimit;
  const n = Number(typeof raw === "string" ? raw : NaN);
  if (!Number.isFinite(n) || n < 1) return defaultLimit;
  return Math.min(Math.floor(n), maxLimit);
}

export function parseOffset(raw: unknown): number {
  if (raw === undefined || raw === "") return 0;
  const n = Number(typeof raw === "string" ? raw : NaN);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

export function parseSince(raw: unknown): Date | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}
