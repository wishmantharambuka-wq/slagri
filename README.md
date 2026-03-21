# 🌿 AgriFlow — Sri Lanka Agricultural Intelligence Platform

> Real-time crop surplus/shortage management, national market intelligence, and farmer-to-buyer connectivity for Sri Lanka.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-AgriFlow-brightgreen?style=for-the-badge)](https://slagri.netlify.app)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-orange?style=for-the-badge)](#)
[![Database](https://img.shields.io/badge/Database-Supabase%20Ready-3ECF8E?style=for-the-badge)](#)

---

## 📸 Pages

| Page | Description |
|------|-------------|
| `index.html` | National dashboard — weather, KPI stats, forecasts |
| `map.html` | Live Leaflet map — district surplus/shortage choropleth |
| `marketplace.html` | Buyer/seller listings with real-time SSE updates |
| `farmer.html` | Farmer submission zone — crop data + history table |
| `admin.html` | Admin command centre — KPIs, alerts, user management |

---

## 🏗️ Architecture

```
Frontend (HTML + Tailwind + Leaflet + Chart.js)
    ↕  api-client.js  (JWT auth + SSE subscriber + offline fallback)
    ↕  agri-db.js     (localStorage mirror for offline use)

Backend  (Node.js + Express)
    ├─ routes/         7 route groups
    ├─ controllers/    7 controllers
    ├─ services/
    │   ├─ store.js    In-memory data store (35 seed submissions)
    │   └─ sse.js      Server-Sent Events broadcaster
    └─ config/
        ├─ supabase.js  (swap in when ready)
        └─ mysql.js     (alternative)

Database  (not yet connected — swap DB_MODE in .env)
    └─ database.sql    Full PostgreSQL schema for Supabase
```

---

## 🚀 Quick Start

### Frontend (static — works offline)
Open any `.html` file directly in a browser, or use VS Code Live Server on port 5500.

### Backend
```bash
cd agribackendp/agri-backend
npm install
npm run dev          # starts on http://localhost:5000
```

In a second terminal:
```bash
node test-api.js     # smoke-tests all 20+ endpoints
```

### Environment
Copy the example and fill in your secrets:
```bash
cp agribackendp/agri-backend/.env.example agribackendp/agri-backend/.env
```

Key variables:
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | API port |
| `DB_MODE` | `memory` | `memory` / `supabase` / `mysql` |
| `JWT_SECRET` | *(change this)* | Token signing key |
| `SUPABASE_URL` | — | Fill in when connecting Supabase |

---

## 🌐 Deployment

### Frontend → Netlify (already configured)
The `.netlify/` folder contains an existing site ID. Just connect this repo in the Netlify dashboard and it will deploy automatically on every push to `main`.

**Live URL:** `https://slagri.netlify.app`

### Backend → Render / Railway / Fly.io
1. Create a new Web Service pointing to `agribackendp/agri-backend`
2. Set start command: `node server.js`
3. Add environment variables from `.env`
4. Update `FRONTEND_URL` in the backend `.env` to your Netlify URL
5. Update `window.AGRIFLOW_API` in your HTML files (or set it via Netlify env) to your backend URL

---

## 🔌 Connecting Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `agribackendp/agri-backend/database.sql` in the Supabase SQL Editor
3. Set in `.env`:
   ```
   DB_MODE=supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```
4. `npm install @supabase/supabase-js`
5. Replace function bodies in `services/store.js` using the examples in `config/supabase.js`

---

## 📡 API Reference (quick)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | — | Login (`username`/`password` or `role`/`name`) |
| `GET` | `/api/map/aggregates` | — | District surplus/shortage per crop |
| `GET` | `/api/map/forecast?horizon=2` | — | Projected data 1–3 months out |
| `GET` | `/api/submissions` | — | All farmer crop submissions |
| `POST` | `/api/submissions` | 🔒 | Submit crop data |
| `GET` | `/api/admin/stats` | 🔒 Admin | Live KPI numbers |
| `GET` | `/api/events` | — | SSE stream for real-time push |

Full API docs in [`agribackendp/agri-backend/README.md`](agribackendp/agri-backend/README.md).

---

## 🛠️ Tech Stack

**Frontend:** HTML5 · Tailwind CSS (CDN) · Leaflet.js · Chart.js · Font Awesome · Vanilla JS  
**Backend:** Node.js · Express 5 · JWT (jsonwebtoken) · bcryptjs · Server-Sent Events  
**Database:** In-memory (default) · Supabase/PostgreSQL (ready) · MySQL (config included)  
**Tooling:** VS Code · Nodemon · PapaParse · toGeoJSON  

---

## 📄 License

MIT — feel free to adapt for other agricultural contexts.
