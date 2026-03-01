/**
 * Requires that the request has an authenticated user with isPlatformAdmin.
 * Use after authenticate() (JWT only; API keys are tenant-scoped and cannot be platform admin).
 */
export function requirePlatformAdmin(req, res, next) {
  if (req.authType !== 'jwt' || !req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!req.user.isPlatformAdmin) {
    return res.status(403).json({ error: 'Platform admin access required' });
  }
  next();
}
