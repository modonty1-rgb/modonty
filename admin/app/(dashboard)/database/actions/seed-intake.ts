"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { INTAKE_SEED } from "./intake-seed-definition";

/**
 * Idempotent, create-only bootstrap of the intake questionnaire into the DB.
 *
 * - Form / section / question are created only if their key is absent.
 * - A question's options are seeded ONLY when that question is newly created,
 *   so re-running never clobbers admin-edited options.
 *
 * Safe to run any number of times; after the first run it reports 0 created.
 * Runs through the admin app's own DB connection (dev locally, prod in prod) —
 * no standalone script, per project policy.
 */
export interface SeedIntakeOutcome {
  formCreated: boolean;
  sectionsCreated: number;
  questionsCreated: number;
  optionsCreated: number;
}

export async function seedIntakeForm(): Promise<SeedIntakeOutcome> {
  let formCreated = false;
  let sectionsCreated = 0;
  let questionsCreated = 0;
  let optionsCreated = 0;

  // ── Form ──────────────────────────────────────────────────────────────
  let form = await db.intakeForm.findUnique({
    where: { key: INTAKE_SEED.key },
    select: { id: true },
  });
  if (!form) {
    form = await db.intakeForm.create({
      data: {
        key: INTAKE_SEED.key,
        title: INTAKE_SEED.title,
        description: INTAKE_SEED.description ?? null,
      },
      select: { id: true },
    });
    formCreated = true;
  }

  // ── Sections → Questions → Options ──────────────────────────────────────
  for (const section of INTAKE_SEED.sections) {
    let dbSection = await db.intakeSection.findUnique({
      where: { formId_key: { formId: form.id, key: section.key } },
      select: { id: true },
    });
    if (!dbSection) {
      dbSection = await db.intakeSection.create({
        data: {
          formId: form.id,
          key: section.key,
          title: section.title,
          description: section.description ?? null,
          icon: section.icon ?? null,
          order: section.order,
          visibility: section.visibility
            ? (section.visibility as Prisma.InputJsonValue)
            : undefined,
        },
        select: { id: true },
      });
      sectionsCreated++;
    }

    for (let qIndex = 0; qIndex < section.questions.length; qIndex++) {
      const question = section.questions[qIndex];
      const existing = await db.intakeQuestion.findUnique({
        where: { sectionId_key: { sectionId: dbSection.id, key: question.key } },
        select: { id: true },
      });
      if (existing) continue; // never overwrite an existing question or its options

      const created = await db.intakeQuestion.create({
        data: {
          sectionId: dbSection.id,
          key: question.key,
          label: question.label,
          helpText: question.helpText ?? null,
          placeholder: question.placeholder ?? null,
          type: question.type,
          required: question.required ?? false,
          maxLength: question.maxLength ?? null,
          order: qIndex,
          visibility: question.visibility
            ? (question.visibility as Prisma.InputJsonValue)
            : undefined,
          config: question.config
            ? (question.config as Prisma.InputJsonValue)
            : undefined,
        },
        select: { id: true },
      });
      questionsCreated++;

      if (question.options?.length) {
        await db.intakeOption.createMany({
          data: question.options.map((opt, oIndex) => ({
            questionId: created.id,
            value: opt.value,
            label: opt.label,
            order: oIndex,
            marketScope: opt.marketScope ?? null,
          })),
        });
        optionsCreated += question.options.length;
      }
    }
  }

  return { formCreated, sectionsCreated, questionsCreated, optionsCreated };
}
