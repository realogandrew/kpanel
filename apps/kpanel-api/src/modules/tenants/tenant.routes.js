/**
 * Tenant routes. All require authentication; scope by req.tenantId.
 */
import { Router } from 'express';
import { Tenant } from './tenant.model.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.use(authenticate);

/** GET /tenants/current - Current tenant */
router.get('/current', async (req, res) => {
  const tenant = await Tenant.findById(req.tenantId);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json(tenant);
});

/** PATCH /tenants/current - Update current tenant */
router.patch('/current', async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(
    req.tenantId,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json(tenant);
});

export default router;
