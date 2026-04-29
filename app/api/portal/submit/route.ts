import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEmissions } from "@/lib/emission-calculator";

export async function POST(req: NextRequest) {
  const { supplierId, supplierName, category, spendAmount, currency, year } = await req.json();

  if (!supplierId || !spendAmount || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

  const result = calculateEmissions({ spendAmount, currency: currency || "USD", category });

  // Save the spend row linked to this supplier
  await prisma.spendRow.create({
    data: {
      supplierName: supplierName || supplier.name,
      category,
      spendAmount,
      currency: currency || "USD",
      year: year || 2024,
      tco2e: result.tco2e,
      confidence: result.confidence,
      companyId: supplier.companyId,
      supplierId: supplier.id,
    },
  });

  // Mark supplier as responded
  await prisma.supplier.update({
    where: { id: supplierId },
    data: { status: "active", respondedAt: new Date(), emissionData: result.tco2e },
  });

  return NextResponse.json({ tco2e: result.tco2e, confidence: result.confidence });
}