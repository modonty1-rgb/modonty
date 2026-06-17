import { db } from "@/lib/db";
import { Inbox } from "lucide-react";
import { PlanCards, type DisplayPlan } from "./components/plan-cards";

export const dynamic = "force-dynamic";

// jbrseo's `Plan` collection is the single source of truth for the plans we
// sell. It lives in the same database Prisma is connected to, so we read it
// directly via $runCommandRaw — one row per (country, slug); Plan is tiny so a
// single `find` batch returns everything.
interface PlanDoc {
  country: string; // "SA" | "EG"
  slug: string;
  visible?: boolean;
  displayOrder?: number;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  articlesLabel?: string;
  badge?: string | null;
  featuredBadge?: string | null;
}

interface FindResult {
  cursor?: { firstBatch?: PlanDoc[] };
}

export default async function SubscriptionTiersPage() {
  const res = (await db.$runCommandRaw({
    find: "Plan",
    filter: {},
    batchSize: 1000,
  })) as unknown as FindResult;

  const docs = (res.cursor?.firstBatch ?? []).filter((p) => p.visible !== false);

  // Merge the per-country rows of each plan into one card (SA + EG prices).
  const bySlug = new Map<string, DisplayPlan>();
  for (const p of docs) {
    const plan: DisplayPlan = bySlug.get(p.slug) ?? {
      slug: p.slug,
      name: p.name,
      displayOrder: p.displayOrder ?? 999,
      articlesLabel: p.articlesLabel ?? "",
      badge: p.badge ?? null,
      featuredBadge: p.featuredBadge ?? null,
      SA: null,
      EG: null,
    };

    if (p.country === "SA") {
      plan.SA = { mo: p.priceMonthly, yr: p.priceYearly };
      // SA row drives the descriptive fields (single canonical copy).
      plan.name = p.name;
      plan.displayOrder = p.displayOrder ?? plan.displayOrder;
      plan.articlesLabel = p.articlesLabel ?? plan.articlesLabel;
      plan.badge = p.badge ?? plan.badge;
      plan.featuredBadge = p.featuredBadge ?? plan.featuredBadge;
    } else if (p.country === "EG") {
      plan.EG = { mo: p.priceMonthly, yr: p.priceYearly };
    }

    bySlug.set(p.slug, plan);
  }

  const plans = [...bySlug.values()].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Subscription Tiers</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          الباقات من جبر SEO — المصدر الموثوق · Saudi Arabia + Egypt
        </p>
      </div>

      {plans.length > 0 ? (
        <PlanCards plans={plans} />
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">لا توجد باقات</p>
          <p className="text-muted-foreground mt-1 text-xs">
            لم نجد أي خطة في مجموعة Plan — تأكّد أن جبر SEO عرّف الباقات.
          </p>
        </div>
      )}
    </div>
  );
}
