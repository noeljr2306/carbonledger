import { prisma } from "@/lib/prisma";

export async function log({
  action,
  entity,
  entityId,
  details,
  userId,
  companyId,
}: {
  action: string;
  entity: string;
  entityId: string;
  details?: string;
  userId: string;
  companyId: string;
}) {
  await prisma.auditLog.create({
    data: { action, entity, entityId, details, userId, companyId },
  });
}
