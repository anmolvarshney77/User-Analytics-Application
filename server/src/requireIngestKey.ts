import type { NextFunction, Request, Response } from "express";
import { INGEST_API_KEY } from "./env.js";

function keyFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const raw = (body as { api_key?: unknown }).api_key;
  return typeof raw === "string" ? raw : undefined;
}

/** When INGEST_API_KEY is set, require it via X-Analytics-Key or body api_key (for sendBeacon). */
export function requireIngestKey(req: Request, res: Response, next: NextFunction) {
  if (!INGEST_API_KEY) return next();
  const header = req.get("X-Analytics-Key");
  const bodyKey = keyFromBody(req.body);
  if (header === INGEST_API_KEY || bodyKey === INGEST_API_KEY) return next();
  return res.status(401).json({ error: "Invalid or missing ingest key" });
}
