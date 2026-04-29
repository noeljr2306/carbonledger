"use client";
import { useState, useRef } from "react";
import Papa from "papaparse";
import { formatTco2e, formatCurrency } from "@/lib/utils";
import { getCategoryList } from "@/lib/emission-calculator";

interface ParsedRow {
  supplierName: string;
  category: string;
  spendAmount: number;
  currency: string;
  year: number;
}

interface ResultRow extends ParsedRow {
  tco2e: number;
  confidence: string;
  factorSource: string;
  category: string;
}

export default function UploadPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const categories = getCategoryList();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setDone(false); setResults([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(result) {
        const parsed: ParsedRow[] = (result.data as Record<string, string>[]).map((row) => ({
          supplierName: row["supplier_name"] || row["Supplier Name"] || row["supplier"] || "",
          category: row["category"] || row["Category"] || "",
          spendAmount: parseFloat(row["spend_amount"] || row["Spend Amount"] || row["spend"] || "0"),
          currency: row["currency"] || row["Currency"] || "USD",
          year: parseInt(row["year"] || row["Year"] || "2024"),
        })).filter(r => r.supplierName && r.spendAmount > 0);

        if (parsed.length === 0) {
          setError("No valid rows found. Check your CSV format below.");
          return;
        }
        setRows(parsed);
      },
      error() { setError("Failed to parse CSV file."); },
    });
  }

  async function handleUpload() {
    if (!rows.length) return;
    setUploading(true); setError("");
    const res = await fetch("/api/emissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Upload failed"); setUploading(false); return; }
    setResults(data.rows);
    setDone(true);
    setUploading(false);
  }

  const totalTco2e = results.reduce((s, r) => s + r.tco2e, 0);

  return (
    <div className="animate-fade-up" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Upload Spend Data</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Upload a CSV of supplier spend data to calculate Scope 3 emissions instantly</p>
      </div>

      {/* Format guide */}
      <div className="card" style={{ marginBottom: "1.5rem", background: "var(--brand-muted, #f0fdf4)" }}>
        <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.75rem" }}>Required CSV format</h3>
        <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.8125rem", background: "var(--surface)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflowX: "auto" }}>
          supplier_name,category,spend_amount,currency,year<br/>
          Acme Steel Co,steel_manufacturing,250000,USD,2024<br/>
          FastShip Ltd,road_freight,80000,USD,2024<br/>
          PackRight Inc,paper_packaging,45000,EUR,2024
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.75rem" }}>
          Category must match one of the GHG Protocol categories. Common ones:{" "}
          <span style={{ fontFamily: "monospace" }}>steel_manufacturing, road_freight, electronics, food_beverage, chemicals, construction</span>
        </p>
      </div>

      {/* Upload area */}
      {!done && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          
          {/* ERP Templates */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.875rem" }}>Download CSV template</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Download a pre-formatted template for your ERP system
            </p>
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              {["generic","netsuite","quickbooks","sap"].map((type) => (
                <a
                  key={type}
                  href={`/api/templates?type=${type}`}
                  className="btn btn-secondary btn-sm"
                  download
                >
                  ↓ {type.charAt(0).toUpperCase() + type.slice(1)}
                </a>
              ))}
            </div>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: "2px dashed var(--border-strong)", borderRadius: "var(--radius)",
              padding: "3rem", textAlign: "center", cursor: "pointer",
              transition: "border-color 0.15s", marginBottom: rows.length ? "1.25rem" : 0,
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) { const dt = new DataTransfer(); dt.items.add(f); fileRef.current!.files = dt.files; handleFile({ target: fileRef.current! } as React.ChangeEvent<HTMLInputElement>); }
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📂</div>
            <p style={{ fontWeight: 500, marginBottom: "0.25rem" }}>Drop CSV here or click to browse</p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Supports .csv files</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: "none" }} />

          {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}

          {rows.length > 0 && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>{rows.length} rows</strong> parsed and ready
                </p>
                <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                  {uploading ? "Calculating…" : `Calculate emissions →`}
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Supplier", "Category", "Spend", "Currency", "Year"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 8).map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "0.5rem 0.75rem" }}>{row.supplierName}</td>
                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", color: "var(--text-secondary)" }}>{row.category}</td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>{formatCurrency(row.spendAmount, row.currency)}</td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>{row.currency}</td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>{row.year}</td>
                      </tr>
                    ))}
                    {rows.length > 8 && (
                      <tr><td colSpan={5} style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>+{rows.length - 8} more rows…</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Results */}
      {done && results.length > 0 && (
        <div className="card animate-fade-up">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>✅ Emissions calculated</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Total: <strong style={{ color: "var(--brand)", fontSize: "1rem" }}>{formatTco2e(totalTco2e)}</strong> across {results.length} rows
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => { setDone(false); setRows([]); setResults([]); if (fileRef.current) fileRef.current.value = ""; }}>
              Upload more
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Supplier", "Category", "Spend", "tCO₂e", "Confidence"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>{row.supplierName}</td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)" }}>{row.category}</td>
                    <td style={{ padding: "0.5rem 0.75rem" }}>{formatCurrency(row.spendAmount, row.currency)}</td>
                    <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", color: "var(--brand)", fontWeight: 600 }}>{formatTco2e(row.tco2e)}</td>
                    <td style={{ padding: "0.5rem 0.75rem" }}>
                      <span className={`badge badge-${row.confidence === "high" ? "green" : row.confidence === "medium" ? "yellow" : "red"}`}>
                        {row.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}