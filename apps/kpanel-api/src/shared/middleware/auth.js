/**
 * Authentication middleware. Supports:
 * - Bearer JWT (user session)
 * - API key in header (X-API-Key or Authorization: Bearer kp_xxx)
 */
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { User } from '../../modules/auth/user.model.js';
import { ApiKey } from '../../modules/auth/apiKey.model.js';

/**
 * Attach req.user and req.tenantId when valid JWT or API key is present.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'] || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

  // API key (starts with kp_)
  if (apiKeyHeader && apiKeyHeader.startsWith('kp_')) {
    try {
      const keyDoc = await ApiKey.findByRawKey(apiKeyHeader);
      if (keyDoc) {
        await ApiKey.updateOne({ _id: keyDoc._id }, { lastUsedAt: new Date() });
        req.tenantId = keyDoc.tenantId._id ?? keyDoc.tenantId;
        req.apiKey = keyDoc;
        req.authType = 'api_key';
        return next();
      }
    } catch (err) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
  }

  // JWT
  if (authHeader?.startsWith('Bearer ') && !apiKeyHeader?.startsWith('kp_')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId).populate('tenantId');
      if (!user || !user.active) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }
      req.user = user;
      req.tenantId = user.tenantId._id ?? user.tenantId;
      req.authType = 'jwt';
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  return res.status(401).json({ error: 'Authentication required' });
}

/**
 * Optional auth: set req.user/req.tenantId if token present, but don't require it.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];

  if (apiKeyHeader?.startsWith('kp_')) {
    try {
      const keyDoc = await ApiKey.findByRawKey(apiKeyHeader);
      if (keyDoc) {
        req.tenantId = keyDoc.tenantId._id ?? keyDoc.tenantId;
        req.apiKey = keyDoc;
        req.authType = 'api_key';
      }
    } catch (_) {}
  } else if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId).populate('tenantId');
      if (user?.active) {
        req.user = user;
        req.tenantId = user.tenantId._id ?? user.tenantId;
        req.authType = 'jwt';
      }
    } catch (_) {}
  }
  next();
}
