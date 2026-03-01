"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const slug = tenantSlug || tenantName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { token } = await api("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name: name || email,
          tenantName,
          tenantSlug: slug,
        }),
      });
      setToken(token);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "24rem", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Create account</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Organization name"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="URL slug (e.g. my-org)"
          value={tenantSlug}
          onChange={(e) => setTenantSlug(e.target.value)}
          style={inputStyle}
        />
        {error && <p style={{ color: "var(--error)", fontSize: "0.875rem" }}>{error}</p>}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
        <Link href="/login">Already have an account? Log in</Link>
      </p>
    </div>
  );
}

const inputStyle = {
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
