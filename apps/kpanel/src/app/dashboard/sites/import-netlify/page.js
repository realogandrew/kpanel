"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ImportNetlifyPage() {
  const router = useRouter();
  const [netlifySites, setNetlifySites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/v1/netlify/sites")
      .then((data) => setNetlifySites(data.sites || []))
      .catch((err) => setError(err.message || "Could not load Netlify sites. Add NETLIFY_TOKEN to the API .env."))
      .finally(() => setLoading(false));
  }, []);

  async function importSite(netlifySite) {
    setImporting(true);
    setError("");
    try {
      const domain = netlifySite.url ? netlifySite.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : netlifySite.name;
      await api("/api/v1/sites", {
        method: "POST",
        body: JSON.stringify({
          name: netlifySite.name,
          domain: domain || netlifySite.name,
          netlifySiteId: netlifySite.id,
        }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to add site");
    } finally {
      setImporting(false);
    }
  }

  if (loading) return <div>Loading Netlify sites…</div>;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/dashboard" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          ← Back to sites
        </Link>
      </div>
      <h1 style={{ marginBottom: "0.5rem" }}>Import from Netlify</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Add NETLIFY_TOKEN to the API .env to connect. Then pick a site to add to KPanel for monitoring.
      </p>

      {error && (
        <p style={{ color: "var(--error)", marginBottom: "1rem", fontSize: "0.875rem" }}>{error}</p>
      )}

      {netlifySites.length === 0 && !error && (
        <p style={{ color: "var(--text-muted)" }}>No Netlify sites found, or token not configured.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {netlifySites.map((ns) => (
          <li
            key={ns.id}
            style={{
              padding: "1rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              marginBottom: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{ns.name}</strong>
              {ns.url && (
                <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem", fontSize: "0.875rem" }}>
                  {ns.url}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => importSite(ns)}
              disabled={importing}
              style={{
                padding: "0.35rem 0.75rem",
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: importing ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
              }}
            >
              Add to KPanel
            </button>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/dashboard/sites/new">Add site manually instead</Link>
      </p>
    </div>
  );
}
