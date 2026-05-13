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

## Deploy to Render (Blueprint)

This repo ships a [`render.yaml`](./render.yaml) Blueprint that deploys two web services to [Render](https://render.com): the API (`ua-api`) and the Next.js dashboard (`ua-web`). MongoDB is **not** provisioned by the blueprint — bring your own MongoDB Atlas cluster.

1. **Push this repo to GitHub / GitLab** (Render needs access to the source).
2. In the Render dashboard go to **New → Blueprint**, connect the repo, and pick the branch. Render will detect `render.yaml` and create both services.
3. On first deploy Render will prompt for these `sync: false` env vars. **Use the exact public URLs Render assigns** (open each service → copy the URL from the top of the page). If a name like `ua-api` is already taken globally, Render uses a suffix such as `https://ua-api-q3e5.onrender.com` — that full hostname is what you must use everywhere; `https://ua-api.onrender.com` without the suffix is often **not** your service and the dashboard will show `503` errors.
   - `ua-api` → `MONGODB_URI` — your Atlas connection string (must include the DB name in the path, e.g. `...mongodb.net/analytics?...`).
   - `ua-api` → `CORS_ORIGINS` — comma-separated origins with no trailing slash. Include your **actual** `ua-web` URL (e.g. `https://ua-web-q528.onrender.com`) and your **actual** `ua-api` URL if you use `/demo/` from the API host.
   - `ua-web` → `NEXT_PUBLIC_API_BASE` — your **actual** `ua-api` URL (e.g. `https://ua-api-q3e5.onrender.com`, no trailing slash).
4. After you set or change `NEXT_PUBLIC_API_BASE`, open `ua-web` → **Manual Deploy → Clear build cache & deploy** so the value is baked into the Next.js bundle. The Sessions page reads this at build time; wrong host = `Sessions failed: 503`.
5. Health check: `GET https://<your-ua-api-host>/health` should return `{"ok":true,"db":true}`. Then open `https://<your-ua-web-host>/sessions`.

### Showcase / live demo flow

Once deployed, you can demo the entire pipeline end-to-end:

1. Open the dashboard: `https://<your-ua-web-host>/sessions`.
2. Click the **Open demo ↗** button in the top-right of the dashboard nav (it opens the API-served demo page at `https://<your-ua-api-host>/demo/` in a new tab).
3. On the demo page, scroll and click the buttons / pills / corner targets.
4. Switch back to the dashboard tab and refresh:
   - **Sessions** — your session UUID appears with the event count.
   - **Sessions → Journey** — every `page_view` and `click` in time order with `pageX`/`pageY` and document size.
   - **Heatmap** — pick the demo URL from the dropdown to see the click distribution.

The demo page bundles `/tracker.js` from the same origin, so no extra CORS configuration is needed for it.

> Render's free plan spins web services down on inactivity; the first request after a cold start can take 30–60 s. Upgrade to a paid plan to avoid this.

To use the tracker on your own site after deploy:

```html
<script src="https://ua-api.onrender.com/tracker.js" data-endpoint="https://ua-api.onrender.com" defer></script>
```

Make sure your site's origin is included in `CORS_ORIGINS` on the `ua-api` service.

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
