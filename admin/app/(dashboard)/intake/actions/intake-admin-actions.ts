"use server";

import { revalidatePath } from "next/cache";
import { cache } from "react";
import { z } from "zod";
import { Prisma, type IntakeQuestionType } from "@prisma/client";
import { db } from "@/lib/db";

// ─── Read ──────────────────────────────────────────────────────────────────

/** Full intake form tree (sections → questions → options), all ordered. */
export const getIntakeForm = cache(async () => {
  return db.intakeForm.findUnique({
    where: { key: "intake" },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
});

export type IntakeFormTree = NonNullable<Awaited<ReturnType<typeof getIntakeForm>>>;
export type IntakeSectionTree = IntakeFormTree["sections"][number];
export type IntakeQuestionTree = IntakeSectionTree["questions"][number];

// ─── Validation ──────────────────────────────────────────────────────────────

const QUESTION_TYPES = [
  "SELECT", "RADIO", "MULTI_PILL", "CHECKBOX",
  "TEXT", "TEXTAREA", "BOOLEAN", "REPEATED_GROUP", "GROUP",
] as const satisfies readonly IntakeQuestionType[];

const optionSchema = z.object({
  value: z.string().trim().min(1, "القيمة مطلوبة"),
  label: z.string().trim().min(1, "النص مطلوب"),
  marketScope: z.enum(["SA", "EG"]).nullable().optional(),
});

const questionSchema = z.object({
  // Internal identifier — never shown to admins. Auto-generated on create, never
  // changed on edit (it's the stable contract downstream code reads).
  key: z.string().trim().regex(/^[a-zA-Z0-9_.]+$/, "مفتاح غير صالح").optional(),
  label: z.string().trim().min(1, "نص السؤال مطلوب"),
  helpText: z.string().trim().optional().nullable(),
  placeholder: z.string().trim().optional().nullable(),
  type: z.enum(QUESTION_TYPES),
  required: z.boolean().default(false),
  maxLength: z.coerce.number().int().positive().optional().nullable(),
  options: z.array(optionSchema).default([]),
});

const sectionSchema = z.object({
  key: z.string().trim().min(1).regex(/^[a-zA-Z0-9_-]+$/, "المفتاح: حروف/أرقام فقط"),
  title: z.string().trim().min(1, "العنوان مطلوب"),
  description: z.string().trim().optional().nullable(),
  icon: z.string().trim().optional().nullable(),
});

export type QuestionInput = z.input<typeof questionSchema>;
export type SectionInput = z.input<typeof sectionSchema>;

type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? "بيانات غير صحيحة" };
  return { ok: false, error: e instanceof Error ? e.message : "خطأ غير متوقع" };
}

function done(): ActionResult {
  revalidatePath("/intake");
  return { ok: true };
}

// Replaces a question's options with the given list (admin edits fully control them).
async function replaceOptions(questionId: string, options: z.infer<typeof optionSchema>[]) {
  await db.intakeOption.deleteMany({ where: { questionId } });
  if (options.length) {
    await db.intakeOption.createMany({
      data: options.map((opt, i) => ({
        questionId,
        value: opt.value,
        label: opt.label,
        order: i,
        marketScope: opt.marketScope ?? null,
      })),
    });
  }
}

// ─── Question mutations ──────────────────────────────────────────────────────

export async function createQuestion(sectionId: string, raw: QuestionInput): Promise<ActionResult> {
  try {
    const data = questionSchema.parse(raw);
    const section = await db.intakeSection.findUnique({
      where: { id: sectionId },
      select: { key: true },
    });
    const last = await db.intakeQuestion.findFirst({
      where: { sectionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    // Admin never types a key — generate a stable, unique one behind the scenes.
    const generatedKey =
      data.key?.trim() ||
      `${section?.key ?? "custom"}.c${Date.now().toString(36)}`;
    const created = await db.intakeQuestion.create({
      data: {
        sectionId,
        key: generatedKey,
        label: data.label,
        helpText: data.helpText ?? null,
        placeholder: data.placeholder ?? null,
        type: data.type,
        required: data.required,
        maxLength: data.maxLength ?? null,
        order: (last?.order ?? -1) + 1,
      },
      select: { id: true },
    });
    await replaceOptions(created.id, data.options);
    return done();
  } catch (e) {
    return fail(e);
  }
}

export async function updateQuestion(questionId: string, raw: QuestionInput): Promise<ActionResult> {
  try {
    const data = questionSchema.parse(raw);
    await db.intakeQuestion.update({
      where: { id: questionId },
      data: {
        // key intentionally NOT updated — it's the stable downstream contract.
        label: data.label,
        helpText: data.helpText ?? null,
        placeholder: data.placeholder ?? null,
        type: data.type,
        required: data.required,
        maxLength: data.maxLength ?? null,
      },
    });
    await replaceOptions(questionId, data.options);
    return done();
  } catch (e) {
    return fail(e);
  }
}

export async function deleteQuestion(questionId: string): Promise<ActionResult> {
  try {
    await db.intakeOption.deleteMany({ where: { questionId } });
    await db.intakeQuestion.delete({ where: { id: questionId } });
    return done();
  } catch (e) {
    return fail(e);
  }
}

export async function setQuestionEnabled(questionId: string, enabled: boolean): Promise<ActionResult> {
  try {
    await db.intakeQuestion.update({ where: { id: questionId }, data: { enabled } });
    return done();
  } catch (e) {
    return fail(e);
  }
}

/** Swap a question's order with its previous/next sibling in the same section. */
export async function moveQuestion(questionId: string, dir: "up" | "down"): Promise<ActionResult> {
  try {
    const current = await db.intakeQuestion.findUnique({
      where: { id: questionId },
      select: { id: true, order: true, sectionId: true },
    });
    if (!current) return { ok: false, error: "السؤال غير موجود" };

    const neighbor = await db.intakeQuestion.findFirst({
      where: {
        sectionId: current.sectionId,
        order: dir === "up" ? { lt: current.order } : { gt: current.order },
      },
      orderBy: { order: dir === "up" ? "desc" : "asc" },
      select: { id: true, order: true },
    });
    if (!neighbor) return { ok: true }; // already at the edge

    await db.$transaction([
      db.intakeQuestion.update({ where: { id: current.id }, data: { order: neighbor.order } }),
      db.intakeQuestion.update({ where: { id: neighbor.id }, data: { order: current.order } }),
    ]);
    return done();
  } catch (e) {
    return fail(e);
  }
}

// ─── Section mutations ───────────────────────────────────────────────────────

export async function createSection(formId: string, raw: SectionInput): Promise<ActionResult> {
  try {
    const data = sectionSchema.parse(raw);
    const last = await db.intakeSection.findFirst({
      where: { formId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    await db.intakeSection.create({
      data: {
        formId,
        key: data.key,
        title: data.title,
        description: data.description ?? null,
        icon: data.icon ?? null,
        order: (last?.order ?? 0) + 1,
      },
    });
    return done();
  } catch (e) {
    return fail(e);
  }
}

export async function updateSection(sectionId: string, raw: Omit<SectionInput, "key">): Promise<ActionResult> {
  try {
    const data = sectionSchema.omit({ key: true }).parse(raw);
    await db.intakeSection.update({
      where: { id: sectionId },
      data: {
        title: data.title,
        description: data.description ?? null,
        icon: data.icon ?? null,
      },
    });
    return done();
  } catch (e) {
    return fail(e);
  }
}

export async function setSectionEnabled(sectionId: string, enabled: boolean): Promise<ActionResult> {
  try {
    await db.intakeSection.update({ where: { id: sectionId }, data: { enabled } });
    return done();
  } catch (e) {
    return fail(e);
  }
}

// Reserved for future visibility-rule editing from the UI (kept type-safe here).
export async function setSectionVisibility(
  sectionId: string,
  visibility: Record<string, unknown> | null,
): Promise<ActionResult> {
  try {
    await db.intakeSection.update({
      where: { id: sectionId },
      data: { visibility: visibility ? (visibility as Prisma.InputJsonValue) : null },
    });
    return done();
  } catch (e) {
    return fail(e);
  }
}
