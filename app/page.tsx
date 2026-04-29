import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: 60,
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: 34, height: 34, background: "var(--brand)", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(5,150,105,0.35)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.0625rem", letterSpacing: "-0.03em" }}>
            CarbonLedger
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
          <Link href="/login" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>Sign in</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Get started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "7rem 2rem 5rem", textAlign: "center" }}>
        <div className="animate-fade-up" style={{ animationDelay: "0s" }}>
          <span className="badge badge-green" style={{ marginBottom: "1.75rem", display: "inline-flex", gap: "0.375rem" }}>
            <span>⚡</span> GHG Protocol aligned · SEC & CSRD ready
          </span>
        </div>
        <h1 className="animate-fade-up" style={{
          animationDelay: "0.06s", opacity: 0,
          fontSize: "clamp(2.75rem, 6vw, 4.25rem)",
          lineHeight: 1.05, marginBottom: "1.5rem",
          fontFamily: "Syne, sans-serif",
        }}>
          Scope 3 emissions,<br />
          <span style={{
            background: "linear-gradient(135deg, var(--brand) 0%, #0891b2 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>finally automated</span>
        </h1>
        <p className="animate-fade-up" style={{
          animationDelay: "0.12s", opacity: 0,
          fontSize: "1.125rem", color: "var(--text-secondary)",
          lineHeight: 1.75, maxWidth: 520, margin: "0 auto 2.5rem",
        }}>
          Upload supplier spend data, get instant GHG Protocol-aligned emission calculations, and generate audit-ready regulatory reports — no consultants, no spreadsheets.
        </p>
        <div className="animate-fade-up" style={{ animationDelay: "0.18s", opacity: 0, display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" className="btn btn-primary btn-lg">
            Start free — takes 2 min
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Sign in
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{
        maxWidth: 780, margin: "0 auto 5rem", padding: "0 2rem",
      }}>
        <div className="animate-fade-up" style={{
          animationDelay: "0.24s", opacity: 0,
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", overflow: "hidden",
          boxShadow: "var(--shadow)",
        }}>
          {[
            { value: "40+", label: "Emission factors" },
            { value: "GHG", label: "Protocol aligned" },
            { value: "SEC", label: "& CSRD ready" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "1.5rem",
              borderRight: i < 2 ? "1px solid var(--border)" : "none",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.75rem", color: "var(--brand)", marginBottom: "0.25rem" }}>{s.value}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem 8rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }} className="stagger">
          {[
            { icon: "⚡", title: "Instant calculations", desc: "Upload CSV → get tCO₂e per supplier in seconds using real GHG Protocol spend-based emission factors." },
            { icon: "🏭", title: "Supplier portal", desc: "Invite suppliers by email. They submit their own emissions data directly — no back-and-forth spreadsheets." },
            { icon: "📄", title: "Regulatory reports", desc: "One-click export of audit-ready reports aligned to SEC climate rules and EU CSRD / ESRS E1." },
            { icon: "🧮", title: "Smart gap-filling", desc: "Missing supplier data? The algorithm fills gaps using GHG Protocol industry averages automatically." },
          ].map((f) => (
            <div key={f.title} className="card card-hover" style={{ padding: "1.75rem" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--brand-muted)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.375rem", marginBottom: "1rem",
              }}>{f.icon}</div>
              <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem" }}>{f.title}</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}