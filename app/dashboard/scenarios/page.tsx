"use client";
import { useState } from "react";
import { getCategoryList } from "@/lib/emission-calculator";
import { formatTco2e } from "@/lib/utils";

interface ScenarioResult {
  supplierName: string;
  current: { category: string; tco2e: number; factor: number };
  alternative: { category: string; tco2e: number; factor: number };
  savingTco2e: number;
  savingPct: number;
  recommendation: string;
}

export default function ScenariosPage() {
  const categories = getCategoryList();
  const [form, setForm] = useState({
    supplierName: "",
    currentCategory: "steel_manufacturing",
    newCategory: "aluminum_manufacturing",
    spendAmount: "",
    currency: "USD",
  });
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ScenarioResult[]>([]);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        spendAmount: parseFloat(form.spendAmount),
      }),
    });
    const data = await res.json();
    setResult(data);
    setHistory((h) => [data, ...h].slice(0, 5));
    setLoading(false);
  }

  const saving = result && result.savingTco2e > 0;
  const neutral = result && Math.abs(result.savingPct) < 1;

  return (
    <div className="animate-fade-up" style={{ maxWidth: 860 }}>
      <div className="page-header">
        <h1>Scenario Modeling</h1>
        <p>
          Model the emission impact of switching suppliers or categories before
          you act
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Form */}
        <div className="card">
          <h2 style={{ fontSize: "1rem", marginBottom: "1.25rem" }}>
            Run a scenario
          </h2>
          <form
            onSubmit={handleRun}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label className="label">Supplier name (optional)</label>
              <input
                className="input"
                value={form.supplierName}
                onChange={(e) =>
                  setForm({ ...form, supplierName: e.target.value })
                }
                placeholder="e.g. Acme Steel Co"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              <div>
                <label className="label">Annual spend *</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  required
                  value={form.spendAmount}
                  onChange={(e) =>
                    setForm({ ...form, spendAmount: e.target.value })
                  }
                  placeholder="250000"
                />
              </div>
              <div>
                <label className="label">Currency</label>
                <select
                  className="input"
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })
                  }
                >
                  {["USD", "EUR", "GBP", "CAD", "AUD"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Current supplier category *</label>
              <select
                className="input"
                value={form.currentCategory}
                onChange={(e) =>
                  setForm({ ...form, currentCategory: e.target.value })
                }
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label} ({c.factor} kgCO₂e/$)
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--text-muted)",
                fontSize: "0.8125rem",
              }}
            >
              <div
                style={{ flex: 1, height: 1, background: "var(--border)" }}
              />
              switch to
              <div
                style={{ flex: 1, height: 1, background: "var(--border)" }}
              />
            </div>

            <div>
              <label className="label">Alternative supplier category *</label>
              <select
                className="input"
                value={form.newCategory}
                onChange={(e) =>
                  setForm({ ...form, newCategory: e.target.value })
                }
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label} ({c.factor} kgCO₂e/$)
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ justifyContent: "center", padding: "0.625rem" }}
            >
              {loading ? "Calculating…" : "Run scenario →"}
            </button>
          </form>
        </div>

        {/* Result */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {result ? (
            <div className="card animate-fade-up">
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius)",
                  background: neutral
                    ? "var(--surface-3)"
                    : saving
                      ? "var(--brand-muted)"
                      : "var(--danger-light)",
                  border: `1px solid ${neutral ? "var(--border)" : saving ? "var(--brand-light)" : "#fecaca"}`,
                  marginBottom: "1.25rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: neutral
                      ? "var(--text-secondary)"
                      : saving
                        ? "var(--brand-dark)"
                        : "var(--danger)",
                    lineHeight: 1.5,
                  }}
                >
                  {neutral ? "⚖️" : saving ? "✅" : "⚠️"}{" "}
                  {result.recommendation}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    background: "var(--surface-2)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginBottom: "0.375rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Current
                  </p>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      fontFamily: "Syne",
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatTco2e(result.current.tco2e)}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {result.current.category}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontFamily: "monospace",
                    }}
                  >
                    {result.current.factor} kgCO₂e/$
                  </p>
                </div>
                <div
                  style={{
                    padding: "1rem",
                    background: saving
                      ? "var(--brand-muted)"
                      : "var(--danger-light)",
                    borderRadius: "var(--radius)",
                    border: `1px solid ${saving ? "var(--brand-light)" : "#fecaca"}`,
                  }}
                >
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.375rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontSize: "0.75rem",
                    }}
                  >
                    Alternative
                  </p>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      fontFamily: "Syne",
                      color: saving ? "var(--brand)" : "var(--danger)",
                    }}
                  >
                    {formatTco2e(result.alternative.tco2e)}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {result.alternative.category}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontFamily: "monospace",
                    }}
                  >
                    {result.alternative.factor} kgCO₂e/$
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: "0.875rem 1rem",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Emission change
                </span>
                <span
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    fontFamily: "Syne",
                    color: saving
                      ? "var(--brand)"
                      : result.savingTco2e < 0
                        ? "var(--danger)"
                        : "var(--text-secondary)",
                  }}
                >
                  {result.savingTco2e > 0 ? "−" : "+"}
                  {formatTco2e(Math.abs(result.savingTco2e))}
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      marginLeft: "0.375rem",
                    }}
                  >
                    ({Math.abs(result.savingPct)}%)
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <div
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 320,
              }}
            >
              <div className="empty-state">
                <div className="empty-state-icon">🔬</div>
                <h3>No scenario run yet</h3>
                <p>
                  Fill in the form and run a scenario to see the emission impact
                </p>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="card">
              <h3
                style={{
                  fontSize: "0.875rem",
                  marginBottom: "0.875rem",
                  color: "var(--text-secondary)",
                }}
              >
                Recent scenarios
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                }}
              >
                {history.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.625rem 0.75rem",
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                        {h.supplierName || "Unnamed"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {h.current.category} → {h.alternative.category}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color:
                          h.savingTco2e > 0 ? "var(--brand)" : "var(--danger)",
                        fontFamily: "monospace",
                      }}
                    >
                      {h.savingTco2e > 0 ? "−" : "+"}
                      {formatTco2e(Math.abs(h.savingTco2e))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
