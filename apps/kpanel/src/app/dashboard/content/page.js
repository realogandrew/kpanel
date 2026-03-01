"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ContentPage() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId");
  const [sites, setSites] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/v1/sites")
      .then((data) => setSites(data.sites || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!siteId) {
      setItems([]);
      return;
    }
    setLoading(true);
    api(`/api/v1/content?siteId=${siteId}`)
      .then((data) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [siteId]);

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Content</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="site" style={{ marginRight: "0.5rem", color: "var(--text-muted)" }}>
          Site:
        </label>
        <select
          id="site"
          value={siteId || ""}
          onChange={(e) => {
            const next = e.target.value;
            const params = new URLSearchParams(searchParams);
            if (next) params.set("siteId", next);
            else params.delete("siteId");
            window.history.replaceState({}, "", next ? `/dashboard/content?${params}` : "/dashboard/content");
          }}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
          }}
        >
          <option value="">Select a site</option>
          {sites.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.domain})
            </option>
          ))}
        </select>
      </div>

      {!siteId && (
        <p style={{ color: "var(--text-muted)" }}>Select a site to view and manage content.</p>
      )}

      {siteId && loading && <p>Loading content…</p>}
      {siteId && !loading && (
        <>
          <p>
            <Link href={`/dashboard/content/new?siteId=${siteId}`}>+ New content</Link>
          </p>
          {items.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No content yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {items.map((item) => (
                <li
                  key={item._id}
                  style={{
                    padding: "0.75rem",
                    background: "var(--surface)",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    marginBottom: "0.5rem",
                  }}
                >
                  <Link href={`/dashboard/content/${item._id}`}>
                    <strong>{item.title || item.slug}</strong>
                  </Link>
                  <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>/{item.slug}</span>
                  <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem", fontSize: "0.875rem" }}>
                    {item.type} · {item.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
