import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateEmissions } from "@/lib/emission-calculator";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const { rows } = await req.json() as {
    rows: Array<{
      supplierName: string;
      category: string;
      spendAmount: number;
      currency: string;
      year: number;
    }>;
  };

  if (!rows?.length) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const processed = rows.map((row) => {
    const result = calculateEmissions({
      spendAmount: row.spendAmount,
      currency: row.currency || "USD",
      category: row.category,
    });
    return { ...row, ...result };
  });

  const saved = await prisma.$transaction(
    processed.map((row) =>
      prisma.spendRow.create({
        data: {
          supplierName: row.supplierName,
          category: row.category,
          spendAmount: row.spendAmount,
          currency: row.currency || "USD",
          year: row.year || 2024,
          tco2e: row.tco2e,
          confidence: row.confidence,
          companyId: company.id,
        },
      })
    )
  );

  const totalTco2e = processed.reduce((sum, r) => sum + r.tco2e, 0);

  return NextResponse.json({
    saved: saved.length,
    totalTco2e: Math.round(totalTco2e * 1000) / 1000,
    rows: processed,
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) return NextResponse.json({ rows: [], summary: null });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || "2024");

  const rows = await prisma.spendRow.findMany({
    where: { companyId: company.id, year },
    orderBy: { tco2e: "desc" },
  });

  const totalTco2e = rows.reduce((sum, r) => sum + (r.tco2e ?? 0), 0);

  const byCategory: Record<string, number> = {};
  const bySupplier: Record<string, number> = {};

  for (const row of rows) {
    byCategory[row.category] = (byCategory[row.category] ?? 0) + (row.tco2e ?? 0);
    bySupplier[row.supplierName] = (bySupplier[row.supplierName] ?? 0) + (row.tco2e ?? 0);
  }

  return NextResponse.json({
    rows,
    summary: {
      totalTco2e: Math.round(totalTco2e * 1000) / 1000,
      rowCount: rows.length,
      byCategory,
      bySupplier,
    },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id } = await req.json();
  await prisma.spendRow.delete({ where: { id, companyId: company.id } });
  return NextResponse.json({ deleted: true });
}