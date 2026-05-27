import type { NextFunction, Request, Response } from "express";
import { getIngestApiKey } from "./env.js";

function keyFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const raw = (body as { api_key?: unknown }).api_key;
  return typeof raw === "string" ? raw : undefined;
}

/** When INGEST_API_KEY is set, require it via X-Analytics-Key or body api_key (for sendBeacon). */
export function requireIngestKey(req: Request, res: Response, next: NextFunction) {
  const expected = getIngestApiKey();
  if (!expected) return next();
  const header = req.get("X-Analytics-Key");
  const bodyKey = keyFromBody(req.body);
  if (header === expected || bodyKey === expected) return next();
  return res.status(401).json({ error: "Invalid or missing ingest key" });
}
