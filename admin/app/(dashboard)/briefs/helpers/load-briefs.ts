import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { mediaSrc } from "@modonty/database/lib/media-src";

import { getIntakeForm } from "@/app/(dashboard)/intake/actions/intake-admin-actions";

// The content team's client list. Deliberately NOT the admin clients table: a writer
// opening this needs one question answered first — "has this client told us enough for
// me to write?" — and everything here serves that question. No billing, no subscription
// state, no payment: those belong to the accounts screens.

type AnyObj = Record<string, unknown>;

/** Same reader the writer brief uses, so a row's % matches the page it opens. */
function getAtPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (acc, k) => (acc && typeof acc === "object" ? (acc as AnyObj)[k] : undefined),
    obj,
  );
}

function isFilled(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "boolean") return true;
  if (Array.isArray(v)) {
    return v.some((x) => (typeof x === "object" ? Object.values(x as AnyObj).some(Boolean) : Boolean(x)));
  }
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "object") {
    return Object.values(v as AnyObj).some((x) => typeof x === "string" && x.trim().length > 0);
  }
  return true;
}

export interface BriefRow {
  id: string;
  name: string;
  logoUrl: string | null;
  industry: string | null;
  /** How much of the questionnaire the client actually answered, 0-100. */
  completeness: number;
  answered: number;
  totalQuestions: number;
  /** Null when the client has never touched the intake. */
  intakeUpdatedAt: string | null;
  publishedThisMonth: number;
  monthlyQuota: number;
}

export async function getBriefRows(): Promise<BriefRow[]> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [form, clients, publishedGroups] = await Promise.all([
    getIntakeForm(),
    db.client.findMany({
      select: {
        id: true,
        name: true,
        isYmyl: true,
        intake: true,
        intakeUpdatedAt: true,
        articlesPerMonth: true,
        logoMedia: { select: { url: true, bunnyUrl: true } },
        industry: { select: { name: true } },
        // Quota only — the tier's PRICE is never selected here on purpose.
        subscriptionTierConfig: { select: { articlesPerMonth: true } },
      },
    }),
    db.article.groupBy({
      by: ["clientId"],
      where: { status: ArticleStatus.PUBLISHED, datePublished: { gte: startOfMonth } },
      _count: { id: true },
    }),
  ]);

  const publishedByClient = new Map(
    publishedGroups.filter((g) => g.clientId).map((g) => [g.clientId as string, g._count.id]),
  );

  const sections = form?.sections ?? [];

  return clients
    .map((c) => {
      // A YMYL-only section counts against a medical/legal/financial client and nobody
      // else — otherwise every ordinary client would sit permanently short of 100%.
      const visibleSections = sections.filter((s) => {
        if (!s.enabled) return false;
        const vis = (s.visibility && typeof s.visibility === "object" ? s.visibility : {}) as AnyObj;
        if (vis.ymylOnly === true && !c.isYmyl) return false;
        return true;
      });
      const questions = visibleSections.flatMap((s) => s.questions.filter((q) => q.enabled));
      const answered = questions.filter((q) => isFilled(getAtPath(c.intake, q.key))).length;

      return {
        id: c.id,
        name: c.name,
        logoUrl: mediaSrc(c.logoMedia),
        industry: c.industry?.name ?? null,
        completeness: questions.length ? Math.round((answered / questions.length) * 100) : 0,
        answered,
        totalQuestions: questions.length,
        intakeUpdatedAt: c.intakeUpdatedAt?.toISOString() ?? null,
        publishedThisMonth: publishedByClient.get(c.id) ?? 0,
        monthlyQuota: c.articlesPerMonth ?? c.subscriptionTierConfig?.articlesPerMonth ?? 0,
      };
    })
    // Emptiest brief first: those are the clients a writer is about to get stuck on.
    .sort((a, b) => a.completeness - b.completeness || a.name.localeCompare(b.name, "ar"));
}
