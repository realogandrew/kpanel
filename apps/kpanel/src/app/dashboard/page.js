"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const statusColors = { up: "var(--success)", down: "var(--error)", degraded: "var(--warning)", unknown: "var(--text-muted)" };

export default function DashboardPage() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    api("/api/v1/sites")
      .then((data) => setSites(data.sites || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function checkAll() {
    setChecking(true);
    try {
      await api("/api/v1/sites/check-all", { method: "POST" });
      const { sites: next } = await api("/api/v1/sites");
      setSites(next || []);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  }

  async function checkOne(id) {
    try {
      await api(`/api/v1/sites/${id}/check`, { method: "POST" });
      const { sites: next } = await api("/api/v1/sites");
      setSites(next || []);
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <div>Loading sites…</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Sites</h1>
        <button
          type="button"
          onClick={checkAll}
          disabled={checking}
          style={{
            padding: "0.5rem 1rem",
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: checking ? "not-allowed" : "pointer",
          }}
        >
          {checking ? "Checking…" : "Check all"}
        </button>
      </div>

      {sites.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          No sites yet. <Link href="/dashboard/sites/new">Add a site</Link> to monitor.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {sites.map((site) => (
            <li
              key={site._id}
              style={{
                padding: "1rem",
                background: "var(--surface)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{site.name}</strong>
                {site.netlifySiteId && (
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "var(--accent)" }}>Netlify</span>
                )}
                <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>{site.domain}</span>
                <div style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  Status:{" "}
                  <span style={{ color: statusColors[site.lastHealth?.status || "unknown"] }}>
                    {site.lastHealth?.status || "unknown"}
                  </span>
                  {site.lastHealth?.checkedAt && (
                    <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                      (checked {new Date(site.lastHealth.checkedAt).toLocaleString()})
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link
                  href={`/dashboard/sites/${site._id}`}
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
                >
                  Details
                </Link>
                <button
                  type="button"
                  onClick={() => checkOne(site._id)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    color: "var(--text)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Check
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/dashboard/sites/new">+ Add site</Link>
        {" · "}
        <Link href="/dashboard/sites/import-netlify">Import from Netlify</Link>
      </p>
    </div>
  );
}
