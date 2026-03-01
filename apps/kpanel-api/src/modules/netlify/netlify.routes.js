/**
 * Netlify API routes. Require NETLIFY_TOKEN in env.
 * List sites from Netlify account and get deploy status for a site.
 */
import { Router } from 'express';
import { listNetlifySites, getNetlifyStatus } from '../sites/netlify.service.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.use(authenticate);

/** GET /netlify/sites - List sites from connected Netlify account */
router.get('/sites', async (req, res) => {
  const sites = await listNetlifySites();
  const list = sites.map((s) => ({
    id: s.id,
    name: s.name,
    url: s.ssl_url || s.url,
    adminUrl: s.admin_url,
  }));
  res.json({ sites: list });
});

/** GET /netlify/sites/:netlifySiteId/status - Deploy status for a Netlify site */
router.get('/sites/:netlifySiteId/status', async (req, res) => {
  const status = await getNetlifyStatus(req.params.netlifySiteId);
  if (!status) {
    return res.status(404).json({ error: 'Netlify site not found or token invalid' });
  }
  res.json(status);
});

export default router;
