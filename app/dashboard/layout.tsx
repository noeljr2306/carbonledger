"use client";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: <OverviewIcon /> },
  { href: "/dashboard/upload", label: "Upload Data", icon: <UploadIcon /> },
  { href: "/dashboard/suppliers", label: "Suppliers", icon: <SuppliersIcon /> },
  { href: "/dashboard/scenarios", label: "Scenarios", icon: <ScenariosIcon /> },
  { href: "/dashboard/reports", label: "Reports", icon: <ReportsIcon /> },
  { href: "/dashboard/audit", label: "Audit Trail", icon: <AuditIcon /> },
  { href: "/dashboard/billing", label: "Billing", icon: <BillingIcon /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--surface-2)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 232,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100vh",
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "1.25rem 1.25rem 1rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "var(--brand)",
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(5,150,105,0.3)",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Syne",
                  fontWeight: 800,
                  fontSize: "0.9375rem",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
              >
                CarbonLedger
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                Scope 3 Platform
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "0.875rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <p
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0 0.625rem",
              marginBottom: "0.375rem",
            }}
          >
            Menu
          </p>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.5625rem 0.75rem",
                  borderRadius: "var(--radius)",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--brand)" : "var(--text-secondary)",
                  background: active ? "var(--brand-muted)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  border: active
                    ? "1px solid var(--brand-light)"
                    : "1px solid transparent",
                }}
              >
                <span style={{ opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
                {active && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--brand)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div
          style={{ padding: "0.75rem", borderTop: "1px solid var(--border)" }}
        >
          <button
            className="btn btn-ghost"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              gap: "0.5rem",
            }}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          marginLeft: 232,
          flex: 1,
          padding: "2.5rem",
          minWidth: 0,
          maxWidth: "calc(100vw - 232px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function OverviewIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}
function SuppliersIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function ReportsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function ScenariosIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}
function BillingIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}
