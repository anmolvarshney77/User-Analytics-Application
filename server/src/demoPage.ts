import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Request, Response } from "express";
import { INGEST_API_KEY } from "./env.js";

const demoPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "demo",
  "index.html"
);

let cachedTemplate: string | null = null;

function loadTemplate(): string {
  if (!cachedTemplate) {
    cachedTemplate = fs.readFileSync(demoPath, "utf8");
  }
  return cachedTemplate;
}

export function serveDemoPage(_req: Request, res: Response) {
  let html = loadTemplate();
  if (INGEST_API_KEY) {
    const safe = INGEST_API_KEY.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    html = html.replace('data-api-key=""', `data-api-key="${safe}"`);
  }
  res.type("html").send(html);
}
