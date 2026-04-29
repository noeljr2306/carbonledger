import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateEmissions,
  EMISSION_FACTORS,
} from "@/lib/emission-calculator";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });
  if (!company)
    return NextResponse.json({ error: "No company" }, { status: 404 });

  const { supplierName, currentCategory, newCategory, spendAmount, currency } =
    await req.json();

  if (!currentCategory || !newCategory || !spendAmount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const current = calculateEmissions({
    spendAmount,
    currency: currency || "USD",
    category: currentCategory,
  });

  const alternative = calculateEmissions({
    spendAmount,
    currency: currency || "USD",
    category: newCategory,
  });

  const savingTco2e = current.tco2e - alternative.tco2e;
  const savingPct = current.tco2e > 0 ? (savingTco2e / current.tco2e) * 100 : 0;
  const currentFactor = EMISSION_FACTORS[currentCategory]?.factor ?? 0.35;
  const alternativeFactor = EMISSION_FACTORS[newCategory]?.factor ?? 0.35;

  return NextResponse.json({
    supplierName,
    current: {
      category: currentCategory,
      tco2e: current.tco2e,
      factor: currentFactor,
    },
    alternative: {
      category: newCategory,
      tco2e: alternative.tco2e,
      factor: alternativeFactor,
    },
    savingTco2e: Math.round(savingTco2e * 1000) / 1000,
    savingPct: Math.round(savingPct * 10) / 10,
    recommendation:
      savingTco2e > 0
        ? `Switching ${supplierName || "this supplier"} to ${newCategory} would reduce emissions by ${Math.abs(savingPct).toFixed(1)}%`
        : `This switch would increase emissions by ${Math.abs(savingPct).toFixed(1)}% — current supplier is cleaner`,
  });
}
