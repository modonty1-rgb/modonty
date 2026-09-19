import { PrismaClient } from "@prisma/client";

import { withConnectionLimits } from "@modonty/shared/lib/prisma-connection-url";

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
    // سقفُ البِركة يُفرض هنا — الرابطُ في المنصّة بلا حدود (shared/lib/prisma-connection-url.ts).
    datasourceUrl: withConnectionLimits(process.env.DATABASE_URL),
    log: ["error"],
  });

/**
 * **الإسنادُ في التطوير وحده — نصُّ توثيق Prisma حرفيّاً.**
 *
 * مثالُهم الرسميّ (prisma.io/docs · «Instantiate singleton PrismaClient … for serverless
 * runtimes») يُبقي الشرط:
 *
 *     if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
 *
 * وعلّتُه إعادةُ التحميل الساخن: «ensure you properly handle a single instance of Prisma
 * in development».
 *
 * وجُرّب إسقاطُ الشرط (١٩ سبتمبر ٢٠٢٦) بحجّة أنّ الـproxy رسمُ وحداتٍ منفصل فيفتح عميلاً
 * ثانياً — ثمّ أُرجع: الحجّةُ **غيرُ مقيسة** (عددُ نسخ `PrismaClient` الفعليّ في الإنتاج لم
 * يُقَس قطّ، وهو مذكورٌ بنصّه في كتاب العائق ضمن «ما بقي غير مؤكَّد»). ومخالفةُ التوثيق
 * على فرضيّةٍ لم تُقَس ليست أفضلَ ممارسة.
 *
 * وما يبرّر إعادةَ النظر: قياسٌ يُظهر أكثرَ من عميلٍ في العمليّة الواحدة على الإنتاج.
 * أمّا سقفُ البِركة فمضبوطٌ أصلاً في `shared/lib/prisma-connection-url.ts`، وهو الحدُّ
 * الفعليُّ لعدد الاتّصالات مهما تعدّدت النسخ.
 */
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
