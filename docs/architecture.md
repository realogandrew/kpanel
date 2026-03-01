# KPanel architecture

This document describes how the monorepo and the API are structured so you can extend them confidently.

## Overview

- **kpanel-api**: Express app + MongoDB. All tenant-scoped data lives in MongoDB; auth is JWT (browser) or API key (programmatic).
- **kpanel**: Next.js app that talks to the API via `NEXT_PUBLIC_API_URL` or a same-origin proxy. It stores the JWT in `localStorage` and sends it on each request.

Multi-tenancy is enforced by **tenantId**: every site, user, content entry, API key, and license is tied to a tenant. The API resolves the tenant from the JWT or API key and only returns/updates data for that tenant.

## Data model (conceptual)

- **Tenant**: Organization. Has name, slug, plan, limits (e.g. max sites), and optional billing IDs.
- **User**: Belongs to one tenant. Email, password hash, role (owner/admin/member/viewer). Used for dashboard login.
- **ApiKey**: Belongs to one tenant. Hashed key, optional scopes. Used for API access without a user session.
- **Site**: Belongs to one tenant. Domain, optional Netlify site ID, last health result, and diagnostics blob.
- **Content**: Belongs to tenant + site. Slug, title, body, type (page/post/…), status (draft/published).
- **License**: Belongs to one tenant. Plan, Stripe IDs (when you add payments), status, period.

Health checks do not have a separate “HealthCheck” table for now: the last result and a small diagnostics object live on **Site**. You can add a separate collection for history later.

## Auth flow

1. **Register** (`POST /api/v1/auth/register`): Creates a Tenant and first User (role owner), returns JWT.
2. **Login** (`POST /api/v1/auth/login`): Returns JWT.
3. **Dashboard**: UI sends `Authorization: Bearer <JWT>` on each request. API middleware resolves user and `tenantId`.
4. **API keys**: Created via `POST /api/v1/auth/api-keys` (with JWT). Client sends `X-API-Key: kp_xxx` or `Authorization: Bearer kp_xxx`. API hashes the key, finds the key doc, and sets `tenantId` on the request.

All protected routes use the same `authenticate` middleware and then scope queries by `req.tenantId`.

## API layout (kpanel-api)

- **config**: Env-based config (port, Mongo, JWT secret, Netlify token, etc.).
- **db**: MongoDB connection singleton.
- **modules**: One folder per feature (auth, tenants, sites, health, content, licensing). Each can have:
  - `*.model.js`: Mongoose schema.
  - `*.routes.js`: Express router; mounted in `app.js` under `/api/v1/<name>`.
  - `*.service.js`: Business logic (e.g. health checks) if you don’t want it in routes.
- **shared/middleware**: `auth.js` (JWT + API key), `tenantScope.js` (optional extra check that resource belongs to tenant).

Adding a new feature (e.g. “alerts” or “products”) = new folder under `modules`, new routes, and mount in `app.js`. See **how-to-add-api-module.md**.

## UI layout (kpanel)

- **App Router**: `src/app/` – layout, globals, and routes.
- **Pages**: `page.js` for each route; dashboard under `dashboard/` with a shared `layout.js` that fetches tenant and shows nav.
- **API client**: `src/lib/api.js` – `api(path, options)`, `setToken`, `clearToken`. Uses env or proxy so the same code works with a separate API URL or same-origin proxy.

Dashboard routes are protected by the layout: if `/api/v1/tenants/current` fails (no/invalid token), the layout redirects to login.

## Security notes

- **Secrets**: Never commit `.env` / `.env.local`. Use strong `JWT_SECRET` in production.
- **CORS**: API allows origin from config; tighten for production.
- **Rate limiting**: Global rate limit is applied in the API (see `app.js`).
- **API keys**: Stored hashed; raw key is returned only once on create.

## Extending the “brain”

The API is intended as a central brain:

- **More modules**: Add under `modules/` (e.g. `alerts`, `products`, `webhooks`). Keep tenant scoping and use the same auth middleware.
- **Netlify**: Use `NETLIFY_TOKEN` and add a small Netlify client in a service; call it from a new route or from the existing site/health flow to show deploy status or list sites.
- **Payments**: Add Stripe webhooks and update License (and optionally Tenant) from subscription events; enforce limits in middleware or in route handlers.
- **Packaged features**: Add a “Product” or “Feature” model (e.g. name, slug, type). Link to Tenant or Site via an “entitlement” or “subscription” model so you can turn features on/off per tenant or per site.

Keeping one API and one DB with clear tenant boundaries keeps the system simple while you add these pieces.
