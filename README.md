# User analytics application

Small full-stack demo: a browser **tracker** sends `page_view` and `click` events to a **Node.js + Express + MongoDB** API; a **Next.js + Tailwind** dashboard lists sessions, shows per-session journeys, and draws a **heatmap** using document-space coordinates.

## Prerequisites

- Node.js 20+ recommended  
- MongoDB Atlas (or any cluster) — create a database user and paste the URI into `server/.env`

## Setup

1. **API & database**

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env`:

   - `MONGODB_URI` — your Atlas connection string (include database name in the path, e.g. `...mongodb.net/analytics?...`).
   - `CORS_ORIGINS` — comma-separated list of allowed browser origins (no trailing slash). Include `http://localhost:3000` for the dashboard and `http://localhost:4000` for the demo served by the API.

2. **Dashboard**

   ```bash
   cp web/.env.example web/.env.local
   ```

   Set `NEXT_PUBLIC_API_BASE` to your API base URL (default `http://localhost:4000`).

3. **Install dependencies** (from repo root)

   ```bash
   npm install
   ```

## Run locally

**Terminal A — API + tracker bundle + demo static**

```bash
npm run dev:server
```

- API: `http://localhost:4000`  
- Health: `GET /health`  
- Demo: `http://localhost:4000/demo/`  
- Tracker script: `http://localhost:4000/tracker.js`

**Terminal B — dashboard**

```bash
npm run dev:web
```

Open `http://localhost:3000` → Sessions.

**Or both** (requires `concurrently`):

```bash
npm run dev
```

## Manual test checklist

1. Open `http://localhost:4000/demo/`, scroll, click buttons.  
2. In the dashboard **Sessions**, confirm a new session and non-zero event count.  
3. Open **Journey** — events ordered by time; clicks show `pageX`/`pageY` and document size.  
4. **Heatmap** — select the demo page URL; dots should match click locations (normalized by each event’s document width/height).

## Tracker on your own site

```html
<script src="https://YOUR-API-HOST/tracker.js" data-endpoint="https://YOUR-API-HOST" defer></script>
```

If the script is served from the **same origin** as the API, you can omit `data-endpoint`. CORS must allow your site’s origin in `CORS_ORIGINS`.

## Build

```bash
npm run build
```

## Appendix: local MongoDB with Docker

```bash
docker run -d --name ua-mongo -p 27017:27017 mongo:7
# MONGODB_URI=mongodb://127.0.0.1:27017/analytics
```

## Monorepo layout

| Path | Role |
|------|------|
| `tracker/` | Source for `tracker.js` (built into `server/public/`) |
| `server/` | Express API + static `/tracker.js` + `/demo/` |
| `web/` | Next.js dashboard |
| `demo/` | Long scrollable demo HTML |

## Note on nested `web/.git`

If `create-next-app` created `web/.git`, remove it if you prefer a single repository at the project root.
