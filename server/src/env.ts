export const isProduction = process.env.NODE_ENV === "production";

export const INGEST_API_KEY = process.env.INGEST_API_KEY?.trim() ?? "";

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const corsOrigins = parseCorsOrigins();

/** `true` = reflect request origin (dev only when CORS_ORIGINS is unset). */
export function corsOriginOption(): boolean | string[] {
  if (corsOrigins.length > 0) return corsOrigins;
  return true;
}

export function assertProductionEnv(): void {
  if (!isProduction) return;
  if (corsOrigins.length === 0) {
    console.error("CORS_ORIGINS is required when NODE_ENV=production");
    process.exit(1);
  }
  if (!INGEST_API_KEY) {
    console.warn(
      "Warning: INGEST_API_KEY is not set in production. POST /api/events is open to abuse."
    );
  }
}
