/**
 * Site CRUD and health trigger. All scoped to tenant.
 */
import { Router } from 'express';
import { Site } from './site.model.js';
import { checkSite, checkTenantSites } from '../health/health.service.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.use(authenticate);

/** GET /sites - List sites for tenant */
router.get('/', async (req, res) => {
  const sites = await Site.find({ tenantId: req.tenantId }).sort({ createdAt: -1 });
  res.json({ sites });
});

/** POST /sites - Create site */
router.post('/', async (req, res) => {
  const { name, domain, netlifySiteId, netlifyConfig } = req.body;
  if (!name || !domain) return res.status(400).json({ error: 'name and domain required' });
  const site = await Site.create({
    tenantId: req.tenantId,
    name,
    domain: domain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    netlifySiteId: netlifySiteId || null,
    netlifyConfig: netlifyConfig || {},
  });
  res.status(201).json(site);
});

/** POST /sites/check-all - Run health check for all tenant sites (must be before /:id) */
router.post('/check-all', async (req, res) => {
  try {
    const results = await checkTenantSites(req.tenantId);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /sites/:id - Get one site */
router.get('/:id', async (req, res) => {
  const site = await Site.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!site) return res.status(404).json({ error: 'Site not found' });
  res.json(site);
});

/** PATCH /sites/:id */
router.patch('/:id', async (req, res) => {
  const site = await Site.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!site) return res.status(404).json({ error: 'Site not found' });
  res.json(site);
});

/** POST /sites/:id/check - Run health check for one site */
router.post('/:id/check', async (req, res) => {
  const site = await Site.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!site) return res.status(404).json({ error: 'Site not found' });
  try {
    const result = await checkSite(site._id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
