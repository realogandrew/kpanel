/**
 * Netlify API integration. Uses NETLIFY_TOKEN from env.
 * List sites, get site details, and latest deploy status.
 */
import fetch from 'node-fetch';
import { config } from '../../config/index.js';

const NETLIFY_API = 'https://api.netlify.com/api/v1';

function getHeaders() {
  const token = config.netlifyToken;
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * List sites for the authenticated Netlify account.
 * Returns [] if no token or on error.
 */
export async function listNetlifySites() {
  const headers = getHeaders();
  if (!headers) return [];
  try {
    const res = await fetch(`${NETLIFY_API}/sites?per_page=100`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('[netlify] listNetlifySites error:', err.message);
    return [];
  }
}

/**
 * Get site details from Netlify (name, url, etc.).
 */
export async function getNetlifySite(netlifySiteId) {
  const headers = getHeaders();
  if (!headers || !netlifySiteId) return null;
  try {
    const res = await fetch(`${NETLIFY_API}/sites/${netlifySiteId}`, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('[netlify] getNetlifySite error:', err.message);
    return null;
  }
}

/**
 * Get latest deploy for a Netlify site. Returns { state, published_at, created_at, ... } or null.
 */
export async function getLatestDeploy(netlifySiteId) {
  const headers = getHeaders();
  if (!headers || !netlifySiteId) return null;
  try {
    const res = await fetch(
      `${NETLIFY_API}/sites/${netlifySiteId}/deploys?per_page=1`,
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('[netlify] getLatestDeploy error:', err.message);
    return null;
  }
}

/**
 * Get combined Netlify status for a site: site info + latest deploy state.
 */
export async function getNetlifyStatus(netlifySiteId) {
  const [site, deploy] = await Promise.all([
    getNetlifySite(netlifySiteId),
    getLatestDeploy(netlifySiteId),
  ]);
  if (!site) return null;
  return {
    siteId: site.id,
    name: site.name,
    url: site.ssl_url || site.url,
    adminUrl: site.admin_url,
    latestDeploy: deploy
      ? {
          state: deploy.state,
          publishedAt: deploy.published_at,
          createdAt: deploy.created_at,
          deployUrl: deploy.deploy_ssl_url || deploy.deploy_url,
          branch: deploy.branch,
        }
      : null,
  };
}
