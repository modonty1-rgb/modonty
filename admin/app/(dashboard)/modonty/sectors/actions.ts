"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { LIVE_SECTORS, SECTOR_PICK_LIMIT } from "@modonty/shared/lib/sectors/live-sectors";
import { isCoreClient } from "@modonty/shared/lib/core-client";
import { entertainmentPlaces } from "@modonty/shared/lib/sectors/entertainment-places";

const objectId = z.string().regex(/^[a-f0-9]{24}$/);
const sectorInput = z.enum(LIVE_SECTORS.map((s) => s.slug) as [string, ...string[]]);
const pickInput = z.object({ articleId: objectId, picked: z.boolean() });
const orderInput = z.object({ articleIds: z.array(objectId).min(1).max(50) });

type Result = { success: boolean; error?: string };

async function refresh() {
  revalidatePath("/modonty/sectors", "layout");
  // فوريّ كاختيارات الرئيسية: المحرّر يختار ثم يفتح صفحة القطاع ليرى. صفحة الكورة تقرأ اختياراتها
  // تحت وسم «articles» (`modonty/app/(site)/modonty/football/data/get-football-articles.ts`).
  await revalidateModontyTag("articles", undefined, { immediate: true });
}

/**
 * **اختيارُ مقالٍ لصفحة قطاع — أو رفعُه عنها** (خالد ٢٧ سبتمبر ٢٠٢٦). يُستدعى مربوطاً بقطاعه:
 * `setSectorPick.bind(null, "football")`. المنشورُ وحده يُختار، والجديدُ يُضاف آخرَ الترتيب.
 */
export async function setSectorPick(sector: string, raw: unknown): Promise<Result> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

    const s = sectorInput.safeParse(sector);
    const parsed = pickInput.safeParse(raw);
    if (!s.success || !parsed.success) return { success: false, error: "طلب غير صالح" };
    const { articleId, picked } = parsed.data;

    if (!picked) {
      await db.sectorPick.deleteMany({ where: { sector: s.data, articleId } });
      await refresh();
      return { success: true };
    }

    const article = await db.article.findUnique({ where: { id: articleId }, select: { status: true, clientId: true } });
    if (!article) return { success: false, error: "المقال غير موجود" };
    // مدونتي مسؤولة عن كل القطاعات — مقالاتها وحدها تُختار، ولو وصل الطلب مباشرةً بلا الشاشة.
    if (!(await isCoreClient(article.clientId))) return { success: false, error: "مقالات مدونتي وحدها تُختار لصفحات القطاعات" };
    if (article.status !== "PUBLISHED") return { success: false, error: "المنشور وحده يُختار" };

    const existing = await db.sectorPick.findFirst({ where: { sector: s.data, articleId }, select: { id: true } });
    if (existing) return { success: true };

    const count = await db.sectorPick.count({ where: { sector: s.data } });
    if (count >= SECTOR_PICK_LIMIT) return { success: false, error: `اكتملت الخانات (${SECTOR_PICK_LIMIT}) — أزل مقالاً أوّلاً` };

    const last = await db.sectorPick.findFirst({ where: { sector: s.data }, orderBy: { order: "desc" }, select: { order: true } });
    await db.sectorPick.create({ data: { sector: s.data, articleId, order: (last?.order ?? 0) + 1 } });

    await refresh();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "تعذّر الحفظ" };
  }
}

/** **ترتيبُ اختيارات القطاع كما رتّبها المحرّر** — القائمة كاملةً، فيُكتب لكلٍّ رقمُ مكانه (١، ٢، ٣…). */
export async function reorderSectorPicks(sector: string, raw: unknown): Promise<Result> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

    const s = sectorInput.safeParse(sector);
    const parsed = orderInput.safeParse(raw);
    if (!s.success || !parsed.success) return { success: false, error: "طلب غير صالح" };

    await db.$transaction(
      parsed.data.articleIds.map((articleId, i) =>
        db.sectorPick.updateMany({ where: { sector: s.data, articleId }, data: { order: i + 1 } }),
      ),
    );

    await refresh();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "تعذّر الحفظ" };
  }
}

const heroInput = z.object({
  heroTitle: z.string().trim().max(120),
  heroSubtitle: z.string().trim().max(240),
  heroMediaId: objectId.nullable(),
  heroMobileMediaId: objectId.nullable(),
});

/**
 * **هيرو صفحة القطاع** — صورتا الديسكتوب والجوّال من ميديا مدونتي، والعنوان والسطر تحته (خالد ٢٧ سبتمبر
 * ٢٠٢٦: «نرفع الميديا لايبراري ونظبط باقي الأمور كاملة… ما نشتغل هارد كودد»). الصورة لا تُقبل إلا إن كانت
 * لمدونتي وبنوعها الصحيح، فلا يُربط غلافُ عميلٍ بصفحة قطاع ولو وصل الطلب مباشرةً.
 */
export async function saveSectorHero(sector: string, raw: unknown): Promise<Result> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

    const s = sectorInput.safeParse(sector);
    const parsed = heroInput.safeParse(raw);
    if (!s.success || !parsed.success) return { success: false, error: "طلب غير صالح" };
    const data = parsed.data;

    const checks: Array<[string | null, "SECTOR_HERO" | "SECTOR_HERO_MOBILE", string]> = [
      [data.heroMediaId, "SECTOR_HERO", "صورة الديسكتوب"],
      [data.heroMobileMediaId, "SECTOR_HERO_MOBILE", "صورة الجوّال"],
    ];
    for (const [id, type, label] of checks) {
      if (!id) continue;
      const media = await db.media.findUnique({ where: { id }, select: { clientId: true, type: true } });
      if (!media) return { success: false, error: `${label} غير موجودة` };
      if (!(await isCoreClient(media.clientId))) return { success: false, error: `${label} ليست من ميديا مدونتي` };
      if (media.type !== type) return { success: false, error: `${label} بمقاس غير مقاسها — ارفعها من زرّها` };
    }

    const values = {
      heroTitle: data.heroTitle || null,
      heroSubtitle: data.heroSubtitle || null,
      heroMediaId: data.heroMediaId,
      heroMobileMediaId: data.heroMobileMediaId,
    };
    await db.sectorPage.upsert({ where: { sector: s.data }, create: { sector: s.data, ...values }, update: values });

    revalidatePath("/modonty/sectors", "layout");
    // The page reads its hero under the «pages» tag.
    await revalidateModontyTag("pages", undefined, { immediate: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "تعذّر الحفظ" };
  }
}

const placeInput = z.object({ placeId: z.string().min(3).max(200), hidden: z.boolean() });

/**
 * **إخفاءُ مكانٍ من دليل الترفيه — أو إرجاعُه** (خالد ٢٨ سبتمبر ٢٠٢٦: «ما حاروج لحاجه فيها شبهة»). ما
 * لم يلتقطه فلتر الاستيراد يخفيه المحرّر من هنا. يُقبل المعرّف الموجود في الدليل فقط.
 */
export async function setPlaceHidden(raw: unknown): Promise<Result> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

    const parsed = placeInput.safeParse(raw);
    if (!parsed.success) return { success: false, error: "طلب غير صالح" };
    const { placeId, hidden } = parsed.data;
    if (!entertainmentPlaces.places.some((p) => p.id === placeId)) return { success: false, error: "المكان غير موجود في الدليل" };

    const row = await db.sectorPage.findUnique({ where: { sector: "entertainment" }, select: { hiddenPlaces: true } });
    const current = new Set(row?.hiddenPlaces ?? []);
    if (hidden) current.add(placeId);
    else current.delete(placeId);
    const hiddenPlaces = [...current];
    await db.sectorPage.upsert({ where: { sector: "entertainment" }, create: { sector: "entertainment", hiddenPlaces }, update: { hiddenPlaces } });

    revalidatePath("/modonty/sectors", "layout");
    // The guide reads the hidden list under the «pages» tag, like the hero.
    await revalidateModontyTag("pages", undefined, { immediate: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "تعذّر الحفظ" };
  }
}
