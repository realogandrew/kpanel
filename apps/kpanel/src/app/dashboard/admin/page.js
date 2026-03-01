"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const statusColors = {
  up: "var(--success)",
  down: "var(--error)",
  degraded: "var(--warning)",
  unknown: "var(--text-muted)",
};

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api("/api/v1/admin/stats"),
      api("/api/v1/admin/tenants"),
      api("/api/v1/admin/sites"),
    ])
      .then(([statsRes, tenantsRes, sitesRes]) => {
        setStats(statsRes);
        setTenants(tenantsRes.tenants || []);
        setSites(sitesRes.sites || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading admin data…</div>;
  if (error) return <div style={{ color: "var(--error)" }}>Error: {error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Platform Admin</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        View all tenants and sites across the platform.
      </p>

      {stats && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: "1rem 1.5rem",
              background: "var(--surface)",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Tenants</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{stats.tenantCount}</div>
          </div>
          <div
            style={{
              padding: "1rem 1.5rem",
              background: "var(--surface)",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Sites</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{stats.siteCount}</div>
          </div>
          <div
            style={{
              padding: "1rem 1.5rem",
              background: "var(--surface)",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Users</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{stats.userCount}</div>
          </div>
        </div>
      )}

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>Tenants</h2>
        {tenants.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No tenants.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {tenants.map((t) => (
              <li
                key={t._id}
                style={{
                  padding: "0.75rem 1rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{t.name}</strong>
                  <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>{t.slug}</span>
                </div>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {t.siteCount ?? 0} sites · {t.userCount ?? 0} users · {t.plan}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>All sites</h2>
        {sites.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No sites.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sites.map((s) => (
              <li
                key={s._id}
                style={{
                  padding: "0.75rem 1rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{s.name}</strong>
                    <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>{s.domain}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: statusColors[s.lastHealth?.status || "unknown"],
                    }}
                  >
                    {s.lastHealth?.status || "unknown"}
                  </span>
                </div>
                {s.tenantId && (
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Tenant: {s.tenantId.name} ({s.tenantId.slug})
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
