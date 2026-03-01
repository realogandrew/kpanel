# KPanel

Multi-tenant **website health monitoring** and **content management**. One dashboard to see that all your sites (e.g. on Netlify) are up, run diagnostics, and manage content across them. Built for future licensing and packaged features.

## Repo structure (monorepo)

```
kpanel/
├── apps/
│   ├── kpanel-api/    # Node.js API – tenants, sites, health, content, licensing
│   └── kpanel/        # Next.js UI – dashboard, auth, sites, content
├── docs/              # Architecture and how-to guides
├── package.json       # Root workspace (pnpm)
└── pnpm-workspace.yaml
```

- **kpanel-api**: The “brain” – multi-tenant API with MongoDB. Handles auth (JWT + API keys), tenants, sites, health checks, content, and licensing. Ready to add Netlify integration, payments (e.g. Stripe), and more modules.
- **kpanel**: Web app for logging in, viewing sites, running health checks, and managing content. Points at the API via env.

## Quick start

### Prerequisites

- Node.js 20+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- npm (included with Node) or [pnpm](https://pnpm.io/) for the monorepo

### 1. Install and env

```bash
npm install
```

(Or with pnpm: `pnpm install` — then use `pnpm dev`, `pnpm dev:api`, `pnpm dev:web`.)

- **API**: `cp apps/kpanel-api/.env.example apps/kpanel-api/.env` and set `MONGO_URI`, `JWT_SECRET`. Optionally set `NETLIFY_TOKEN` for future Netlify integration.
- **UI**: `cp apps/kpanel/.env.local.example apps/kpanel/.env.local`. Default `NEXT_PUBLIC_API_URL=http://localhost:3001` is fine for local dev.

**Start MongoDB** (required for login and data). Pick one:

- **Docker:** `docker compose up -d` (from repo root). Uses the default `mongodb://localhost:27017/kpanel`.
- **Local install:** See [docs/mongodb-local-setup.md](docs/mongodb-local-setup.md) for macOS (Homebrew), Windows, and Linux.
- **Atlas:** Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), get a connection string, and set `MONGO_URI` in `apps/kpanel-api/.env`.

### 2. Run

```bash
# Both API and UI (from repo root)
npm run dev

# Or run in two terminals:
npm run dev:api   # API on http://localhost:3001
npm run dev:web   # UI on http://localhost:3000
```

### 3. Use the app

1. Open **http://localhost:3000**
2. **Register** (creates a tenant + first user)
3. **Log in** and go to **Dashboard**
4. **Add a site** (name + domain, e.g. `example.com`)
5. **Check all** or **Check** per site to run health checks and see status + basic diagnostics
6. **Content** – pick a site and add/edit content (pages, posts)

API docs and module layout are in **apps/kpanel-api/README.md**. High-level design is in **docs/architecture.md**.

## Features (current)

- **Multi-tenancy**: Tenants (orgs) with users and API keys; all data scoped by tenant.
- **Sites**: Add domains; optional Netlify site ID for future deploy/status integration.
- **Health**: HTTP check (HEAD request), status (up/down/degraded), last check time and simple diagnostics (status code, response time).
- **Content**: Content entries per site (slug, title, body, type, status). Manage from the UI.
- **Auth**: Register/login (JWT), API keys per tenant for programmatic access.
- **Licensing**: Tenant plan and license model in place; ready to plug in Stripe or other billing.

## Roadmap (ideas)

- Netlify API: list sites, deploy status, trigger deploys.
- Scheduled health checks and alerts (email/Slack).
- Stripe: subscriptions, usage-based billing, license keys.
- More diagnostics: SSL expiry, DNS, response time history.
- Public content API per site (e.g. for headless frontends).
- “Products” / packaged features you can enable per tenant or per site.

## Docs

- [Architecture](docs/architecture.md) – system overview, data model, auth, and how to extend.
- [How to add a new API module](docs/how-to-add-api-module.md) – step-by-step for a new feature in the API.
- [How to add a new UI page](docs/how-to-add-ui-page.md) – add a page and call the API from the KPanel UI.

## License

Private / UNLICENSED. Use and modify for your own projects.
