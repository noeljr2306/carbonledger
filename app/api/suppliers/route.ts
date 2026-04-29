import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) return NextResponse.json({ suppliers: [] });

  const suppliers = await prisma.supplier.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ suppliers });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) return NextResponse.json({ error: "No company" }, { status: 404 });

  const { name, email, category, country } = await req.json();
  if (!name || !category) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supplier = await prisma.supplier.create({
    data: {
      name,
      email,
      category,
      country: country || "US",
      companyId: company.id,
    },
  });

  return NextResponse.json({ supplier }, { status: 201 });
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
  await prisma.supplier.delete({ where: { id, companyId: company.id } });
  return NextResponse.json({ deleted: true });
}