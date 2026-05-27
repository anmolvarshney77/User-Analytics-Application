import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { asyncHandler } from "./asyncHandler.js";
import { serveDemoPage } from "./demoPage.js";
import { assertProductionEnv, corsOriginOption } from "./env.js";
import { Event } from "./models/Event.js";
import { requireIngestKey } from "./requireIngestKey.js";
import { normalizeEvent, type IncomingEvent } from "./validateEvent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "..", ".env") });
assertProductionEnv();

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

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
  asyncHandler(async (_req, res) => {
    const rows = await Event.aggregate<{
      _id: string;
      event_count: number;
      first_seen: Date;
      last_seen: Date;
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
    ]);
    res.json(
      rows.map((r) => ({
        session_id: r._id,
        event_count: r.event_count,
        first_seen: r.first_seen,
        last_seen: r.last_seen,
      }))
    );
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
    const clicks = await Event.find({
      type: "click",
      page_url: pageUrl,
    })
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
    res.json(clicks);
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
  if (err instanceof Error && err.message.startsWith("type must be")) {
    res.status(400).json({ error: err.message });
    return;
  }
  const message = err instanceof Error ? err.message : "Invalid payload";
  if (
    message.includes("must be") ||
    message.includes("Expected") ||
    message === "Invalid payload"
  ) {
    res.status(400).json({ error: message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function main() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in server/.env");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
    console.log(`Demo: http://localhost:${PORT}/demo/`);
    console.log(`Tracker: http://localhost:${PORT}/tracker.js`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
