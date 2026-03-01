/**
 * Platform admin routes. Require JWT + isPlatformAdmin.
 * View all tenants, sites, and high-level stats.
 */
import { Router } from 'express';
import { Tenant } from '../tenants/tenant.model.js';
import { Site } from '../sites/site.model.js';
import { User } from '../auth/user.model.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { requirePlatformAdmin } from '../../shared/middleware/requirePlatformAdmin.js';

const router = Router();

router.use(authenticate);
router.use(requirePlatformAdmin);

/** GET /admin/tenants - List all tenants */
router.get('/tenants', async (req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();
  const counts = await Promise.all(
    tenants.map(async (t) => ({
      sites: await Site.countDocuments({ tenantId: t._id, active: true }),
      users: await User.countDocuments({ tenantId: t._id, active: true }),
    }))
  );
  const tenantsWithCounts = tenants.map((t, i) => ({ ...t, siteCount: counts[i].sites, userCount: counts[i].users }));
  res.json({ tenants: tenantsWithCounts });
});

/** GET /admin/sites - List all sites across tenants */
router.get('/sites', async (req, res) => {
  const sites = await Site.find()
    .populate('tenantId', 'name slug')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ sites });
});

/** GET /admin/stats - Summary counts */
router.get('/stats', async (req, res) => {
  const [tenantCount, siteCount, userCount] = await Promise.all([
    Tenant.countDocuments({ active: true }),
    Site.countDocuments({ active: true }),
    User.countDocuments({ active: true }),
  ]);
  res.json({ tenantCount, siteCount, userCount });
});

export default router;
