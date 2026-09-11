"use server";

import { CommercialPlanTheme, SubscriptionTier } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isFeatureIconName } from "@modonty/shared/lib/commercial/feature-icon-names";
import { db } from "@/lib/db";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";

function value(form: FormData, key: string): string { return String(form.get(key) ?? "").trim(); }

const optionalText = (max: number) => z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(max).nullable());
const featureSchema = z.object({
  name: z.string().trim().min(1, "اسم الميزة مطلوب").max(80, "اسم الميزة طويل جداً"),
  description: optionalText(300),
  unitLabel: optionalText(20),
  // "none" is the select's empty sentinel (Radix rejects an empty-string item value).
  icon: z.preprocess((v) => (typeof v === "string" && v.trim() && v !== "none" ? v.trim() : null), z.string().nullable().refine((v) => v === null || isFeatureIconName(v), "أيقونة غير موجودة في السجلّ")),
});
function parseFeature(form: FormData) {
  const parsed = featureSchema.safeParse({ name: value(form, "name"), description: value(form, "description"), unitLabel: value(form, "unitLabel"), icon: value(form, "icon") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "تحقق من بيانات الميزة");
  return parsed.data;
}

type Direction = "up" | "down";
/**
 * Swap with the neighbour and return ONLY the rows whose `displayOrder` must change.
 * Normally that is the two swapped rows; rows left with duplicate/gapped orders by the
 * `count()`-based inserts get normalised to 0..n-1 in the same batch. Writing every row
 * blew Prisma's 5s interactive-transaction budget on Atlas (27 features) — measured.
 */
function moveInList(rows: { id: string; displayOrder: number }[], id: string, direction: Direction): { id: string; displayOrder: number }[] {
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error("العنصر غير موجود");
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return [];
  const order = [...rows];
  [order[index], order[target]] = [order[target], order[index]];
  return order.map((row, displayOrder) => ({ id: row.id, displayOrder })).filter((next) => rows.find((row) => row.id === next.id)?.displayOrder !== next.displayOrder);
}

const updatePlanSchema = z.object({
  name: z.string().trim().min(1, "اسم الباقة مطلوب").max(60, "اسم الباقة طويل جداً"),
  description: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(300).nullable()),
  badge: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(30).nullable()),
  tier: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.nativeEnum(SubscriptionTier).nullable()),
  theme: z.nativeEnum(CommercialPlanTheme),
});

/**
 * Read-only name lookup for the breadcrumb (see `breadcrumb-actions.ts`), same
 * unguarded pattern as `getArticleById`/`getClientById`/etc — the plan's own
 * name isn't sensitive, and mutation stays behind `requireFinanceAdmin`.
 * Without this the breadcrumb falls through its default case and shows the
 * raw ObjectId instead of the plan name on `/commercial-plans/[id]`.
 */
export async function getCommercialPlanName(id: string): Promise<string | null> {
  const plan = await db.commercialPlan.findUnique({ where: { id }, select: { name: true } });
  return plan?.name ?? null;
}

export async function createCommercialPlan(form: FormData) {
  await requireFinanceAdmin();
  const name = value(form, "name");
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "plan";
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
  const sa = Number(value(form, "sa"));
  const eg = Number(value(form, "eg"));
  const articlesPerMonth = Number(value(form, "articlesPerMonth"));
  if (!name || !slug || !Number.isInteger(sa) || sa < 0 || !Number.isInteger(eg) || eg < 0 || !Number.isInteger(articlesPerMonth) || articlesPerMonth < 0) throw new Error("تحقق من الاسم والأسعار وعدد المقالات.");

  await db.commercialPlan.create({ data: {
    name, slug, articlesPerMonth, highlights: [], displayOrder: await db.commercialPlan.count(),
    prices: { create: [{ market: "SA", currency: "SAR", monthlyBase: sa }, { market: "EG", currency: "EGP", monthlyBase: eg }] },
  }});
  revalidatePath("/commercial-plans");
}

export async function updateCommercialPlan(id: string, form: FormData) {
  await requireFinanceAdmin();
  const parsed = updatePlanSchema.safeParse({ name: value(form, "name"), description: value(form, "description"), badge: value(form, "badge"), tier: value(form, "tier"), theme: value(form, "theme") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "تحقق من بيانات الباقة");
  await db.commercialPlan.update({ where: { id }, data: { name: parsed.data.name, description: parsed.data.description, badge: parsed.data.badge, tier: parsed.data.tier, theme: parsed.data.theme } });
  revalidatePath("/commercial-plans"); revalidatePath(`/commercial-plans/${id}`);
}

export async function setCommercialPlanPublished(id: string, isPublished: boolean) {
  await requireFinanceAdmin();
  if (isPublished) {
    const plan = await db.commercialPlan.findUnique({ where: { id }, select: { tier: true } });
    if (!plan?.tier) throw new Error("حدّد فئة الاشتراك قبل النشر");
    const conflict = await db.commercialPlan.findFirst({ where: { id: { not: id }, isPublished: true, tier: plan.tier }, select: { name: true } });
    if (conflict) throw new Error(`الفئة مستعملة في باقة «${conflict.name}» المنشورة`);
  }
  await db.commercialPlan.update({ where: { id }, data: { isPublished } });
  revalidatePath("/commercial-plans"); revalidatePath(`/commercial-plans/${id}`);
}

export async function updateCommercialPlanPrice(id: string, form: FormData) {
  await requireFinanceAdmin();
  const amount = Number(form.get("amount"));
  if (!Number.isInteger(amount) || amount < 0) throw new Error("سعر غير صحيح");
  await db.commercialPlanPrice.update({ where: { id }, data: { monthlyBase: amount } });
  revalidatePath("/commercial-plans"); revalidatePath(`/commercial-plans/${String(form.get("planId"))}`);
}

export async function updateCommercialPlanMarketPrices(planId: string, form: FormData) {
  await requireFinanceAdmin();
  const sa = Number(value(form, "sa")); const eg = Number(value(form, "eg"));
  const articlesPerMonth = Number(value(form, "articlesPerMonth"));
  if (!Number.isInteger(sa) || sa < 0 || !Number.isInteger(eg) || eg < 0 || !Number.isInteger(articlesPerMonth) || articlesPerMonth < 0) throw new Error("تحقق من السعر وعدد المقالات");
  await db.$transaction([
    db.commercialPlanPrice.updateMany({ where: { planId, market: "SA" }, data: { monthlyBase: sa } }),
    db.commercialPlanPrice.updateMany({ where: { planId, market: "EG" }, data: { monthlyBase: eg } }),
    db.commercialPlan.update({ where: { id: planId }, data: { articlesPerMonth } }),
  ]);
  revalidatePath("/commercial-plans");
}

/** One duration policy applies to every plan — see PAY-Q3. No planId here on purpose. */
export async function addCommercialTermPolicy(form: FormData) {
  await requireFinanceAdmin();
  const paidMonths = Number(form.get("paidMonths")); const bonusServiceMonths = Number(form.get("bonusMonths"));
  if (!Number.isInteger(paidMonths) || paidMonths < 1 || !Number.isInteger(bonusServiceMonths) || bonusServiceMonths < 0) throw new Error("مدة غير صحيحة");
  await db.commercialTermPolicy.create({ data: { paidMonths, bonusServiceMonths, displayOrder: paidMonths } });
  revalidatePath("/commercial-plans");
}

export async function updateCommercialTermPolicy(id: string, form: FormData) {
  await requireFinanceAdmin();
  const paidMonths = Number(form.get("paidMonths")); const bonusServiceMonths = Number(form.get("bonusMonths"));
  if (!Number.isInteger(paidMonths) || paidMonths < 1 || !Number.isInteger(bonusServiceMonths) || bonusServiceMonths < 0) throw new Error("مدة غير صحيحة");
  await db.commercialTermPolicy.update({ where: { id }, data: { paidMonths, bonusServiceMonths, displayOrder: paidMonths } });
  revalidatePath("/commercial-plans");
}

export async function deleteCommercialTermPolicy(id: string) {
  await requireFinanceAdmin();
  const activeCount = await db.commercialTermPolicy.count({ where: { isActive: true } });
  const target = await db.commercialTermPolicy.findUnique({ where: { id }, select: { isActive: true } });
  if (target?.isActive && activeCount <= 1) throw new Error("لا يمكن حذف آخر مدة نشطة — أضِف مدة بديلة أولاً");
  await db.commercialTermPolicy.delete({ where: { id } });
  revalidatePath("/commercial-plans");
}

export async function createCommercialFeature(form: FormData) {
  await requireFinanceAdmin();
  const data = parseFeature(form);
  await db.commercialFeature.create({ data: { ...data, displayOrder: await db.commercialFeature.count() } });
  revalidatePath("/commercial-features");
}

export async function updateCommercialFeature(id: string, form: FormData) {
  await requireFinanceAdmin();
  await db.commercialFeature.update({ where: { id }, data: parseFeature(form) });
  revalidatePath("/commercial-features");
  revalidatePath("/commercial-plans");
}

// ── Ordering (PAY-A7): what the /pay page shows first is decided here, not by creation date.
export async function moveCommercialPlan(id: string, direction: Direction) {
  await requireFinanceAdmin();
  const rows = await db.commercialPlan.findMany({ select: { id: true, displayOrder: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  const writes = moveInList(rows, id, direction);
  if (writes.length) await db.$transaction(writes.map((w) => db.commercialPlan.update({ where: { id: w.id }, data: { displayOrder: w.displayOrder } })));
  revalidatePath("/commercial-plans");
}

export async function moveCommercialFeature(id: string, direction: Direction) {
  await requireFinanceAdmin();
  const rows = await db.commercialFeature.findMany({ select: { id: true, displayOrder: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  const writes = moveInList(rows, id, direction);
  if (writes.length) await db.$transaction(writes.map((w) => db.commercialFeature.update({ where: { id: w.id }, data: { displayOrder: w.displayOrder } })));
  revalidatePath("/commercial-features");
  revalidatePath("/commercial-plans");
}

export async function moveCommercialPlanFeature(id: string, planId: string, direction: Direction) {
  await requireFinanceAdmin();
  const rows = await db.commercialPlanFeature.findMany({ where: { planId }, select: { id: true, displayOrder: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  const writes = moveInList(rows, id, direction);
  if (writes.length) await db.$transaction(writes.map((w) => db.commercialPlanFeature.update({ where: { id: w.id }, data: { displayOrder: w.displayOrder } })));
  revalidatePath(`/commercial-plans/${planId}`);
  revalidatePath("/commercial-plans");
}

export async function setCommercialFeatureActive(id: string, isActive: boolean) {
  await requireFinanceAdmin();
  await db.commercialFeature.update({ where: { id }, data: { isActive } });
  revalidatePath("/commercial-features");
  revalidatePath("/commercial-plans");
}

export async function assignCommercialFeature(planId: string, form: FormData) {
  await requireFinanceAdmin();
  const featureId = value(form, "featureId");
  const quantityText = value(form, "quantity");
  const quantity = quantityText ? Number(quantityText) : null;
  if (!featureId || (quantity !== null && (!Number.isInteger(quantity) || quantity < 0))) throw new Error("تحقق من الميزة والكمية");
  await db.commercialPlanFeature.upsert({
    where: { planId_featureId: { planId, featureId } },
    update: { quantity, note: value(form, "note") || null },
    create: { planId, featureId, quantity, note: value(form, "note") || null, displayOrder: await db.commercialPlanFeature.count({ where: { planId } }) },
  });
  revalidatePath(`/commercial-plans/${planId}`);
}

export async function updateCommercialPlanFeature(id: string, planId: string, form: FormData) {
  await requireFinanceAdmin();
  const quantityText = value(form, "quantity");
  const quantity = quantityText ? Number(quantityText) : null;
  if (quantity !== null && (!Number.isInteger(quantity) || quantity < 0)) throw new Error("كمية غير صحيحة");
  await db.commercialPlanFeature.update({ where: { id }, data: { quantity, note: value(form, "note") || null } });
  revalidatePath(`/commercial-plans/${planId}`);
}

export async function removeCommercialPlanFeature(id: string, planId: string) {
  await requireFinanceAdmin();
  await db.commercialPlanFeature.delete({ where: { id } });
  revalidatePath(`/commercial-plans/${planId}`);
}

/** The feature library owns the simple “included in this plan” assignment. */
export async function setCommercialFeaturePlanAssignments(featureId: string, form: FormData) {
  await requireFinanceAdmin();
  const requestedPlanIds = [...new Set(form.getAll("planIds").map(String).filter(Boolean))];
  const [feature, validPlans, currentAssignments] = await Promise.all([
    db.commercialFeature.findUnique({ where: { id: featureId }, select: { id: true } }),
    db.commercialPlan.findMany({ where: { id: { in: requestedPlanIds } }, select: { id: true } }),
    db.commercialPlanFeature.findMany({ where: { featureId }, select: { id: true, planId: true } }),
  ]);
  if (!feature) throw new Error("الميزة غير موجودة");

  const selectedPlanIds = new Set(validPlans.map((plan) => plan.id));
  const assignedPlanIds = new Set(currentAssignments.map((assignment) => assignment.planId));
  const removedAssignments = currentAssignments.filter((assignment) => !selectedPlanIds.has(assignment.planId));

  await db.$transaction(async (transaction) => {
    if (removedAssignments.length > 0) {
      await transaction.commercialPlanFeature.deleteMany({ where: { id: { in: removedAssignments.map((assignment) => assignment.id) } } });
    }
    for (const planId of selectedPlanIds) {
      if (assignedPlanIds.has(planId)) continue;
      const displayOrder = await transaction.commercialPlanFeature.count({ where: { planId } });
      await transaction.commercialPlanFeature.create({ data: { planId, featureId, displayOrder } });
    }
  });

  revalidatePath("/commercial-features");
  revalidatePath("/commercial-plans");
  for (const planId of new Set([...assignedPlanIds, ...selectedPlanIds])) revalidatePath(`/commercial-plans/${planId}`);
}

export async function deleteCommercialPlan(id: string) {
  await requireFinanceAdmin();
  await db.commercialPlan.delete({ where: { id } });
  revalidatePath("/commercial-plans");
  redirect("/commercial-plans");
}
