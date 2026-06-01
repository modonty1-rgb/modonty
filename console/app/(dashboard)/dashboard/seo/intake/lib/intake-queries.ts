import { db } from "@/lib/db";

/**
 * Fetch the admin-managed intake questionnaire (enabled rows only, ordered).
 * Returns null when the DB hasn't been seeded yet — callers fall back to the
 * legacy hardcoded form in that case, so the page never breaks.
 */
export async function getIntakeFormDefinition() {
  return db.intakeForm.findUnique({
    where: { key: "intake", enabled: true },
    include: {
      sections: {
        where: { enabled: true },
        orderBy: { order: "asc" },
        include: {
          questions: {
            where: { enabled: true },
            orderBy: { order: "asc" },
            include: {
              options: {
                where: { enabled: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });
}

export type IntakeFormDef = NonNullable<Awaited<ReturnType<typeof getIntakeFormDefinition>>>;
export type IntakeSectionDef = IntakeFormDef["sections"][number];
export type IntakeQuestionDef = IntakeSectionDef["questions"][number];
export type IntakeOptionDef = IntakeQuestionDef["options"][number];
