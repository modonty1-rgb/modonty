import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";

import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/admin-guard";
import { getClients, getClientsStats, ClientFilters } from "./actions/clients-actions";
import { ClientsHeaderWrapper } from "./components/clients-header-wrapper";
import { ClientsTabs } from "./components/clients-tabs";
import { RegenerateAllSeoButton } from "./components/regenerate-all-seo-button";
import { getPlatformDefaults } from "../settings/defaults/actions/defaults-actions";
import { expiredByDateWhere, expiringThisMonthWhere } from "./segment/segments";

function TableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

async function ClientsContent({ filters }: { filters: ClientFilters }) {
  // Authoritative gate BEFORE any data fetch — the proxy is optimistic (trusts the
  // JWT role), so a demoted admin holding a still-valid ADMIN token would slip past
  // it. This fresh DB read stops the fetch, so no client data is ever streamed.
  const gate = await checkAdmin();
  if (gate.status !== "ok") redirect("/login");

  // سقط تبويبُ «مشترِكو jbrseo» (١٧ سبتمبر ٢٠٢٦): تكامُل جبر سيو أُلغي من أوّله،
  // وبقي التبويبُ يعرض ٢٧ صفّاً مرآةً لنظامٍ لم يعد يُستعمل — وفيه بابُ ميلادٍ رابع
  // للعميل يتجاوز الطلب المدفوع. سقط معه `allClientEmails` و`clientByEmail`، ولم
  // يكونا إلّا لإخفاء مَن صار عميلاً من قائمة التحويل.
  //
  // والاستدعاءُ وموضعُه في التفكيك يُحذفان معاً أو لا يُحذفان: إسقاطُ أحدهما وحده
  // يزيح كلَّ ما بعده بصمت — وهو ما أنتج «allClientEmails is not iterable» من قبل.
  //
  // وسقط `getTierConfigs()` (١٩ سبتمبر ٢٠٢٦): كان يُستعلَم في كل فتحةٍ للصفحة عن جدول
  // الباقات المتقاعد، ونتيجتُه تُمرَّر إلى `ClientsTabs` — وهو لم يعد يقبلها منذ سقوط
  // `TierDistribution`، فكان الاستعلامُ ثمناً يُدفع في كل زيارة لقيمةٍ لا يقرؤها أحد،
  // وكسَرَ `tsc` معه (TS2322 على الخاصّيّة الزائدة). وهو المستهلك الوحيد للدالّة.
  const [clients, stats, defaults, expiringThisMonth, overdueRenewals] = await Promise.all([
    getClients(filters),
    getClientsStats(),
    getPlatformDefaults(),
    // Renewals due this calendar month — money queue (same where as the segment list).
    db.client.count({ where: expiringThisMonthWhere() }),
    // ومَن مضت نهايتُه فعلاً: تبويبُ `Expired` يقرأ `subscriptionStatus` ولا أحد يقلبها،
    // فيقول صفراً بينما أربعةٌ متأخّرون — وواحدٌ منهم انتهى قبل هذا الشهر فلا يلتقطه
    // عدّادُ التجديدات أيضاً، فكان ساقطاً من الشاشة كلِّها.
    db.client.count({ where: expiredByDateWhere() }),
  ]);

  return (
    <ClientsHeaderWrapper
      clientCount={clients.length}
      stats={stats}
      expiringThisMonth={expiringThisMonth}
      overdueRenewals={overdueRenewals}
    >
      <div className="mb-3 flex justify-end">
        <RegenerateAllSeoButton clients={clients} />
      </div>
      <ClientsTabs clientsCount={clients.length} clients={clients} defaultLogoUrl={defaults.LOGO} />
    </ClientsHeaderWrapper>
  );
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    hasArticles?: string;
    createdFrom?: string;
    createdTo?: string;
    minArticleCount?: string;
    maxArticleCount?: string;
  }>;
}) {
  const params = await searchParams;
  const filters: ClientFilters = {
    hasArticles:
      params.hasArticles === "yes"
        ? true
        : params.hasArticles === "no"
          ? false
          : undefined,
    createdFrom: params.createdFrom ? new Date(params.createdFrom) : undefined,
    createdTo: params.createdTo ? new Date(params.createdTo) : undefined,
    minArticleCount: params.minArticleCount ? parseInt(params.minArticleCount) : undefined,
    maxArticleCount: params.maxArticleCount ? parseInt(params.maxArticleCount) : undefined,
  };

  return (
    <div className="">
      <Suspense fallback={<TableSkeleton />}>
        <ClientsContent filters={filters} />
      </Suspense>
    </div>
  );
}
