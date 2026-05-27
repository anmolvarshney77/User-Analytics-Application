import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Request, Response } from "express";
import { getIngestApiKey } from "./env.js";

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
  const ingestKey = getIngestApiKey();
  if (ingestKey) {
    const safe = ingestKey.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    html = html.replace('data-api-key=""', `data-api-key="${safe}"`);
  }
  res.type("html").send(html);
}
