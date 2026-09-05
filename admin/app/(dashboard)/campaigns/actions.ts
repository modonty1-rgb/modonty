"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { campaignSchema, marketDefaults, type CampaignInput } from "./helpers/campaign-schema";

type Result =
  | { success: true; id: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** مَن يسأل ← هل المدخل صحيح ← ثم القاعدة. الترتيب مقصود: التحقّق قبل الحارس يكشف شكل النموذج لمن لا يحقّ له بلوغه. */
async function gate(input: CampaignInput) {
  const auth = await requireAdmin();
  if ("error" in auth) return { fail: { success: false as const, error: auth.error } };

  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fail: {
        success: false as const,
        error: "راجع الحقول المعلّمة بالأحمر.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }
  return { data: parsed.data, userId: auth.userId };
}

/**
 * الوسم فريدٌ في القاعدة، ورسالته تُقال في خانته.
 *
 * `P2002` هو ما يردّه بريزما على كسر الفرادة، وبلا ترجمته تظهر «تعذّر الحفظ» فيظنّ مشتري
 * الإعلانات أن العطل في الاتّصال ويعيد الضغط — بينما العطل وسمٌ استُعمل مرّتين، وهو بالضبط
 * ما تمنعه الفرادة: عميلٌ يصل بوسمٍ يخصّ حملتين نسبتُه تخمين.
 */
function translate(e: unknown): Result {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return {
      success: false,
      error: "وسم الرابط مستعمَل في حملةٍ أخرى.",
      fieldErrors: { utmCampaign: ["هذا الوسم على حملةٍ قائمة — غيّره وإلّا اختلط مَن جاء من أيّهما"] },
    };
  }
  return { success: false, error: "تعذّر الحفظ. جرّب مرّة أخرى." };
}

export async function createCampaign(input: CampaignInput): Promise<Result> {
  const g = await gate(input);
  if (g.fail) return g.fail;

  // العملة تُكتب من السوق لا من الشاشة: قيمةٌ تصل من العميل يمكن العبث بها.
  const market = marketDefaults(g.data.countryCode);

  try {
    const row = await db.adCampaign.create({
      data: {
        ...g.data,
        currency: market.currency,
        createdById: g.userId,
      },
      select: { id: true },
    });
    revalidatePath("/campaigns");
    return { success: true, id: row.id };
  } catch (e) {
    return translate(e);
  }
}

export async function updateCampaign(id: string, input: CampaignInput): Promise<Result> {
  const g = await gate(input);
  if (g.fail) return g.fail;

  const market = marketDefaults(g.data.countryCode);

  try {
    await db.adCampaign.update({
      where: { id },
      data: { ...g.data, currency: market.currency },
      select: { id: true },
    });
    revalidatePath("/campaigns");
    revalidatePath(`/campaigns/${id}`);
    return { success: true, id };
  } catch (e) {
    return translate(e);
  }
}
