/**
 * Licensing / plan routes. Read-only for now; hooks for Stripe later.
 */
import { Router } from 'express';
import { License } from './license.model.js';
import { Tenant } from '../tenants/tenant.model.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.use(authenticate);

/** GET /licenses/current - Current tenant's license */
router.get('/current', async (req, res) => {
  let license = await License.findOne({ tenantId: req.tenantId }).sort({ createdAt: -1 });
  if (!license) {
    const tenant = await Tenant.findById(req.tenantId);
    license = { planId: tenant?.plan || 'free', status: 'active', features: {} };
  }
  res.json(license);
});

export default router;
