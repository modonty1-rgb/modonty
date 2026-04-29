"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { INTAKE_SCHEMA_VERSION, type ClientIntake } from "../lib/intake-types";

export type SaveIntakeResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Mirror strategy fields from intake JSON to legacy Client columns.
 * Reason: until Phase 4 deletes the legacy fields, several readers (admin client view tabs,
 * console profile-form, console old /seo/intake) still consume them. Mirroring keeps both
 * sources in sync so users see consistent data regardless of which UI they open.
 * Phase 4 will remove both this mirror block and the legacy columns.
 */
function buildLegacyMirror(intake: ClientIntake) {
  return {
    contentTone: intake.voice?.tone ?? null,
    targetAudience: intake.audience?.description ?? null,
    businessBrief: intake.business?.brief ?? null,
    linkBuildingPolicy: intake.policy?.linkBuildingPolicy ?? null,
    forbiddenKeywords: intake.policy?.forbiddenKeywords ?? [],
    forbiddenClaims: intake.policy?.forbiddenClaims ?? [],
    competitiveMentionsAllowed: intake.policy?.competitiveMentionsAllowed ?? null,
    brandGuidelines: intake.voice
      ? { tone: intake.voice.tone ?? undefined, traits: intake.voice.traits ?? undefined }
      : null,
    seoGoals: intake.goals
      ? { primaryGoal: intake.goals.primary ?? undefined, kpis: intake.goals.kpis ?? undefined }
      : null,
    googleBusinessProfileUrl: intake.technical?.googleBusinessProfileUrl ?? null,
    complianceConstraints: intake.policy?.restrictedClaims
      ? { restrictedClaims: intake.policy.restrictedClaims }
      : null,
  };
}

export async function saveIntakeAction(input: ClientIntake): Promise<SaveIntakeResult> {
  const session = await auth();
  const clientId = (session as { clientId?: string; userId?: string })?.clientId;
  const userId = (session as { clientId?: string; userId?: string })?.userId ?? null;

  if (!clientId) return { ok: false, error: "Unauthenticated" };

  const payload: ClientIntake = {
    ...input,
    version: INTAKE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };

  const legacyMirror = buildLegacyMirror(payload);

  try {
    await db.client.update({
      where: { id: clientId },
      data: {
        intake: payload as unknown as object,
        intakeUpdatedAt: new Date(),
        intakeUpdatedBy: userId,
        ...legacyMirror,
      },
    });

    revalidatePath("/dashboard/intake-v2");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed" };
  }
}
