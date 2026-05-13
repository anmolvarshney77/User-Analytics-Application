import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { Event } from "./models/Event.js";
import { normalizeEvent, type IncomingEvent } from "./validateEvent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

function parseCorsOrigins(): string[] | true {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) return true;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const app = express();
app.use(express.json({ limit: "512kb" }));
app.use(
  cors({
    origin: parseCorsOrigins(),
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
app.use("/demo", express.static(path.join(__dirname, "..", "..", "demo")));

app.get("/health", (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.post("/api/events", async (req, res) => {
  try {
    const body = req.body;
    const items: IncomingEvent[] = Array.isArray(body?.events)
      ? body.events
      : body && typeof body === "object" && "session_id" in body
        ? [body as IncomingEvent]
        : [];
    if (!items.length) {
      return res
        .status(400)
        .json({ error: "Expected an event object or { events: [...] }" });
    }
    const docs = items.map((raw) => normalizeEvent(raw));
    await Event.insertMany(docs);
    return res.status(201).json({ inserted: docs.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid payload";
    return res.status(400).json({ error: message });
  }
});

app.get("/api/sessions", async (_req, res) => {
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
});

app.get("/api/sessions/:sessionId/events", async (req, res) => {
  const sessionId = req.params.sessionId;
  const events = await Event.find({ session_id: sessionId })
    .sort({ timestamp: 1 })
    .lean()
    .exec();
  res.json(events);
});

app.get("/api/heatmap", async (req, res) => {
  const pageUrl = req.query.pageUrl;
  if (typeof pageUrl !== "string" || !pageUrl.trim()) {
    return res.status(400).json({ error: "Query pageUrl is required" });
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
});

app.get("/api/pages", async (_req, res) => {
  const urls = await Event.distinct("page_url", { type: "click" });
  urls.sort();
  res.json({ page_urls: urls });
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
