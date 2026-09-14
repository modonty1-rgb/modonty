import { PrismaClient } from "@prisma/client";

/**
 * نفس `DATABASE_URL` ونفس السكيما (`shared/prisma/schema/schema.prisma`) — قاعدةٌ واحدة،
 * لا نسخ ولا مزامنة. فالطلب الذي يُنشئه هذا التطبيق يقرؤه الأدمن في نفس اللحظة.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
