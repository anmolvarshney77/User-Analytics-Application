import type { NextFunction, Request, Response } from "express";
import { INGEST_API_KEY } from "./env.js";

/** When INGEST_API_KEY is set, require matching X-Analytics-Key on ingest. */
export function requireIngestKey(req: Request, res: Response, next: NextFunction) {
  if (!INGEST_API_KEY) return next();
  const key = req.get("X-Analytics-Key");
  if (key === INGEST_API_KEY) return next();
  return res.status(401).json({ error: "Invalid or missing X-Analytics-Key" });
}
