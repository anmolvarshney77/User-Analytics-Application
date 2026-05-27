import { describe, expect, it } from "vitest";
import { parseLimit, parseOffset, parseSince } from "./parseQuery.js";

describe("parseQuery", () => {
  it("parseLimit clamps to max", () => {
    expect(parseLimit("999", 50, 200)).toBe(200);
    expect(parseLimit(undefined, 50, 200)).toBe(50);
    expect(parseLimit("-1", 50, 200)).toBe(50);
  });

  it("parseOffset defaults invalid to zero", () => {
    expect(parseOffset("10")).toBe(10);
    expect(parseOffset("bad")).toBe(0);
  });

  it("parseSince accepts ISO strings", () => {
    const d = parseSince("2025-06-01T12:00:00.000Z");
    expect(d?.toISOString()).toBe("2025-06-01T12:00:00.000Z");
    expect(parseSince("not-a-date")).toBeUndefined();
  });
});
