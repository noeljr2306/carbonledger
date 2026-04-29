import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "No company" }, { status: 404 });

  const { supplierId } = await req.json();
  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId, companyId: company.id } });
  if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!supplier.email) return NextResponse.json({ error: "Supplier has no email" }, { status: 400 });

  // Generate a unique portal token
  const token = Buffer.from(`${supplierId}:${Date.now()}:${Math.random()}`).toString("base64url");

  await prisma.supplier.update({
    where: { id: supplierId },
    data: { status: "invited", invitedAt: new Date() },
  });

  // In production you'd send an actual email here via Nodemailer
  // For now we return the portal link so you can test it manually
  const portalUrl = `${process.env.NEXTAUTH_URL}/portal/${token}?supplier=${supplierId}`;

  return NextResponse.json({ success: true, portalUrl, message: `Invite sent to ${supplier.email}` });
}