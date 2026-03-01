"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, clearToken } from "@/lib/api";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [tenant, setTenant] = useState(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/v1/auth/me")
      .then((data) => {
        setTenant(data.tenant);
        setIsPlatformAdmin(!!data.user?.isPlatformAdmin);
      })
      .catch(() => {
        clearToken();
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/");
    router.refresh();
  }

  if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/dashboard" style={{ fontWeight: 600 }}>
            KPanel
          </Link>
          {tenant && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{tenant.name}</span>
          )}
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link href="/dashboard">Sites</Link>
            <Link href="/dashboard/content">Content</Link>
            {isPlatformAdmin && (
              <Link href="/dashboard/admin" style={{ color: "var(--accent)" }}>Admin</Link>
            )}
          </nav>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Log out
        </button>
      </header>
      <main style={{ flex: 1, padding: "1.5rem" }}>{children}</main>
    </div>
  );
}
