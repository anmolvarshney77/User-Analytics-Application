import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createApp } from "./createApp.js";
import { assertProductionEnv } from "./env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "..", ".env") });
assertProductionEnv();

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in server/.env");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  const app = createApp();
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
