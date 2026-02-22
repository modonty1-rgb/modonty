/**
 * SEO Client Intake Questionnaire - sections and questions.
 * Source: documents/SEO_CLIENT_INTAKE_QUESTIONNAIRE_AR.md
 */

export type {
  IntakeQuestion,
  IntakeSection,
  IntakeFieldType,
  IntakeFieldOption,
  IntakeFieldConfig,
} from "./intake-questions-types";

export {
  INTAKE_SECTIONS,
  INTAKE_FIELD_CONFIG,
  NEW_ID_TO_OLD_ID,
} from "./intake-questions-data";

import { INTAKE_SECTIONS, INTAKE_FIELD_CONFIG, NEW_ID_TO_OLD_ID } from "./intake-questions-data";
import type { IntakeFieldConfig } from "./intake-questions-types";

/** No longer used; all questions in sections are shown and counted. */
export const PROFILE_SOURCED_QUESTION_IDS: readonly string[] = [];

export function getAllQuestionIds(): string[] {
  const ids: string[] = [];
  for (const section of INTAKE_SECTIONS) {
    for (const q of section.questions) ids.push(q.id);
  }
  return ids;
}

/** Question IDs that are counted and shown in the form (excludes profile-sourced). */
export function getCountableQuestionIds(): string[] {
  const set = new Set(PROFILE_SOURCED_QUESTION_IDS);
  return getAllQuestionIds().filter((id) => !set.has(id));
}

/** Reserved for internal use; client intake no longer shows checklist. */
export function getAllChecklistIds(): string[] {
  return [];
}

export function getFieldConfig(id: string): IntakeFieldConfig | undefined {
  return INTAKE_FIELD_CONFIG[NEW_ID_TO_OLD_ID[id] ?? id];
}

/** Returns help text for a question from the single source (INTAKE_SECTIONS). */
export function getQuestionHelp(questionId: string): string | undefined {
  for (const section of INTAKE_SECTIONS) {
    const q = section.questions.find((x) => x.id === questionId);
    if (q?.help) return q.help;
  }
  return undefined;
}
