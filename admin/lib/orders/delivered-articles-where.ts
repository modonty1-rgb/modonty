import type { Prisma } from "@prisma/client";

/**
 * **ما سُلِّم للعميل في دورته الحاليّة** — المنشورُ له (على مدونتي أو على موقعه) منذ بداية
 * خدمته، لا عمرُه كلُّه: الحصّةُ تخصّ هذه الدورة، وعدُّ مقالات دورةٍ سابقة فيها يجعل المتبقّي
 * سالباً بلا ذنب. يقرؤه كرتُ الطلب ودليلُ العملاء.
 */
export function deliveredArticlesWhere(clientId: string, serviceStartedAt: Date | null): Prisma.ArticleWhereInput {
  return {
    clientId,
    status: { in: ["PUBLISHED", "PUBLISHED_ON_CLIENT_SITE"] },
    ...(serviceStartedAt ? { datePublished: { gte: serviceStartedAt } } : {}),
  };
}
