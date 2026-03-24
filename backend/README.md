# AgriFlow Backend

Node.js + Express REST API for the AgriFlow agricultural intelligence platform.

## Quick Start

```bash
cd agribackendp/agri-backend
npm install
npm run dev
```

The API starts at **http://localhost:5000**

---

## Project Structure

```
agri-backend/
├── server.js               # Entry point — registers all routes
├── .env                    # Environment variables (not committed)
├── package.json
│
├── controllers/            # Route handlers (one per resource)
│   ├── authController.js
│   ├── submissionController.js
│   ├── listingController.js
│   ├── alertController.js
│   ├── mapController.js
│   ├── adminController.js
│   └── userController.js
│
├── routes/                 # Express routers (one per resource)
│   ├── authRoutes.js
│   ├── submissionRoutes.js
│   ├── listingRoutes.js
│   ├── alertRoutes.js
│   ├── mapRoutes.js
│   ├── adminRoutes.js
│   └── userRoutes.js
│
├── services/
│   └── store.js            # In-memory data store (swap for DB later)
│
├── middleware/
│   ├── auth.js             # JWT verification + role guard
│   └── errorHandler.js     # Global error handler + asyncWrap
│
├── utils/
│   ├── response.js         # Standard response helpers (ok, fail, etc.)
│   └── validators.js       # Input validation
│
└── config/
    ├── supabase.js         # Supabase client (activate when ready)
    ├── mysql.js            # MySQL pool (alternative)
    └── db.js               # Old MongoDB stub (unused)
```

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register farmer/customer |
| POST | `/api/auth/login` | — | Login (email+pass or admin shortcut) |
| GET | `/api/auth/me` | 🔒 | Get current user profile |

### Submissions (Farmer Crop Data)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/submissions` | — | List all (supports `?district=&crop=&status=&page=&limit=`) |
| GET | `/api/submissions/:id` | — | Get one |
| POST | `/api/submissions` | 🔒 | Create new submission |
| PUT | `/api/submissions/:id/status` | 🔒 Admin | Verify or reject |
| DELETE | `/api/submissions/:id` | 🔒 Admin | Delete |

### Listings (Marketplace)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/listings` | — | List all (supports `?status=&crop=&province=`) |
| GET | `/api/listings/:id` | — | Get one |
| POST | `/api/listings` | 🔒 | Create listing |
| PUT | `/api/listings/:id` | 🔒 Owner/Admin | Update |
| DELETE | `/api/listings/:id` | 🔒 Owner/Admin | Remove |

### Map Intelligence
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/map/aggregates` | — | District surplus/shortage (`?crop=Rice`) |
| GET | `/api/map/districts` | — | All active districts with status |
| GET | `/api/map/forecast` | — | Projected data (`?crop=Rice&horizon=2`) |
| GET | `/api/map/crops` | — | List of distinct crop types |

### Alerts
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/alerts` | 🔒 | All alerts (`?unread=true`) |
| POST | `/api/alerts` | 🔒 Admin | Create alert |
| PUT | `/api/alerts/:id/read` | 🔒 | Mark one read |
| PUT | `/api/alerts/read-all` | 🔒 | Mark all read |

### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/stats` | 🔒 Admin | KPI dashboard numbers |
| GET | `/api/admin/users` | 🔒 Admin | All users |
| PUT | `/api/admin/users/:id/status` | 🔒 Admin | Approve/suspend user |
| GET | `/api/admin/submissions` | 🔒 Admin | All submissions |
| GET | `/api/admin/activity` | 🔒 Admin | Recent activity feed |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | — | Public count summary |
| GET | `/api/users/me` | 🔒 | Own profile |
| PUT | `/api/users/me` | 🔒 | Update own profile |
| PUT | `/api/users/me/password` | 🔒 | Change password |

---

## Connecting a Real Database

### Option A — Supabase (Recommended)

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** and paste the contents of `database.sql`
3. Go to **Project Settings → API** and copy your keys
4. Update `.env`:
   ```
   DB_MODE=supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```
5. `npm install @supabase/supabase-js`
6. Replace the function bodies in `services/store.js` using the examples in `config/supabase.js`

### Option B — MySQL

1. Create a MySQL database named `agriflow`
2. Run `database.mysql.sql` (coming soon) against it
3. Update `.env`:
   ```
   DB_MODE=mysql
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_pass
   MYSQL_DATABASE=agriflow
   ```
4. `npm install mysql2`
5. Replace function bodies in `services/store.js` using examples in `config/mysql.js`

---

## Default Admin Login

```
Username: admin
Password: admin123
```

POST to `/api/auth/login` with `{ "username": "admin", "password": "admin123" }`

The response includes a `token` — attach it as `Authorization: Bearer <token>` for protected routes.
