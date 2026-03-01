# How to add a new UI page in KPanel

This guide shows how to add a new page in the **kpanel** Next.js app and wire it to the API.

## 1. Add a route

Create a folder under `src/app/` for the URL path. For a page at `/dashboard/settings`:

- Create `src/app/dashboard/settings/page.js`.

Export a default React component:

```js
export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      {/* ... */}
    </div>
  );
}
```

If the page should only be available when logged in, it’s already protected when placed under `dashboard/`: the dashboard layout calls `/api/v1/tenants/current` and redirects to login on failure.

## 2. Call the API

Use the shared client in `src/lib/api.js`:

```js
import { api } from '@/lib/api';

// GET
const data = await api('/api/v1/tenants/current');

// POST
await api('/api/v1/alerts', {
  method: 'POST',
  body: JSON.stringify({ name: 'My Alert', type: 'email' }),
});
```

The client adds the JWT from `localStorage` to the `Authorization` header. For server components you’d need to pass the token (e.g. via cookies); the current dashboard pages are client components that call the API from the browser.

## 3. Client component with loading and error

For a page that fetches data on load:

```js
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/api/v1/tenants/current')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div>
      <h1>Settings</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

## 4. Add a link in the dashboard layout

In `src/app/dashboard/layout.js`, add a nav link so the new page is discoverable:

```js
<Link href="/dashboard/settings">Settings</Link>
```

## 5. Forms and mutations

For a form that creates or updates something:

- Keep form state in `useState`.
- On submit, call `api('/api/v1/...', { method: 'POST', body: JSON.stringify(...) })`.
- On success, redirect with `router.push('/dashboard/...')` and optionally `router.refresh()`.
- On failure, set an error state and show it (e.g. under the form).

Example (conceptually same as existing “Add site” / “New content” pages):

```js
const [name, setName] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const router = useRouter();

async function handleSubmit(e) {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    await api('/api/v1/alerts', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    router.push('/dashboard/alerts');
    router.refresh();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

## Checklist

- [ ] New `page.js` under `src/app/...` (and optional `layout.js` if you need a nested layout).
- [ ] Use `api()` from `@/lib/api` for all requests.
- [ ] Add `'use client'` if you use hooks (useState, useEffect, etc.).
- [ ] Link from dashboard layout or another page so the route is reachable.

For new API endpoints, add the corresponding module in **kpanel-api** (see **how-to-add-api-module.md**).
