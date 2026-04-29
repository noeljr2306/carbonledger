"use client";
import { useEffect, useState } from "react";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: 0,
    period: "",
    limit: "50 rows/month",
    features: [
      "CSV upload",
      "Emission calculations",
      "1 user",
      "Basic dashboard",
    ],
    cta: "Current plan",
    highlight: false,
  },
  {
    key: "starter",
    name: "Starter",
    price: 1500,
    period: "/mo",
    limit: "500 rows/month",
    features: [
      "Everything in Free",
      "Supplier portal",
      "Email invites",
      "PDF reports",
      "5 users",
    ],
    cta: "Upgrade to Starter",
    highlight: false,
  },
  {
    key: "growth",
    name: "Growth",
    price: 4000,
    period: "/mo",
    limit: "2,000 rows/month",
    features: [
      "Everything in Starter",
      "Scenario modeling",
      "Audit trail",
      "ERP templates",
      "Unlimited users",
    ],
    cta: "Upgrade to Growth",
    highlight: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 10000,
    period: "/mo",
    limit: "Unlimited rows",
    features: [
      "Everything in Growth",
      "Dedicated support",
      "Custom integrations",
      "SLA",
      "SSO",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/billing/upgrade")
      .then((r) => r.json())
      .then((d) => {
        setCurrentPlan(d.plan);
        setLoading(false);
      });
  }, []);

  async function handleUpgrade(plan: string) {
    if (plan === "enterprise") {
      window.location.href =
        "mailto:sales@carbonledger.app?subject=Enterprise Plan Enquiry";
      return;
    }
    setUpgrading(plan);
    const res = await fetch("/api/billing/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.success) {
      setCurrentPlan(plan);
      setSuccess(`Upgraded to ${data.name} plan`);
      setTimeout(() => setSuccess(""), 3000);
    }
    setUpgrading("");
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: 960 }}>
      <div className="page-header">
        <h1>Billing & Plans</h1>
        <p>Choose the plan that fits your reporting needs</p>
      </div>

      {success && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            background: "var(--brand-muted)",
            border: "1px solid var(--brand-light)",
            borderRadius: "var(--radius)",
            marginBottom: "1.5rem",
            color: "var(--brand-dark)",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          ✅ {success}
        </div>
      )}

      {/* Current plan banner */}
      {!loading && (
        <div
          className="card"
          style={{
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                marginBottom: "0.25rem",
              }}
            >
              Current plan
            </p>
            <p
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                fontFamily: "Syne",
                textTransform: "capitalize",
              }}
            >
              {currentPlan}
            </p>
          </div>
          <span className="badge badge-green" style={{ fontSize: "0.8125rem" }}>
            Active
          </span>
        </div>
      )}

      {/* Plan grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "1rem",
        }}
      >
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          return (
            <div
              key={plan.key}
              className="card"
              style={{
                position: "relative",
                padding: "1.5rem",
                border: plan.highlight
                  ? "2px solid var(--brand)"
                  : isCurrent
                    ? "2px solid var(--border-strong)"
                    : "1px solid var(--border)",
                boxShadow: plan.highlight
                  ? "0 4px 24px rgba(5,150,105,0.12)"
                  : "var(--shadow-sm)",
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--brand)",
                    color: "white",
                    padding: "0.25rem 0.875rem",
                    borderRadius: 999,
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Most popular
                </div>
              )}

              <div style={{ marginBottom: "1.25rem" }}>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {plan.name}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      fontFamily: "Syne",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {plan.price === 0
                      ? "Free"
                      : `$${plan.price.toLocaleString()}`}
                  </span>
                  {plan.period && (
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "0.25rem",
                  }}
                >
                  {plan.limit}
                </p>
              </div>

              <div className="divider" style={{ margin: "1rem 0" }} />

              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      fontSize: "0.8125rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--brand)",
                        marginTop: "1px",
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`btn ${isCurrent ? "btn-secondary" : plan.highlight ? "btn-primary" : "btn-secondary"}`}
                style={{ width: "100%", justifyContent: "center" }}
                disabled={isCurrent || upgrading === plan.key}
                onClick={() => handleUpgrade(plan.key)}
              >
                {upgrading === plan.key
                  ? "Upgrading…"
                  : isCurrent
                    ? "Current plan"
                    : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Notice */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem 1.25rem",
          background: "var(--surface-3)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}
      >
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
          }}
        >
          <strong>Note:</strong> This is a simplified billing flow for demo
          purposes. In production, plan upgrades would be processed through
          Stripe with invoice generation and payment confirmation. Contact{" "}
          <strong>sales@carbonledger.app</strong> to discuss enterprise
          contracts and custom pricing.
        </p>
      </div>
    </div>
  );
}
