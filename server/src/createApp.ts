import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { asyncHandler } from "./asyncHandler.js";
import { serveDemoPage } from "./demoPage.js";
import { corsOriginOption } from "./env.js";
import { Event } from "./models/Event.js";
import { parseLimit, parseOffset, parseSince } from "./parseQuery.js";
import { requireIngestKey } from "./requireIngestKey.js";
import { normalizeEvent, type IncomingEvent } from "./validateEvent.js";

const SESSIONS_DEFAULT_LIMIT = 50;
const SESSIONS_MAX_LIMIT = 200;
const HEATMAP_DEFAULT_LIMIT = 2000;
const HEATMAP_MAX_LIMIT = 5000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(): Express {
  const ingestLimiter = rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many events; try again in a minute" },
  });

  const app = express();
  app.use(express.json({ limit: "512kb" }));
  app.use(
    cors({
      origin: corsOriginOption(),
      credentials: false,
    })
  );

  app.get("/", (_req, res) => {
    res.json({
      service: "user-analytics-api",
      health: "/health",
      demo: "/demo/",
      tracker: "/tracker.js",
      events: "POST /api/events",
    });
  });

  const publicDir = path.join(__dirname, "..", "public");
  app.use(express.static(publicDir));
  app.get(["/demo", "/demo/"], serveDemoPage);

  app.get("/health", (_req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 });
  });

  app.post(
    "/api/events",
    ingestLimiter,
    requireIngestKey,
    asyncHandler(async (req, res) => {
      const body = req.body;
      const items: IncomingEvent[] = Array.isArray(body?.events)
        ? body.events
        : body && typeof body === "object" && "session_id" in body
          ? [body as IncomingEvent]
          : [];
      if (!items.length) {
        res.status(400).json({ error: "Expected an event object or { events: [...] }" });
        return;
      }
      const docs = items.map((raw) => normalizeEvent(raw));
      await Event.insertMany(docs, { ordered: false });
      res.status(201).json({ inserted: docs.length });
    })
  );

  app.get(
    "/api/sessions",
    asyncHandler(async (req, res) => {
      const limit = parseLimit(req.query.limit, SESSIONS_DEFAULT_LIMIT, SESSIONS_MAX_LIMIT);
      const offset = parseOffset(req.query.offset);

      const [facet] = await Event.aggregate<{
        meta: { total: number }[];
        data: {
          _id: string;
          event_count: number;
          first_seen: Date;
          last_seen: Date;
        }[];
      }>([
        {
          $group: {
            _id: "$session_id",
            event_count: { $sum: 1 },
            first_seen: { $min: "$timestamp" },
            last_seen: { $max: "$timestamp" },
          },
        },
        { $sort: { last_seen: -1 } },
        {
          $facet: {
            meta: [{ $count: "total" }],
            data: [{ $skip: offset }, { $limit: limit }],
          },
        },
      ]);

      const total = facet?.meta[0]?.total ?? 0;
      const rows = facet?.data ?? [];

      res.json({
        sessions: rows.map((r) => ({
          session_id: r._id,
          event_count: r.event_count,
          first_seen: r.first_seen,
          last_seen: r.last_seen,
        })),
        total,
        limit,
        offset,
      });
    })
  );

  app.get(
    "/api/sessions/:sessionId/events",
    asyncHandler(async (req, res) => {
      const sessionId = req.params.sessionId;
      const events = await Event.find({ session_id: sessionId })
        .sort({ timestamp: 1 })
        .lean()
        .exec();
      res.json(events);
    })
  );

  app.get(
    "/api/heatmap",
    asyncHandler(async (req, res) => {
      const pageUrl = req.query.pageUrl;
      if (typeof pageUrl !== "string" || !pageUrl.trim()) {
        res.status(400).json({ error: "Query pageUrl is required" });
        return;
      }
      const limit = parseLimit(req.query.limit, HEATMAP_DEFAULT_LIMIT, HEATMAP_MAX_LIMIT);
      const since = parseSince(req.query.since);
      if (req.query.since != null && req.query.since !== "" && !since) {
        res.status(400).json({ error: "Query since must be a valid ISO date" });
        return;
      }

      const filter: Record<string, unknown> = {
        type: "click",
        page_url: pageUrl.trim(),
      };
      if (since) filter.timestamp = { $gte: since };

      const total = await Event.countDocuments(filter);
      const clicks = await Event.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .select({
          x: 1,
          y: 1,
          document_width: 1,
          document_height: 1,
          timestamp: 1,
          session_id: 1,
        })
        .lean()
        .exec();

      res.json({
        clicks,
        total,
        limit,
        truncated: total > clicks.length,
        since: since?.toISOString() ?? null,
      });
    })
  );

  app.get(
    "/api/pages",
    asyncHandler(async (_req, res) => {
      const urls = await Event.distinct("page_url", { type: "click" });
      urls.sort();
      res.json({ page_urls: urls });
    })
  );

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : "Invalid payload";
    if (
      message.includes("must be") ||
      message.startsWith("type must be") ||
      message.includes("Expected")
    ) {
      res.status(400).json({ error: message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
