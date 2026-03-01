/**
 * Ensures the requested resource belongs to the authenticated tenant.
 * Use after authenticate() when resource has tenantId.
 */
export function requireTenantScope(resourceTenantIdGetter = (req) => req.params.tenantId) {
  return (req, res, next) => {
    const resourceTenantId = resourceTenantIdGetter(req);
    if (!resourceTenantId || String(resourceTenantId) !== String(req.tenantId)) {
      return res.status(403).json({ error: 'Access denied to this resource' });
    }
    next();
  };
}
