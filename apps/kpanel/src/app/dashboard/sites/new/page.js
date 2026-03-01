"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function NewSitePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/v1/sites", {
        method: "POST",
        body: JSON.stringify({ name, domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, "") }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to add site");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Add site</h1>
      <p style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        <Link href="/dashboard/sites/import-netlify">Import from Netlify</Link> to add a site already deployed there.
      </p>
      <form onSubmit={handleSubmit} style={{ maxWidth: "24rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Site name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
          }}
        />
        <input
          type="text"
          placeholder="Domain (e.g. example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
          }}
        />
        {error && <p style={{ color: "var(--error)", fontSize: "0.875rem" }}>{error}</p>}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {loading ? "Adding…" : "Add site"}
          </button>
          <Link
            href="/dashboard"
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text)",
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
