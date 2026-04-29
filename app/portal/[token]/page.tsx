"use client";
import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getCategoryList } from "@/lib/emission-calculator";
import { formatTco2e } from "@/lib/utils";

export default function SupplierPortalPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const supplierId   = searchParams.get("supplier") || "";
  const categories   = getCategoryList();

  const [form, setForm] = useState({
    supplierName: "",
    category: "other",
    spendAmount: "",
    currency: "USD",
    year: "2024",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [result, setResult]       = useState<{ tco2e: number; confidence: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    const res = await fetch("/api/portal/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: params.token,
        supplierId,
        ...form,
        spendAmount: parseFloat(form.spendAmount),
        year: parseInt(form.year),
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Submission failed"); setLoading(false); return; }
    setResult(data);
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted && result) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", padding: "1rem" }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, background: "var(--brand-muted)", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", margin: "0 auto 1.5rem",
          }}>✅</div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Data submitted!</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "2rem", lineHeight: 1.6 }}>
            Thank you. Your emissions data has been recorded.
          </p>
          <div className="card" style={{ textAlign: "left" }}>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Calculated emissions</p>
            <p style={{ fontSize: "2.25rem", fontWeight: 800, fontFamily: "Syne", color: "var(--brand)" }}>{formatTco2e(result.tco2e)}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Confidence: <span className={`badge badge-${result.confidence === "high" ? "green" : result.confidence === "medium" ? "yellow" : "red"}`}>{result.confidence}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-2)", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 44, height: 44, background: "var(--brand)", borderRadius: 12,
            display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem",
            boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.375rem" }}>Supplier Emissions Portal</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            You've been invited to submit your emissions data. This helps your customer meet their Scope 3 reporting obligations.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div>
              <label className="label">Your company name *</label>
              <input className="input" value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} placeholder="Your Company Ltd" required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="label">Annual spend with customer *</label>
                <input className="input" type="number" min="0" value={form.spendAmount} onChange={e => setForm({ ...form, spendAmount: e.target.value })} placeholder="500000" required />
              </div>
              <div>
                <label className="label">Currency</label>
                <select className="input" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                  {["USD","EUR","GBP","CAD","AUD","JPY","CNY"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Primary business category *</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Reporting year</label>
              <select className="input" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                {["2024","2023","2022"].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Additional notes (optional)</label>
              <textarea className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any relevant context about your emissions data…" rows={3} style={{ resize: "vertical" }} />
            </div>

            {error && (
              <div style={{ padding: "0.75rem", background: "var(--danger-light)", borderRadius: "var(--radius)", border: "1px solid #fecaca" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--danger)" }}>{error}</p>
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center", padding: "0.75rem" }}>
              {loading ? "Submitting…" : "Submit emissions data"}
            </button>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>
              Data is calculated using GHG Protocol spend-based emission factors and shared with the inviting company only.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}