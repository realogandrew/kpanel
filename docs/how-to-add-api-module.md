# How to add a new API module

This guide walks through adding a new feature (e.g. “Alerts”) to **kpanel-api** so you can replicate the pattern for other features.

## 1. Create the module folder

Under `apps/kpanel-api/src/modules/`, create a folder for your feature, e.g. `alerts`.

```
apps/kpanel-api/src/modules/alerts/
├── alert.model.js    # Mongoose schema
├── alert.routes.js   # Express routes
└── alert.service.js  # Optional: business logic
```

## 2. Define the model

In `alert.model.js`, define a schema that includes **tenantId** so the feature is tenant-scoped.

```js
import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null },
    name: { type: String, required: true },
    type: { type: String, enum: ['email', 'slack'], default: 'email' },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

alertSchema.index({ tenantId: 1 });

export const Alert = mongoose.model('Alert', alertSchema);
```

## 3. Add routes

In `alert.routes.js`, create a router and use the shared **authenticate** middleware. Use `req.tenantId` for all queries.

```js
import { Router } from 'express';
import { Alert } from './alert.model.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const items = await Alert.find({ tenantId: req.tenantId });
  res.json({ items });
});

router.post('/', async (req, res) => {
  const alert = await Alert.create({ ...req.body, tenantId: req.tenantId });
  res.status(201).json(alert);
});

router.get('/:id', async (req, res) => {
  const item = await Alert.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.patch('/:id', async (req, res) => {
  const item = await Alert.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const deleted = await Alert.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;
```

## 4. Register routes in the app

In `apps/kpanel-api/src/app.js`:

1. Import the router:
   ```js
   import alertRoutes from './modules/alerts/alert.routes.js';
   ```

2. Mount it under `/api/v1`:
   ```js
   app.use('/api/v1/alerts', alertRoutes);
   ```

## 5. Optional: add a service

If you have logic that doesn’t belong in the route handler (e.g. sending an email when an alert fires), put it in `alert.service.js` and call it from the routes or from other modules (e.g. health service).

```js
// alert.service.js
import { Alert } from './alert.model.js';

export async function triggerAlertsForSite(tenantId, siteId, payload) {
  const alerts = await Alert.find({ tenantId, siteId, active: true });
  for (const alert of alerts) {
    // e.g. send email or Slack message
  }
}
```

## Checklist

- [ ] New folder under `modules/<name>/`
- [ ] Model with `tenantId` (and indexes if you query by other fields)
- [ ] Routes that call `authenticate` and scope by `req.tenantId`
- [ ] Router mounted in `app.js` at `/api/v1/<name>`
- [ ] Optional service for shared or complex logic

After this, you can add UI in the **kpanel** app that calls these endpoints (see **how-to-add-ui-page.md**).
