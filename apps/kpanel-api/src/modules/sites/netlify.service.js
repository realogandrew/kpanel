/**
 * Netlify API integration (stub). Expand when NETLIFY_TOKEN is set.
 * Use for: listing sites, deploy status, triggering deploys.
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
    const res = await fetch(`${NETLIFY_API}/sites`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error('[netlify] listNetlifySites error:', err.message);
    return [];
  }
}

/**
 * Get deploy status for a Netlify site ID.
 * Returns null if no token or site not found.
 */
export async function getSiteDeployStatus(netlifySiteId) {
  const headers = getHeaders();
  if (!headers || !netlifySiteId) return null;
  try {
    const res = await fetch(`${NETLIFY_API}/sites/${netlifySiteId}`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return { name: data.name, url: data.ssl_url || data.url, build_status: data.build_settings?.etc };
  } catch (err) {
    console.error('[netlify] getSiteDeployStatus error:', err.message);
    return null;
  }
}
