"use server";


import { InvoicePaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getClientSubscriptionsShared } from "@/lib/subscription/get-client-subscriptions";
import { startOfMonth, endOfMonth } from "date-fns";

import { NOT_INTERNAL } from "@/lib/clients/segments";


export async function getDashboardAlerts() {
  try {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);

    /**
     * **الانتهاءُ والحصّةُ من الطلب الساري** (٢٣ سبتمبر ٢٠٢٦ — مصدرٌ واحد): كان التنبيهُ يقرأ
     * `subscriptionEndDate` و`subscriptionStatus` و`articlesPerMonth` من الكرت، و«منتهٍ» فيه
     * `status: EXPIRED` لا يكتبه أحد — فكان فارغاً دائماً والمنتهون الحقيقيّون أحد عشر.
     * والحسابُ الداخليّ خارجُ تنبيه التجديد كما كان.
     */
    // جولةٌ واحدة لكلّ ما لا يعتمد على غيره — كانت ثلاث جولاتٍ متتالية.
    const [subs, names, overduePayments] = await Promise.all([
      // النسخةُ المشتركة: عدّاداتُ الحالة والتجديداتُ تقرأ الجوابَ نفسه في هذا الطلب.
      getClientSubscriptionsShared(NOT_INTERNAL),
      db.client.findMany({ where: NOT_INTERNAL, select: { id: true, name: true }, take: 5000 }),
      // Clients carrying an outstanding invoice. `Client.paymentStatus` is never written
      // OVERDUE by any code path, so filtering on it listed nobody — the invoices are the
      // truth (same rule as the counter, the Accounts page and the segment).
      db.invoice
        .findMany({
          where: {
            NOT: { paymentStatus: InvoicePaymentStatus.PAID },
            OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
          },
          select: { clientId: true },
          take: 500,
        })
        .then((rows) =>
          db.client.findMany({
            where: { AND: [{ id: { in: [...new Set(rows.map((r) => r.clientId))] } }, NOT_INTERNAL] },
            // سقط `paymentStatus` من الانتقاء (١٧ سبتمبر ٢٠٢٦): الصفُّ مُنتقًى أصلاً
            // لأنّ له فاتورةً غيرَ مسدَّدة، فحقلُ الكرت لا يضيف جواباً — كان يقول
            // «مسدَّد» لهم جميعاً.
            select: { id: true, name: true },
            take: 10,
          })
        ),
    ]);
    const nameOf = new Map(names.map((c) => [c.id, c.name]));
    const all = [...subs.values()];
    const expiringSubscriptions = all
      .filter((s) => s.status === "ACTIVE" && s.daysLeft !== null && s.daysLeft >= 0 && s.daysLeft <= 7)
      .sort((a, b) => (a.endsAt?.getTime() ?? 0) - (b.endsAt?.getTime() ?? 0))
      .slice(0, 10)
      .map((s) => ({ id: s.clientId, name: nameOf.get(s.clientId) ?? "—", subscriptionEndDate: s.endsAt }));
    const expiredSubscriptions = all
      .filter((s) => s.status === "EXPIRED")
      .slice(0, 10)
      .map((s) => ({ id: s.clientId, name: nameOf.get(s.clientId) ?? "—", subscriptionStatus: s.status }));

    /**
     * **حدُّ المقالات: استعلامٌ واحد لكلّ العملاء** (١ أكتوبر ٢٠٢٦). كان عدّتين لكلّ عميل
     * (منشور + مجدول) = ٤٠ استعلاماً في الطلب الواحد، وعلى أوّل عشرين عميلاً نشطاً فقط
     * (`slice(0, 20)`) — فعميلٌ بعد العشرين لا يُفحص حدُّه أصلاً.
     */
    const quotaClients = all.filter((s) => s.status === "ACTIVE" && s.articlesPerMonth !== null);
    const monthCounts = quotaClients.length
      ? await db.article.groupBy({
          by: ["clientId"],
          where: {
            clientId: { in: quotaClients.map((s) => s.clientId) },
            OR: [
              { status: "PUBLISHED", datePublished: { gte: startOfCurrentMonth, lte: endOfMonth(now) } },
              { status: "SCHEDULED", scheduledAt: { gte: startOfCurrentMonth, lte: endOfMonth(now) } },
            ],
          },
          _count: { _all: true },
        })
      : [];
    const thisMonthOf = new Map(monthCounts.map((r) => [r.clientId, r._count._all]));
    const clientsAtLimitWithCounts = quotaClients.map((s) => {
      const articlesThisMonth = thisMonthOf.get(s.clientId) ?? 0;
      return {
        id: s.clientId,
        name: nameOf.get(s.clientId) ?? "—",
        articlesPerMonth: s.articlesPerMonth,
        articlesThisMonth,
        isAtLimit: s.articlesPerMonth ? articlesThisMonth >= s.articlesPerMonth : false,
      };
    });

    return {
      expiringSubscriptions,
      overduePayments,
      expiredSubscriptions,
      clientsAtLimit: clientsAtLimitWithCounts.filter((c) => c.isAtLimit),
    };
  } catch (error) {
    console.error("Error fetching dashboard alerts:", error);
    return {
      expiringSubscriptions: [],
      overduePayments: [],
      expiredSubscriptions: [],
      clientsAtLimit: [],
    };
  }
}
