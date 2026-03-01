/**
 * Auth routes: register, login, JWT, API key management.
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './user.model.js';
import { ApiKey } from './apiKey.model.js';
import { Tenant } from '../tenants/tenant.model.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { config } from '../../config/index.js';

const router = Router();

/** POST /auth/register - Create tenant + first user (simplified) */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, tenantName, tenantSlug } = req.body;
    if (!email || !password || !tenantName || !tenantSlug) {
      return res.status(400).json({ error: 'email, password, tenantName, tenantSlug required' });
    }
    const slug = (tenantSlug || tenantName).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let tenant = await Tenant.findOne({ slug });
    if (tenant) return res.status(400).json({ error: 'Tenant slug already taken' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    tenant = await Tenant.create({ name: tenantName, slug });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      name: name || email,
      tenantId: tenant._id,
      role: 'owner',
    });

    const token = jwt.sign(
      { userId: user._id.toString(), tenantId: tenant._id.toString() },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, isPlatformAdmin: user.isPlatformAdmin },
      tenant: { id: tenant._id, name: tenant.name, slug: tenant.slug },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await User.findOne({ email }).select('+passwordHash').populate('tenantId');
    if (!user || !user.active) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id.toString(), tenantId: user.tenantId._id.toString() },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, isPlatformAdmin: user.isPlatformAdmin },
      tenant: { id: user.tenantId._id, name: user.tenantId.name, slug: user.tenantId.slug },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /auth/me - Current user (requires JWT) */
router.get('/me', authenticate, async (req, res) => {
  if (req.authType !== 'jwt') return res.status(400).json({ error: 'JWT required' });
  const user = await User.findById(req.user._id).populate('tenantId').select('-passwordHash').lean();
  res.json({
    user: { ...user, isPlatformAdmin: user.isPlatformAdmin },
    tenant: user.tenantId,
  });
});

/** POST /auth/api-keys - Create API key (requires JWT) */
router.post('/api-keys', authenticate, async (req, res) => {
  if (req.authType !== 'jwt') return res.status(400).json({ error: 'JWT required' });
  const { name, scopes } = req.body || {};
  const { raw, keyPrefix } = await ApiKey.createKey(req.tenantId, name || 'Default', scopes || []);
  res.status(201).json({ keyPrefix, rawKey: raw, message: 'Store rawKey securely; it will not be shown again.' });
});

/** GET /auth/api-keys - List API keys for tenant */
router.get('/api-keys', authenticate, async (req, res) => {
  const keys = await ApiKey.find({ tenantId: req.tenantId }).select('-keyHash');
  res.json({ keys });
});

export default router;
