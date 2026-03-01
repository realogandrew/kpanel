"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    api(`/api/v1/content/${params.id}`)
      .then((data) => {
        setItem(data);
        setSlug(data.slug);
        setTitle(data.title);
        setBody(data.body);
        setStatus(data.status);
      })
      .catch(() => router.push("/dashboard/content"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api(`/api/v1/content/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify({ slug, title, body, status }),
      });
      setItem(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !item) return <div>Loading…</div>;

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/dashboard/content" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          ← Back to content
        </Link>
      </div>
      <h1 style={{ marginBottom: "1rem" }}>Edit content</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: "32rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <Link href="/dashboard/content" style={{ padding: "0.5rem 1rem", color: "var(--text-muted)" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
