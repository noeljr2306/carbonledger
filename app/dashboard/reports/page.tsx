"use client";
import { useEffect, useState } from "react";
import { formatTco2e } from "@/lib/utils";

interface Summary {
  totalTco2e: number;
  rowCount: number;
  byCategory: Record<string, number>;
  bySupplier: Record<string, number>;
}

const REPORTS = [
  {
    key: "ghg",
    title: "GHG Protocol Scope 3 Report",
    desc: "Full value chain emissions breakdown by category and supplier, aligned to GHG Protocol Corporate Standard.",
    badge: "Available",
    badgeColor: "badge-green",
    available: true,
  },
  {
    key: "sec",
    title: "SEC Climate Disclosure",
    desc: "Structured report aligned to SEC climate disclosure rules covering Scope 3 material emissions.",
    badge: "Available",
    badgeColor: "badge-green",
    available: true,
  },
  {
    key: "csrd",
    title: "EU CSRD / ESRS E1",
    desc: "European sustainability reporting directive aligned disclosure with emission intensity metrics.",
    badge: "Coming soon",
    badgeColor: "badge-gray",
    available: false,
  },
  {
    key: "scorecard",
    title: "Supplier Scorecard",
    desc: "Per-supplier emission intensity benchmarks and reduction opportunity analysis.",
    badge: "Coming soon",
    badgeColor: "badge-gray",
    available: false,
  },
];

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    fetch("/api/emissions")
      .then((r) => r.json())
      .then((d) => {
        setSummary(d.summary);
        setLoading(false);
      });
  }, []);

  async function handleDownload(key: string) {
    setDownloading(key);
    try {
      const res = await fetch("/api/reports/pdf?year=2024");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carbonledger-${key}-report-2024.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate report. Please try again.");
    } finally {
      setDownloading("");
    }
  }

  const hasData = !!summary?.rowCount;

  return (
    <div className="animate-fade-up" style={{ maxWidth: 760 }}>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Generate audit-ready Scope 3 disclosure reports</p>
      </div>

      {/* Report cards */}
      <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
        {REPORTS.map((report) => {
          const isDownloading = downloading === report.key;
          const disabled =
            !report.available || loading || !hasData || !!downloading;

          return (
            <div
              key={report.key}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.5rem",
                opacity: report.available ? 1 : 0.7,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    marginBottom: "0.375rem",
                  }}
                >
                  <h3 style={{ fontSize: "0.9375rem" }}>{report.title}</h3>
                  <span className={`badge ${report.badgeColor}`}>
                    {report.badge}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {report.desc}
                </p>
              </div>

              {report.available ? (
                <a
                  href={disabled ? undefined : `/api/reports/pdf?year=2024`}
                  download={`carbonledger-${report.key}-report-2024.html`}
                  className={`btn ${hasData ? "btn-primary" : "btn-secondary"}`}
                  style={{
                    flexShrink: 0,
                    pointerEvents: disabled ? "none" : "auto",
                    opacity: disabled ? 0.5 : 1,
                    textDecoration: "none",
                  }}
                  onClick={() => setDownloading(report.key)}
                >
                  {isDownloading ? "Generating…" : "↓ Download"}
                </a>
              ) : (
                <button
                  className="btn btn-secondary"
                  disabled
                  style={{ flexShrink: 0, opacity: 0.5 }}
                >
                  Coming soon
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview card — only shown when data exists */}
      {!loading && hasData && summary && (
        <div
          className="card animate-fade-up"
          style={{
            background: "var(--brand-muted)",
            border: "1px solid var(--brand-light)",
          }}
        >
          <h3 style={{ fontSize: "0.9375rem", marginBottom: "1rem" }}>
            Report preview — 2024
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                label: "Total Scope 3",
                value: formatTco2e(summary.totalTco2e),
              },
              { label: "Spend rows", value: summary.rowCount.toString() },
              {
                label: "Suppliers",
                value: Object.keys(summary.bySupplier).length.toString(),
              },
              {
                label: "Categories",
                value: Object.keys(summary.byCategory).length.toString(),
              },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontSize: "1.375rem",
                    fontWeight: 800,
                    fontFamily: "Syne",
                    color: "var(--brand)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !hasData && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3rem",
            border: "2px dashed var(--border)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📄</div>
          <h3
            style={{
              fontSize: "1rem",
              marginBottom: "0.375rem",
              color: "var(--text-secondary)",
            }}
          >
            No data to report yet
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Upload spend data first, then come back to generate reports
          </p>
        </div>
      )}
    </div>
  );
}
