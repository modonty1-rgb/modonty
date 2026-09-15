"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import seed from "@modonty/shared/data/commercial-seed.json";

/**
 * يزرع بيانات مسار الدفع الافتراضية — **مرّةً واحدة، وفي قاعدةٍ فارغة فقط**.
 *
 * ── ليش موجود (خالد ١٥ سبتمبر ٢٠٢٦) ──
 * «لما نطلع البرودكشن نعمل لود ديفولت… بوتوم يعمل له ديفولت اذا ما في داتا». قاعدة
 * الإنتاج تبدأ فارغة، وصفحة الباقات لا تُرسم بلا الجداول الستّة كلّها — فبلا هذا الزرّ
 * يُعاد إدخال ١٧ ميزة وثلاث باقات وأسعار سوقين ونصوص ثلاثة أسواق باليد.
 *
 * ── الحارس هنا لا في الواجهة ──
 * إخفاء الزرّ حين توجد بيانات **ليس حماية**: الـaction يُنادى من الشبكة، وزرٌّ مخفيّ
 * لا يمنع نداءً. فالفحص يتكرّر هنا داخل العملية نفسها — وأي صفٍّ واحد في أيٍّ من
 * الجداول الأربعة الجذرية يُلغي الزرع. بيانات الدفع لا تُدهَس بضغطة.
 *
 * ── ولا `upsert` ولا «حدِّث الموجود» ──
 * البذرة تملأ فراغاً، ولا تصالح حالتين. ودمجُها مع بياناتٍ قائمة يخلط أسعاراً مُعتمدة
 * بأخرى من التطوير — وهذا في مسار مالٍ عطلٌ صامت: بطاقةٌ تعرض سعراً وطلبٌ يُنشأ بآخر.
 */

type SeedFeature = {
  name: string;
  description?: string;
  unitLabel?: string;
  isActive?: boolean;
  isHighlighted?: boolean;
  billable?: boolean;
  displayOrder?: number;
};

type SeedPlan = {
  slug: string;
  name: string;
  articlesPerMonth?: number;
  highlights?: string[];
  badge?: string;
  hook?: string;
  ctaText?: string;
  featuredBadge?: string;
  tier?: string;
  theme?: string;
  isPublished?: boolean;
  displayOrder?: number;
  prices?: { market: string; currency: string; monthlyBase: number; isActive?: boolean }[];
  features?: { featureName: string; quantity?: number; note?: string; displayOrder?: number }[];
};

type SeedTerm = {
  paidMonths: number;
  bonusServiceMonths?: number;
  displayOrder?: number;
  isActive?: boolean;
  isRecommended?: boolean;
};

type SeedContent = {
  market: string;
  announcement?: string;
  headline?: string;
  subheadline?: string;
  trustItems?: string[];
  vatNote?: string;
  installmentLabel?: string;
  refundNote?: string;
  paymentFootnote?: string;
  paymentFootnoteSub?: string;
  payMarks?: string[];
  installmentMark?: string;
  teamHeadline?: string;
  teamSubheadline?: string;
};

type SeedFile = {
  version: number;
  exportedAt?: string;
  features: SeedFeature[];
  plans: SeedPlan[];
  terms: SeedTerm[];
  paySectionContent: SeedContent[];
};

const data = seed as SeedFile;

/** ما تحمله البذرة — يُعرض في الواجهة قبل الضغط، فلا يُزرع شيءٌ مجهول. */
export async function getCommercialSeedSummary() {
  return {
    version: data.version,
    exportedAt: data.exportedAt ?? null,
    features: data.features.length,
    plans: data.plans.length,
    prices: data.plans.reduce((n, p) => n + (p.prices?.length ?? 0), 0),
    assignments: data.plans.reduce((n, p) => n + (p.features?.length ?? 0), 0),
    terms: data.terms.length,
    markets: data.paySectionContent.map((c) => c.market),
  };
}

/**
 * هل القاعدة فارغة من بيانات الدفع؟
 *
 * الأربعة الجذرية فقط — الإسنادات والأسعار أبناءٌ لا تقوم بغير آبائها، فوجود صفٍّ
 * يتيمٍ فيها بلا باقة حالةٌ لا تنشأ إلا بعبثٍ مباشر في القاعدة.
 */
export async function isCommercialDataEmpty(): Promise<boolean> {
  const [features, plans, terms, content] = await Promise.all([
    db.commercialFeature.count(),
    db.commercialPlan.count(),
    db.commercialTermPolicy.count(),
    db.paySectionContent.count(),
  ]);
  return features === 0 && plans === 0 && terms === 0 && content === 0;
}

export async function seedCommercialDefaults(): Promise<
  { success: true; created: Record<string, number> } | { success: false; error: string }
> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  // ⚠ الحارس الحقيقيّ — لا يُغني عنه إخفاء الزرّ.
  if (!(await isCommercialDataEmpty())) {
    return {
      success: false,
      error: "القاعدة ليست فارغة — البذرة تُزرع في قاعدةٍ جديدة فقط، ولا تدهس بياناتٍ قائمة.",
    };
  }

  try {
    // المزايا أولاً: الإسنادات تشير إليها بالاسم، فلا بدّ أن توجد قبلها.
    await db.commercialFeature.createMany({
      data: data.features.map((f) => ({
        name: f.name,
        description: f.description ?? null,
        unitLabel: f.unitLabel ?? null,
        isActive: f.isActive ?? true,
        isHighlighted: f.isHighlighted ?? false,
        billable: f.billable ?? false,
        displayOrder: f.displayOrder ?? 0,
      })),
    });

    /** خريطة الاسم → المعرّف المولَّد للتوّ، وبها تُبنى الإسنادات. */
    const featureIdByName = new Map(
      (await db.commercialFeature.findMany({ select: { id: true, name: true } })).map((f) => [f.name, f.id]),
    );

    let prices = 0;
    let assignments = 0;

    for (const p of data.plans) {
      const plan = await db.commercialPlan.create({
        data: {
          slug: p.slug,
          name: p.name,
          articlesPerMonth: p.articlesPerMonth ?? null,
          highlights: p.highlights ?? [],
          badge: p.badge ?? null,
          hook: p.hook ?? null,
          ctaText: p.ctaText ?? null,
          featuredBadge: p.featuredBadge ?? null,
          tier: (p.tier as never) ?? null,
          theme: (p.theme as never) ?? "NEUTRAL",
          isPublished: p.isPublished ?? false,
          displayOrder: p.displayOrder ?? 0,
        },
        select: { id: true },
      });

      if (p.prices?.length) {
        await db.commercialPlanPrice.createMany({
          data: p.prices.map((pr) => ({
            planId: plan.id,
            market: pr.market,
            currency: pr.currency,
            monthlyBase: pr.monthlyBase,
            isActive: pr.isActive ?? true,
          })),
        });
        prices += p.prices.length;
      }

      /**
       * إسنادٌ لميزةٍ غائبة عن المكتبة يُتخطّى ولا يُسقط الزرع كلّه: بذرةٌ حُرّرت بيدٍ
       * وسقط منها سطر لا يجوز أن تترك القاعدة نصفَ ممتلئة — وهي أسوأ من فارغة.
       */
      const rows = (p.features ?? [])
        .map((f) => {
          const featureId = featureIdByName.get(f.featureName);
          if (!featureId) return null;
          return {
            planId: plan.id,
            featureId,
            quantity: f.quantity ?? null,
            note: f.note ?? null,
            displayOrder: f.displayOrder ?? 0,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (rows.length) {
        await db.commercialPlanFeature.createMany({ data: rows });
        assignments += rows.length;
      }
    }

    await db.commercialTermPolicy.createMany({
      data: data.terms.map((t) => ({
        paidMonths: t.paidMonths,
        bonusServiceMonths: t.bonusServiceMonths ?? 0,
        displayOrder: t.displayOrder ?? 0,
        isActive: t.isActive ?? true,
        isRecommended: t.isRecommended ?? false,
      })),
    });

    await db.paySectionContent.createMany({
      data: data.paySectionContent.map((c) => ({
        market: c.market,
        announcement: c.announcement ?? null,
        headline: c.headline ?? null,
        subheadline: c.subheadline ?? null,
        trustItems: c.trustItems ?? [],
        vatNote: c.vatNote ?? null,
        installmentLabel: c.installmentLabel ?? null,
        refundNote: c.refundNote ?? null,
        paymentFootnote: c.paymentFootnote ?? null,
        paymentFootnoteSub: c.paymentFootnoteSub ?? null,
        payMarks: c.payMarks ?? [],
        installmentMark: c.installmentMark ?? null,
        teamHeadline: c.teamHeadline ?? null,
        teamSubheadline: c.teamSubheadline ?? null,
      })),
    });

    const created = {
      features: data.features.length,
      plans: data.plans.length,
      prices,
      assignments,
      terms: data.terms.length,
      content: data.paySectionContent.length,
    };

    // يُقيَّد في السجلّ: زرعُ بيانات الدفع حدثٌ يُسأل عنه لاحقاً «من ومتى».
    await logAction("commercial.seed", {
      /**
       * `Settings` لا `CommercialPlan`: الأخير ليس في `AuditEntity`، والبذرة تملأ ستّة
       * جداول دفعةً واحدة فلا تخصّ صفّاً بعينه — و`entityId` يُترك غائباً لهذا السبب
       * («Null for platform-wide actions»، `lib/audit/log-action.ts:113`).
       */
      entity: "Settings",
      summary: `زرع بيانات الدفع الافتراضية (v${data.version})`,
      metadata: created,
    });

    revalidatePath("/commercial-plans");
    revalidatePath("/commercial-features");
    /**
     * ⚠ كانت ناقصة: البذرة تملأ ستّة جداول يقرؤها البيمنت، ولا تُبطل وسمه — فتنزل
     * الباقات في القاعدة وتبقى صفحة البيع تعرض «الباقات قيد التحديث» بلا أي أثر.
     * وُجد حيّاً على الإنتاج ١٥ سبتمبر ٢٠٢٦ بعد ضغط الزرّ: الجداول 3/17/6/37/3/3
     * وصفحةُ الدفع فاضية. بقيّة أكشنات الكتالوج (٢٢ أكشناً) تناديه منذ البداية.
     */
    await revalidateModontyTag("commercial-catalog");
    return { success: true, created };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message.slice(0, 200) : "تعذّر الزرع" };
  }
}
