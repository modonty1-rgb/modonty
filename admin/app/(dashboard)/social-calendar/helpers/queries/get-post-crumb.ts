import "server-only";

import { db } from "@/lib/db";

import { requireSocialActor } from "../require-social-actor";
import { MONTH_LABELS } from "../dates";

/** اسم المنشور في الفتات: «٧ أكتوبر · الفكرة» — بدل المعرّف الخام. */
export async function getPostCrumb(postId: string): Promise<string | null> {
  const actor = await requireSocialActor("view");
  if ("error" in actor) return null;
  const post = await db.socialPost
    .findUnique({ where: { id: postId }, select: { idea: true, scheduledFor: true } })
    .catch(() => null);
  if (!post) return null;
  const d = post.scheduledFor;
  const date = `${d.getUTCDate()} ${MONTH_LABELS[d.getUTCMonth()]}`;
  const idea = post.idea.trim();
  return idea ? `${date} · ${idea.length > 40 ? `${idea.slice(0, 40)}…` : idea}` : date;
}
