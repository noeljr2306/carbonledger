import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatTco2e(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}k tCO2e`;
  if (v >= 1) return `${v.toFixed(2)} tCO2e`;
  return `${(v * 1000).toFixed(1)} kgCO2e`;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: { spendRows: true, suppliers: true },
  });
  if (!company)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || "2024");
  const rows = company.spendRows.filter((r) => r.year === year);
  const total = rows.reduce((s, r) => s + (r.tco2e ?? 0), 0);

  const byCategory: Record<string, number> = {};
  const bySupplier: Record<string, number> = {};
  for (const row of rows) {
    byCategory[row.category] =
      (byCategory[row.category] ?? 0) + (row.tco2e ?? 0);
    bySupplier[row.supplierName] =
      (bySupplier[row.supplierName] ?? 0) + (row.tco2e ?? 0);
  }

  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const topSuppliers = Object.entries(bySupplier)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Inter, sans-serif; color: #09090b; background: #fff; font-size: 13px; line-height: 1.6; }
  .page { padding: 48px; max-width: 800px; margin: 0 auto; }

  /* Header */
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom: 24px; border-bottom: 2px solid #059669; margin-bottom: 32px; }
  .logo   { display:flex; align-items:center; gap:10px; }
  .logo-mark { width:36px; height:36px; background:#059669; border-radius:9px; display:flex; align-items:center; justify-content:center; }
  .logo-name { font-size:18px; font-weight:800; letter-spacing:-0.03em; }
  .header-meta { text-align:right; color:#52525b; font-size:11px; line-height:1.8; }

  /* Title block */
  .title-block { margin-bottom: 32px; }
  .report-label { font-size:10px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#059669; margin-bottom:6px; }
  .report-title { font-size:26px; font-weight:800; letter-spacing:-0.03em; margin-bottom:6px; }
  .report-sub   { color:#52525b; font-size:13px; }

  /* KPI grid */
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:32px; }
  .kpi { background:#f4f4f5; border-radius:10px; padding:14px; }
  .kpi-label { font-size:10px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#71717a; margin-bottom:4px; }
  .kpi-value { font-size:20px; font-weight:800; letter-spacing:-0.04em; color:#059669; }
  .kpi-sub   { font-size:10px; color:#a1a1aa; margin-top:2px; }

  /* Section */
  .section { margin-bottom:28px; }
  .section-title { font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#71717a; margin-bottom:12px; padding-bottom:6px; border-bottom:1px solid #e4e4e7; }

  /* Table */
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; padding:7px 10px; font-size:10px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#71717a; background:#fafafa; border-bottom:1px solid #e4e4e7; }
  td { padding:8px 10px; border-bottom:1px solid #f4f4f5; font-size:12px; }
  tr:last-child td { border-bottom:none; }
  .td-num { text-align:right; font-family:monospace; font-weight:600; color:#059669; }
  .td-bar { width:140px; }
  .bar-bg { background:#f4f4f5; border-radius:3px; height:5px; }
  .bar-fill { background:#059669; border-radius:3px; height:5px; }

  /* Confidence badge */
  .conf { display:inline-block; padding:1px 7px; border-radius:999px; font-size:10px; font-weight:500; }
  .conf-high   { background:#d1fae5; color:#065f46; }
  .conf-medium { background:#fef9c3; color:#854d0e; }
  .conf-low    { background:#fee2e2; color:#991b1b; }

  /* Methodology */
  .methodology { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px; margin-bottom:28px; }
  .methodology p { font-size:11px; color:#166534; line-height:1.7; }

  /* Footer */
  .footer { margin-top:40px; padding-top:16px; border-top:1px solid #e4e4e7; display:flex; justify-content:space-between; color:#a1a1aa; font-size:10px; }

  /* Compliance */
  .compliance { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .comp-item  { background:#fafafa; border:1px solid #e4e4e7; border-radius:8px; padding:10px; }
  .comp-name  { font-size:10px; font-weight:700; letter-spacing:0.04em; margin-bottom:3px; }
  .comp-desc  { font-size:10px; color:#71717a; line-height:1.5; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="logo">
      <div class="logo-mark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <span class="logo-name">CarbonLedger</span>
    </div>
    <div class="header-meta">
      Generated: ${now}<br/>
      Company: ${company.name}<br/>
      Report ID: CL-${year}-${company.id.slice(0, 6).toUpperCase()}
    </div>
  </div>

  <!-- Title -->
  <div class="title-block">
    <div class="report-label">Scope 3 Emissions Report</div>
    <div class="report-title">${company.name}</div>
    <div class="report-sub">GHG Protocol Corporate Value Chain Standard · Fiscal Year ${year}</div>
  </div>

  <!-- KPIs -->
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-label">Total Scope 3</div>
      <div class="kpi-value">${formatTco2e(total)}</div>
      <div class="kpi-sub">All categories combined</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Data rows</div>
      <div class="kpi-value">${rows.length}</div>
      <div class="kpi-sub">Spend records analysed</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Suppliers</div>
      <div class="kpi-value">${Object.keys(bySupplier).length}</div>
      <div class="kpi-sub">Unique in supply chain</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Categories</div>
      <div class="kpi-value">${Object.keys(byCategory).length}</div>
      <div class="kpi-sub">Emission sources</div>
    </div>
  </div>

  <!-- Emissions by category -->
  <div class="section">
    <div class="section-title">Emissions by category</div>
    <table>
      <thead><tr><th>Category</th><th>Breakdown</th><th style="text-align:right">tCO₂e</th><th style="text-align:right">Share</th></tr></thead>
      <tbody>
        ${topCategories
          .map(
            ([cat, val]) => `
        <tr>
          <td>${cat}</td>
          <td class="td-bar"><div class="bar-bg"><div class="bar-fill" style="width:${total > 0 ? Math.round((val / total) * 100) : 0}%"></div></div></td>
          <td class="td-num">${formatTco2e(val)}</td>
          <td class="td-num" style="color:#71717a">${total > 0 ? Math.round((val / total) * 100) : 0}%</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <!-- Top suppliers -->
  <div class="section">
    <div class="section-title">Top emitting suppliers</div>
    <table>
      <thead><tr><th>Supplier</th><th>Breakdown</th><th style="text-align:right">tCO₂e</th><th style="text-align:right">Share</th></tr></thead>
      <tbody>
        ${topSuppliers
          .map(
            ([name, val]) => `
        <tr>
          <td style="font-weight:500">${name}</td>
          <td class="td-bar"><div class="bar-bg"><div class="bar-fill" style="width:${total > 0 ? Math.round((val / total) * 100) : 0}%"></div></div></td>
          <td class="td-num">${formatTco2e(val)}</td>
          <td class="td-num" style="color:#71717a">${total > 0 ? Math.round((val / total) * 100) : 0}%</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <!-- Methodology -->
  <div class="methodology">
    <p><strong>Methodology:</strong> Emissions calculated using the GHG Protocol spend-based method (USEEIO 2024 emission factors). Formula: tCO₂e = (spend_USD × emission_factor_kgCO₂e/USD) ÷ 1000. Missing supplier categories gap-filled using GHG Protocol industry-average factors. Currency conversions applied at period-average exchange rates.</p>
  </div>

  <!-- Regulatory compliance -->
  <div class="section">
    <div class="section-title">Regulatory framework alignment</div>
    <div class="compliance">
      <div class="comp-item">
        <div class="comp-name">SEC Climate Disclosure</div>
        <div class="comp-desc">17 CFR Parts 210, 229 — Scope 3 material emissions disclosure</div>
      </div>
      <div class="comp-item">
        <div class="comp-name">EU CSRD / ESRS E1</div>
        <div class="comp-desc">Corporate Sustainability Reporting Directive — value chain emissions</div>
      </div>
      <div class="comp-item">
        <div class="comp-name">GHG Protocol Scope 3</div>
        <div class="comp-desc">Corporate Value Chain Standard — all 15 Scope 3 categories</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>CarbonLedger · carbonledger.app</span>
    <span>Report ID: CL-${year}-${company.id.slice(0, 6).toUpperCase()} · Confidential</span>
    <span>Generated ${now}</span>
  </div>

</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="scope3-report-${year}-${company.name.replace(/\s+/g, "-")}.html"`,
    },
  });
}
