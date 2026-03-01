import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "48rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>KPanel</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Website health monitoring and content management. Multi-tenant.
      </p>
      <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/login">Log in</Link>
        <Link href="/register">Register</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>
    </div>
  );
}
