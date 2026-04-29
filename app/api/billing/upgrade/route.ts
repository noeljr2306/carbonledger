import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PLANS = {
  free: { name: "Free", price: 0, limit: 50 },
  starter: { name: "Starter", price: 1500, limit: 500 },
  growth: { name: "Growth", price: 4000, limit: 2000 },
  enterprise: { name: "Enterprise", price: 10000, limit: 99999 },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!PLANS[plan as keyof typeof PLANS])
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });
  if (!company)
    return NextResponse.json({ error: "No company" }, { status: 404 });

  await prisma.company.update({
    where: { id: company.id },
    data: { plan },
  });

  return NextResponse.json({
    success: true,
    plan,
    ...PLANS[plan as keyof typeof PLANS],
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  const plan = (company?.plan ?? "free") as keyof typeof PLANS;

  return NextResponse.json({ plan, ...PLANS[plan] });
}
