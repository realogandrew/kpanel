# KPanel API

Multi-tenant API for website health monitoring and content management. Acts as the "brain" for KPanel: sites, health checks, content, licensing, and future modules.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + API keys (hashed)

## Project structure

```
src/
├── config/           # Environment and app config
├── db/               # MongoDB connection
├── modules/          # Feature modules (each can grow independently)
│   ├── auth/         # Users, login, API keys
│   ├── tenants/      # Organizations (multi-tenancy)
│   ├── sites/        # Domains, Netlify link, last health
│   ├── health/       # Health check service (ping URLs)
│   ├── content/      # Content entries per site
│   ├── licensing/    # Plans, licenses, payment hooks
│   └── admin/        # Platform admin (all tenants/sites)
├── shared/           # Middleware, utils
│   └── middleware/   # auth, tenantScope, requirePlatformAdmin
├── app.js            # Express app and routes
└── index.js          # Entry point
```

## Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`, and optionally `NETLIFY_TOKEN`.
2. Ensure MongoDB is running (local or Atlas).
3. From repo root: `pnpm install` then `pnpm dev:api`, or from this folder: `pnpm install && pnpm dev`.

## Endpoints (v1)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness |
| POST | `/api/v1/auth/register` | No | Register tenant + first user |
| POST | `/api/v1/auth/login` | No | Login, returns JWT |
| GET | `/api/v1/auth/me` | JWT | Current user |
| POST | `/api/v1/auth/api-keys` | JWT | Create API key |
| GET | `/api/v1/auth/api-keys` | JWT | List API keys |
| GET | `/api/v1/tenants/current` | Yes | Current tenant |
| PATCH | `/api/v1/tenants/current` | Yes | Update tenant |
| GET | `/api/v1/sites` | Yes | List sites |
| POST | `/api/v1/sites` | Yes | Create site |
| GET | `/api/v1/sites/:id` | Yes | Get site |
| PATCH | `/api/v1/sites/:id` | Yes | Update site |
| POST | `/api/v1/sites/:id/check` | Yes | Run health check |
| POST | `/api/v1/sites/check-all` | Yes | Check all tenant sites |
| GET | `/api/v1/content?siteId=` | Yes | List content |
| POST | `/api/v1/content` | Yes | Create content |
| GET/PATCH/DELETE | `/api/v1/content/:id` | Yes | Get/update/delete content |
| GET | `/api/v1/licenses/current` | Yes | Current license |
| GET | `/api/v1/admin/tenants` | JWT + platform admin | List all tenants |
| GET | `/api/v1/admin/sites` | JWT + platform admin | List all sites |
| GET | `/api/v1/admin/stats` | JWT + platform admin | Platform-wide counts |

Auth: `Authorization: Bearer <JWT>` or `X-API-Key: kp_xxx` (or `Authorization: Bearer kp_xxx`).

## Platform admin

Users with `isPlatformAdmin: true` can access `/api/v1/admin/*` and see all tenants and sites.

**Default admin (development):** On first startup in development, a platform admin is created automatically so you can log in immediately:

- **Email:** `admin@kpanel.local`
- **Password:** `changeme`

Log in with these in the KPanel UI; the **Admin** link will appear in the nav.

**Custom admin (env):** Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. On startup, that user is created (or promoted) as platform admin. In production you should always set these and use a strong password.

**Promote an existing user (MongoDB):**
```js
db.users.updateOne(
  { email: "your-admin@example.com" },
  { $set: { isPlatformAdmin: true } }
);
```

## Adding new features

1. Add a new folder under `src/modules/<feature>/` with `*.model.js`, `*.routes.js`, and optional `*.service.js`.
2. Register routes in `src/app.js` under `/api/v1/<feature>`.
3. Use `authenticate` middleware and scope by `req.tenantId` for tenant-safe resources.
