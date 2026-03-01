"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const statusColors = { up: "var(--success)", down: "var(--error)", degraded: "var(--warning)", unknown: "var(--text-muted)" };

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    api(`/api/v1/sites/${params.id}?netlify=1`)
      .then(setSite)
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  async function runCheck() {
    setChecking(true);
    try {
      const result = await api(`/api/v1/sites/${params.id}/check`, { method: "POST" });
      setSite(result.site);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  }

  if (loading || !site) return <div>Loading…</div>;

  const netlifyStatus = site.netlifyStatus;
  const deployState = netlifyStatus?.latestDeploy?.state;
  const deployStateColors = { ready: "var(--success)", building: "var(--warning)", error: "var(--error)" };

  const lastCheck = site.diagnostics?.lastCheck;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/dashboard" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          ← Back to sites
        </Link>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem 0" }}>{site.name}</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>{site.domain}</p>
        </div>
        <button
          type="button"
          onClick={runCheck}
          disabled={checking}
          style={{
            padding: "0.5rem 1rem",
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {checking ? "Checking…" : "Run check"}
        </button>
      </div>

      <section
        style={{
          padding: "1rem",
          background: "var(--surface)",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>Health</h2>
        <p style={{ margin: 0 }}>
          Status: <span style={{ color: statusColors[site.lastHealth?.status || "unknown"] }}>{site.lastHealth?.status || "unknown"}</span>
        </p>
        {site.lastHealth?.checkedAt && (
          <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Last checked: {new Date(site.lastHealth.checkedAt).toLocaleString()}
          </p>
        )}
        {lastCheck && (
          <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            <li>HTTP status: {lastCheck.statusCode ?? "—"}</li>
            <li>Response time: {lastCheck.responseTimeMs != null ? `${lastCheck.responseTimeMs}ms` : "—"}</li>
            <li>Message: {lastCheck.message ?? "—"}</li>
          </ul>
        )}
      </section>

      {netlifyStatus && (
        <section
          style={{
            padding: "1rem",
            background: "var(--surface)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>Netlify</h2>
          <p style={{ margin: 0 }}>
            Deploy:{" "}
            <span style={{ color: deployStateColors[deployState] || "var(--text-muted)" }}>
              {deployState ?? "—"}
            </span>
          </p>
          {netlifyStatus.latestDeploy?.publishedAt && (
            <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Last published: {new Date(netlifyStatus.latestDeploy.publishedAt).toLocaleString()}
            </p>
          )}
          {netlifyStatus.url && (
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
              <a href={netlifyStatus.url.startsWith("http") ? netlifyStatus.url : `https://${netlifyStatus.url}`} target="_blank" rel="noopener noreferrer">
                Open site
              </a>
              {netlifyStatus.adminUrl && (
                <> · <a href={netlifyStatus.adminUrl} target="_blank" rel="noopener noreferrer">Netlify admin</a></>
              )}
            </p>
          )}
        </section>
      )}

      <p>
        <Link href={`/dashboard/content?siteId=${site._id}`}>View content for this site →</Link>
      </p>
    </div>
  );
}
