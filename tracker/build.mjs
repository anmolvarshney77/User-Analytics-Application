import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import * as esbuild from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, "..", "server", "public", "tracker.js");
fs.mkdirSync(path.dirname(outFile), { recursive: true });

await esbuild.build({
  entryPoints: [path.join(__dirname, "src", "index.ts")],
  bundle: true,
  outfile: outFile,
  format: "iife",
  platform: "browser",
  target: "es2018",
  minify: true,
});

console.log("Built", outFile);
