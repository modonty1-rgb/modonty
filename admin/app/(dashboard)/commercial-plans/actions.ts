"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

function value(form: FormData, key: string): string { return String(form.get(key) ?? "").trim(); }

/**
 * Read-only name lookup for the breadcrumb (see `breadcrumb-actions.ts`), same
 * unguarded pattern as `getArticleById`/`getClientById`/etc — the plan's own
 * name isn't sensitive, and mutation stays behind `requireCommercialAdmin`.
 * Without this the breadcrumb falls through its default case and shows the
 * raw ObjectId instead of the plan name on `/commercial-plans/[id]`.
 */
export async function getCommercialPlanName(id: string): Promise<string | null> {
  const plan = await db.commercialPlan.findUnique({ where: { id }, select: { name: true } });
  return plan?.name ?? null;
}

/** Commercial pricing is deliberately restricted to active ADMIN staff. */
async function requireCommercialAdmin() {
  const session = await auth().catch(() => null);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) throw new Error("غير مصرح");
  const staff = await db.staff.findUnique({ where: { id }, select: { role: true, isActive: true } });
  if (!staff || staff.isActive === false || staff.role !== "ADMIN") throw new Error("هذه الصفحة مخصصة لمدير النظام فقط");
}

export async function createCommercialPlan(form: FormData) {
  await requireCommercialAdmin();
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
    terms: { create: [{ paidMonths: 3, bonusServiceMonths: 0, displayOrder: 1 }, { paidMonths: 6, bonusServiceMonths: 1, displayOrder: 2 }, { paidMonths: 12, bonusServiceMonths: 6, displayOrder: 3 }] },
  }});
  revalidatePath("/commercial-plans");
}

export async function setCommercialPlanPublished(id: string, isPublished: boolean) {
  await requireCommercialAdmin();
  await db.commercialPlan.update({ where: { id }, data: { isPublished } });
  revalidatePath("/commercial-plans"); revalidatePath(`/commercial-plans/${id}`);
}

export async function addCommercialPlanTerm(id: string, form: FormData) {
  await requireCommercialAdmin();
  const paidMonths = Number(form.get("paidMonths")); const bonusServiceMonths = Number(form.get("bonusMonths"));
  if (!Number.isInteger(paidMonths) || paidMonths < 1 || !Number.isInteger(bonusServiceMonths) || bonusServiceMonths < 0) throw new Error("مدة غير صحيحة");
  await db.commercialPlanTerm.create({ data: { planId: id, paidMonths, bonusServiceMonths, displayOrder: paidMonths } });
  revalidatePath(`/commercial-plans/${id}`);
}

export async function updateCommercialPlanPrice(id: string, form: FormData) {
  await requireCommercialAdmin();
  const amount = Number(form.get("amount"));
  if (!Number.isInteger(amount) || amount < 0) throw new Error("سعر غير صحيح");
  await db.commercialPlanPrice.update({ where: { id }, data: { monthlyBase: amount } });
  revalidatePath("/commercial-plans"); revalidatePath(`/commercial-plans/${String(form.get("planId"))}`);
}

export async function updateCommercialPlanMarketPrices(planId: string, form: FormData) {
  await requireCommercialAdmin();
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

export async function updateCommercialPlanTerm(id: string, form: FormData) {
  await requireCommercialAdmin();
  const paidMonths = Number(form.get("paidMonths")); const bonusServiceMonths = Number(form.get("bonusMonths"));
  if (!Number.isInteger(paidMonths) || paidMonths < 1 || !Number.isInteger(bonusServiceMonths) || bonusServiceMonths < 0) throw new Error("مدة غير صحيحة");
  await db.commercialPlanTerm.update({ where: { id }, data: { paidMonths, bonusServiceMonths, displayOrder: paidMonths } });
  revalidatePath(`/commercial-plans/${String(form.get("planId"))}`);
}

export async function deleteCommercialPlanTerm(id: string, planId: string) {
  await requireCommercialAdmin();
  await db.commercialPlanTerm.delete({ where: { id } }); revalidatePath(`/commercial-plans/${planId}`);
}

export async function createCommercialFeature(form: FormData) {
  await requireCommercialAdmin();
  const name = value(form, "name");
  const description = value(form, "description") || null;
  const unitLabel = value(form, "unitLabel") || null;
  if (!name) throw new Error("اسم الميزة مطلوب");
  await db.commercialFeature.create({ data: { name, description, unitLabel, displayOrder: await db.commercialFeature.count() } });
  revalidatePath("/commercial-features");
}

export async function updateCommercialFeature(id: string, form: FormData) {
  await requireCommercialAdmin();
  const name = value(form, "name");
  if (!name) throw new Error("اسم الميزة مطلوب");
  await db.commercialFeature.update({ where: { id }, data: { name, description: value(form, "description") || null, unitLabel: value(form, "unitLabel") || null } });
  revalidatePath("/commercial-features");
}

export async function setCommercialFeatureActive(id: string, isActive: boolean) {
  await requireCommercialAdmin();
  await db.commercialFeature.update({ where: { id }, data: { isActive } });
  revalidatePath("/commercial-features");
  revalidatePath("/commercial-plans");
}

export async function assignCommercialFeature(planId: string, form: FormData) {
  await requireCommercialAdmin();
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
  await requireCommercialAdmin();
  const quantityText = value(form, "quantity");
  const quantity = quantityText ? Number(quantityText) : null;
  if (quantity !== null && (!Number.isInteger(quantity) || quantity < 0)) throw new Error("كمية غير صحيحة");
  await db.commercialPlanFeature.update({ where: { id }, data: { quantity, note: value(form, "note") || null } });
  revalidatePath(`/commercial-plans/${planId}`);
}

export async function removeCommercialPlanFeature(id: string, planId: string) {
  await requireCommercialAdmin();
  await db.commercialPlanFeature.delete({ where: { id } });
  revalidatePath(`/commercial-plans/${planId}`);
}

/** The feature library owns the simple “included in this plan” assignment. */
export async function setCommercialFeaturePlanAssignments(featureId: string, form: FormData) {
  await requireCommercialAdmin();
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
  await requireCommercialAdmin();
  await db.commercialPlan.delete({ where: { id } });
  revalidatePath("/commercial-plans");
  redirect("/commercial-plans");
}
