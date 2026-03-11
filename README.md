# 3D Flight Tracker

Production-quality 3D flight tracking built with **React + Vite + Three.js** using **react-three-fiber** and **drei**. The app renders live OpenSky aircraft on a rotatable 3D Earth with smooth motion, altitude-aware placement, and a polished HUD.

## What you get

- Live OpenSky aircraft data on a 3D globe
- Smooth great-circle interpolation between snapshots
- Light extrapolation for motion continuity between polls
- Altitude-based aircraft placement using `geo_altitude` with `baro_altitude` fallback
- Instanced aircraft markers for performance
- Polished lighting, atmosphere, stars, bloom, and vignette
- Search, hover, pin-to-inspect details, and region presets
- Same-origin backend endpoints so OpenSky secrets stay server-side

## Stack

- React 19
- Vite 6
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- `@react-three/postprocessing`
- Express for local backend development
- Vercel serverless functions for online deployment

## Deploy online with no local install

This repo is structured so you can put it online **without installing anything on your computer**.

### Fast path

1. Create a new GitHub repository.
2. Upload the contents of this folder.
3. Import that GitHub repo into Vercel.
4. Add these environment variables in Vercel:
   - `OPENSKY_CLIENT_ID`
   - `OPENSKY_CLIENT_SECRET`
5. Deploy.

After that, Vercel will:
- build the Vite frontend
- serve the static app
- run `/api/flights` and `/api/health` as serverless functions

### Optional deploy button for your README

Once the code is in GitHub, you can add this to the GitHub repo README for one-click Vercel import:

```md
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL)
```

Replace `YOUR_GITHUB_REPO_URL` with your GitHub repo URL.

## Repository handoff checklist

Use this checklist when creating the GitHub repo:

- [ ] Upload all files from this folder to the repo root
- [ ] Confirm `api/` is included
- [ ] Confirm `src/` is included
- [ ] Add Vercel environment variables
- [ ] Run first deployment
- [ ] Open `/api/health` on the deployed site and verify `{ "ok": true }`
- [ ] Open the homepage and confirm aircraft are loading

A copy of this checklist is also in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Environment variables

### Required for authenticated OpenSky access

| Variable | Purpose |
|---|---|
| `OPENSKY_CLIENT_ID` | OpenSky OAuth client ID |
| `OPENSKY_CLIENT_SECRET` | OpenSky OAuth client secret |

### Optional for local development

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Local backend port | `8787` |

Copy `.env.example` to `.env.local` for local development.

## Project structure

```text
flight-tracker-3d/
├── api/
│   ├── _lib/
│   │   └── opensky.js
│   ├── flights.js
│   └── health.js
├── server/
│   └── server.mjs
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── .env.example
├── DEPLOYMENT.md
├── LICENSE
├── README.md
├── index.html
├── package.json
└── vite.config.ts
```

## Local development

Local install is optional. You only need this if you want to edit or test the app on your machine.

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend proxy: `http://localhost:8787`

## Production build

```bash
npm install
npm run build
npm run start
```

The local Express server will serve the built Vite app from `dist/` when that directory exists.

## API notes

- The frontend requests same-origin `/api/flights`
- Secrets never live in the browser bundle
- Anonymous OpenSky access works, but authenticated access is better for quota and resolution
- Poll defaults are conservative to reduce credit burn
- Region presets are included because whole-world requests are much more expensive than bounded requests

## Notes for maintainers

- `server/server.mjs` is for local development and local production-style serving
- `api/` is for Vercel deployment
- The app does not need React Router, so no SPA rewrite config is required
- Aircraft rendering uses instancing for better performance at larger counts

## License

MIT
