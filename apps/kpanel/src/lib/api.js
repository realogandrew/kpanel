/**
 * API client for KPanel API. Uses NEXT_PUBLIC_API_URL or /api/proxy for same-origin.
 */

const getBaseUrl = () => {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return process.env.NEXT_PUBLIC_API_URL || "";
};

const CONNECTION_ERROR_MSG =
  "Could not reach the API. Make sure the API is running (e.g. npm run dev:api from the project root).";

export async function api(path, options = {}) {
  const base = getBaseUrl();
  const url = base ? `${base}${path}` : `/api/proxy${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("kpanel_token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    const isConnectionError =
      err?.code === "ECONNREFUSED" ||
      err?.message?.includes("Failed to fetch") ||
      err?.name === "TypeError";
    throw new Error(isConnectionError ? CONNECTION_ERROR_MSG : err?.message || "Network error");
  }
  const data = res.ok ? await res.json().catch(() => ({})) : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export function setToken(token) {
  if (typeof window !== "undefined") localStorage.setItem("kpanel_token", token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("kpanel_token");
}
