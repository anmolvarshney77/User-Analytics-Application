import { describe, expect, it } from "vitest";
import { normalizeEvent } from "./validateEvent.js";

describe("normalizeEvent", () => {
  it("normalizes page_view", () => {
    const doc = normalizeEvent({
      session_id: "abc",
      type: "page_view",
      page_url: "https://example.com/",
      timestamp: "2025-01-01T00:00:00.000Z",
    });
    expect(doc).toMatchObject({
      session_id: "abc",
      type: "page_view",
      page_url: "https://example.com/",
      x: null,
      y: null,
    });
    expect(doc.timestamp).toBeInstanceOf(Date);
  });

  it("normalizes click with coordinates", () => {
    const doc = normalizeEvent({
      session_id: "abc",
      type: "click",
      page_url: "https://example.com/",
      timestamp: Date.now(),
      x: 10,
      y: 20,
      document_width: 800,
      document_height: 1200,
    });
    expect(doc.type).toBe("click");
    expect(doc.x).toBe(10);
    expect(doc.y).toBe(20);
  });

  it("rejects unknown event types", () => {
    expect(() =>
      normalizeEvent({
        session_id: "x",
        type: "scroll",
        page_url: "https://example.com",
        timestamp: new Date().toISOString(),
      })
    ).toThrow(/page_view or click/);
  });

  it("requires click coordinates", () => {
    expect(() =>
      normalizeEvent({
        session_id: "x",
        type: "click",
        page_url: "https://example.com",
        timestamp: new Date().toISOString(),
      })
    ).toThrow(/x must be/);
  });
});
