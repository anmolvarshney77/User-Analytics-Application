import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./createApp.js";
import { Event } from "./models/Event.js";

describe("API integration", () => {
  let mongo: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await Event.deleteMany({});
    delete process.env.INGEST_API_KEY;
  });

  it("ingests a page_view and lists sessions", async () => {
    const payload = {
      session_id: "sess-1",
      type: "page_view",
      page_url: "https://example.com/demo",
      timestamp: new Date().toISOString(),
    };

    await request(app).post("/api/events").send(payload).expect(201);

    const list = await request(app).get("/api/sessions").expect(200);
    expect(list.body.total).toBe(1);
    expect(list.body.sessions[0].session_id).toBe("sess-1");
  });

  it("rejects ingest when INGEST_API_KEY is set and key is missing", async () => {
    process.env.INGEST_API_KEY = "secret";
    await request(app)
      .post("/api/events")
      .send({
        session_id: "s",
        type: "page_view",
        page_url: "https://example.com",
        timestamp: new Date().toISOString(),
      })
      .expect(401);
  });

  it("accepts batch ingest with api_key in body", async () => {
    process.env.INGEST_API_KEY = "secret";
    await request(app)
      .post("/api/events")
      .send({
        api_key: "secret",
        events: [
          {
            session_id: "batch-1",
            type: "click",
            page_url: "https://example.com/p",
            timestamp: new Date().toISOString(),
            x: 1,
            y: 2,
            document_width: 100,
            document_height: 200,
          },
        ],
      })
      .expect(201);

    const heatmap = await request(app)
      .get("/api/heatmap")
      .query({ pageUrl: "https://example.com/p" })
      .expect(200);

    expect(heatmap.body.total).toBe(1);
    expect(heatmap.body.clicks).toHaveLength(1);
  });
});
