"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function NewContentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const siteId = searchParams.get("siteId");
  const [siteIdInput, setSiteIdInput] = useState(siteId || "");
  const [sites, setSites] = useState([]);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("page");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/api/v1/sites").then((data) => setSites(data.sites || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (siteId) setSiteIdInput(siteId);
  }, [siteId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const sid = siteIdInput || siteId;
    if (!sid) {
      setError("Select a site");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api("/api/v1/content", {
        method: "POST",
        body: JSON.stringify({ siteId: sid, slug, title, body, type, status: "draft" }),
      });
      router.push(`/dashboard/content?siteId=${sid}`);
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to create content");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>New content</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: "32rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Site</label>
          <select
            value={siteIdInput}
            onChange={(e) => setSiteIdInput(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Select site</option>
            {sites.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
            <option value="page">Page</option>
            <option value="post">Post</option>
          </select>
        </div>
        <input
          placeholder="Slug (e.g. about or blog/my-post)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="Body (plain text or HTML)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        {error && <p style={{ color: "var(--error)", fontSize: "0.875rem" }}>{error}</p>}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Creating…" : "Create"}
          </button>
          <Link href="/dashboard/content" style={{ padding: "0.5rem 1rem", color: "var(--text-muted)" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
};

const buttonStyle = {
  padding: "0.5rem 1rem",
  background: "var(--accent)",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
