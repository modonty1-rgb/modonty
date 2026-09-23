import type { Prisma } from "@prisma/client";

/**
 * **أيُّ طلبٍ يُعدّ إيراداً — شرطٌ واحد تقرؤه شاشاتُ الإيراد كلُّها.**
 *
 * مدفوعٌ (`PAID` — قاعدةُ `shared/lib/payments/collected.ts`: المستردُّ والملغى خارج)،
 * وليس «حساباً لنا» (مدونتي · جبر · بسيطة): مربّعُه يَعِد «يخرج من تقارير الإيراد».
 *
 * كان كلُّ استعلامٍ يكتب شرطه: الشريطُ الشهريّ `status: "PAID"` بلا استثناء الداخليّ،
 * وإجماليّا السوقين بلا شرطٍ أصلاً — فبقي المستردُّ فيهما (مقيسٌ ٢٣ سبتمبر ٢٠٢٦).
 *
 * `NOT: [{ isInternal: true }]` لا `isInternal: false`: الحقلُ غائبٌ في الصفوف القديمة،
 * و`false` في مونغو لا يطابق الغائب.
 */
export const REVENUE_ORDER = {
  status: "PAID",
  NOT: [{ isInternal: true }],
} satisfies Prisma.CheckoutOrderWhereInput;
