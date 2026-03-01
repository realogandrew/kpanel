/**
 * Health check service. Pings site URLs and records status + basic diagnostics.
 * Can be extended to use Netlify API for deploy status when NETLIFY_TOKEN is set.
 */
import fetch from 'node-fetch';
import { Site } from '../sites/site.model.js';
import { config } from '../../config/index.js';

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Run a single URL health check (HEAD or GET).
 * @param {string} url - Full URL (e.g. https://example.com)
 * @returns {{ ok: boolean, statusCode?: number, responseTimeMs?: number, message?: string, sslValid?: boolean }}
 */
export async function checkUrl(url) {
  const start = Date.now();
  let normalizedUrl = url;
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    const res = await fetch(normalizedUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });
    const responseTimeMs = Date.now() - start;
    const ok = res.ok;
    return {
      ok,
      statusCode: res.status,
      responseTimeMs,
      message: ok ? 'OK' : `HTTP ${res.status}`,
    };
  } catch (err) {
    const responseTimeMs = Date.now() - start;
    return {
      ok: false,
      statusCode: null,
      responseTimeMs,
      message: err.message || 'Request failed',
    };
  }
}

/**
 * Determine overall status from check result.
 */
function toStatus(result) {
  if (result.ok) return 'up';
  if (result.statusCode >= 500) return 'down';
  if (result.statusCode >= 400) return 'degraded';
  return 'down';
}

/**
 * Check a site by ID and persist lastHealth + diagnostics.
 */
export async function checkSite(siteId) {
  const site = await Site.findById(siteId);
  if (!site) throw new Error('Site not found');

  const url = site.domain.startsWith('http') ? site.domain : `https://${site.domain}`;
  const result = await checkUrl(url);
  const status = toStatus(result);

  const diagnostics = {
    ...site.diagnostics,
    lastCheck: {
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
      message: result.message,
      at: new Date(),
    },
  };

  site.lastHealth = {
    status,
    statusCode: result.statusCode,
    checkedAt: new Date(),
    message: result.message,
  };
  site.diagnostics = diagnostics;
  await site.save();

  return { site, result, status };
}

/**
 * Check all active sites for a tenant.
 */
export async function checkTenantSites(tenantId) {
  const sites = await Site.find({ tenantId, active: true });
  const results = await Promise.allSettled(
    sites.map((s) => checkSite(s._id))
  );
  return results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason?.message }));
}
