/**
 * Content CRUD per site. Scoped to tenant.
 */
import { Router } from 'express';
import { Content } from './content.model.js';
import { Site } from '../sites/site.model.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.use(authenticate);

/** GET /content?siteId=xxx - List content for a site */
router.get('/', async (req, res) => {
  const { siteId, type, status } = req.query;
  if (!siteId) return res.status(400).json({ error: 'siteId required' });
  const site = await Site.findOne({ _id: siteId, tenantId: req.tenantId });
  if (!site) return res.status(404).json({ error: 'Site not found' });
  const filter = { siteId, tenantId: req.tenantId };
  if (type) filter.type = type;
  if (status) filter.status = status;
  const items = await Content.find(filter).sort({ updatedAt: -1 });
  res.json({ items });
});

/** POST /content - Create content */
router.post('/', async (req, res) => {
  const { siteId, type, slug, title, body, meta, status } = req.body;
  if (!siteId || !slug) return res.status(400).json({ error: 'siteId and slug required' });
  const site = await Site.findOne({ _id: siteId, tenantId: req.tenantId });
  if (!site) return res.status(404).json({ error: 'Site not found' });
  const content = await Content.create({
    tenantId: req.tenantId,
    siteId,
    type: type || 'page',
    slug,
    title: title || '',
    body: body || '',
    meta: meta || {},
    status: status || 'draft',
    publishedAt: status === 'published' ? new Date() : null,
  });
  res.status(201).json(content);
});

/** GET /content/:id */
router.get('/:id', async (req, res) => {
  const content = await Content.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!content) return res.status(404).json({ error: 'Content not found' });
  res.json(content);
});

/** PATCH /content/:id */
router.patch('/:id', async (req, res) => {
  const content = await Content.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!content) return res.status(404).json({ error: 'Content not found' });
  res.json(content);
});

/** DELETE /content/:id */
router.delete('/:id', async (req, res) => {
  const deleted = await Content.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!deleted) return res.status(404).json({ error: 'Content not found' });
  res.status(204).send();
});

export default router;
