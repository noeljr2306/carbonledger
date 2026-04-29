"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", companyName: "", industry: "other" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const industries = [
    { value: "manufacturing", label: "Manufacturing" },
    { value: "retail", label: "Retail & E-commerce" },
    { value: "logistics", label: "Logistics & Transport" },
    { value: "food_beverage", label: "Food & Beverage" },
    { value: "construction", label: "Construction" },
    { value: "technology", label: "Technology" },
    { value: "financial_services", label: "Financial Services" },
    { value: "other", label: "Other" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "linear-gradient(135deg, #f0fdf4, #f8fafc)" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 44, height: 44, background: "var(--brand)", borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Create your account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Start tracking Scope 3 emissions today</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="label">Your name</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="label">Company name *</label>
                <input className="input" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Acme Corp" required />
              </div>
            </div>
            <div>
              <label className="label">Industry</label>
              <select className="input" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
                {industries.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" required />
            </div>
            <div>
              <label className="label">Password *</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" minLength={8} required />
            </div>
            {error && <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "0.625rem" }}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--brand)", fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}