"use client";
import { useEffect, useState } from "react";
import { formatTco2e } from "@/lib/utils";
import Link from "next/link";

interface Summary {
  totalTco2e: number;
  rowCount: number;
  byCategory: Record<string, number>;
  bySupplier: Record<string, number>;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/emissions").then(r => r.json()).then(d => { setSummary(d.summary); setLoading(false); });
  }, []);

  const topSuppliers  = summary ? Object.entries(summary.bySupplier).sort((a,b) => b[1]-a[1]).slice(0,6) : [];
  const topCategories = summary ? Object.entries(summary.byCategory).sort((a,b) => b[1]-a[1]).slice(0,6) : [];
  const hasData       = !!summary?.rowCount;

  const kpis = [
    { label: "Total Scope 3",  value: loading ? null : formatTco2e(summary?.totalTco2e ?? 0), sub: "Calculated emissions",    accent: "var(--brand)",   icon: "🌍" },
    { label: "Spend rows",     value: loading ? null : (summary?.rowCount ?? 0).toString(),   sub: "Data points uploaded",    accent: "#7c3aed",        icon: "📥" },
    { label: "Categories",     value: loading ? null : Object.keys(summary?.byCategory ?? {}).length.toString(), sub: "Emission sources", accent: "var(--info)", icon: "🏷️" },
    { label: "Suppliers",      value: loading ? null : Object.keys(summary?.bySupplier ?? {}).length.toString(), sub: "Unique suppliers",  accent: "var(--warning)", icon: "🏭" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Overview</h1>
          <p>Scope 3 emissions dashboard · Fiscal year 2024</p>
        </div>
        {!hasData && !loading && (
          <Link href="/dashboard/upload" className="btn btn-primary btn-sm">
            Upload first dataset →
          </Link>
        )}
      </div>

      {/* KPIs */}
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem" }}>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 500 }}>{kpi.label}</p>
              <span style={{ fontSize: "1.25rem" }}>{kpi.icon}</span>
            </div>
            {kpi.value === null ? (
              <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: "0.375rem" }} />
            ) : (
              <p style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "Syne", color: kpi.accent, marginBottom: "0.25rem", letterSpacing: "-0.04em" }}>{kpi.value}</p>
            )}
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "2rem" }}>
        <ChartCard title="Top emitting suppliers" data={topSuppliers} loading={loading} hasData={hasData} color="var(--brand)" />
        <ChartCard title="Emissions by category"  data={topCategories} loading={loading} hasData={hasData} color="#7c3aed" />
      </div>

      {/* CTA if empty */}
      {!loading && !hasData && (
        <div className="card animate-fade-up" style={{ textAlign: "center", padding: "4rem 2rem", border: "2px dashed var(--border)" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🌱</div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No emissions data yet</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem", maxWidth: 380, margin: "0 auto 1.5rem" }}>
            Upload a CSV of your supplier spend data to instantly calculate your Scope 3 footprint
          </p>
          <Link href="/dashboard/upload" className="btn btn-primary">Upload spend data →</Link>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, data, loading, hasData, color }: {
  title: string; data: [string, number][]; loading: boolean; hasData: boolean; color: string;
}) {
  const max = data[0]?.[1] ?? 1;
  return (
    <div className="card">
      <h2 style={{ fontSize: "0.9375rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {title}
        {hasData && <span className="badge badge-gray" style={{ fontWeight: 400 }}>{data.length}</span>}
      </h2>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {[80,65,50,40].map((w,i) => <div key={i} className="skeleton" style={{ height: 38, width: `${w}%` }} />)}
        </div>
      ) : !hasData ? (
        <div className="empty-state" style={{ padding: "2rem" }}>
          <div className="empty-state-icon" style={{ fontSize: "2rem" }}>📭</div>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Upload data to see results</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {data.map(([label, value]) => {
            const pct = (value / max) * 100;
            return (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-primary)", maxWidth: "65%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color, fontFamily: "JetBrains Mono, monospace" }}>{formatTco2e(value)}</span>
                </div>
                <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.8s cubic-bezier(.16,1,.3,1)", opacity: 0.85 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}