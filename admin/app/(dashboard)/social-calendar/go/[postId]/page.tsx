import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";

import { objectIdSchema } from "../../helpers/post-schema";
import { postHref } from "../../helpers/post-href";
import { requireSocialActor } from "../../helpers/require-social-actor";

type Props = { params: Promise<{ postId: string }>; searchParams: Promise<{ to?: string }> };

/**
 * من تاسك التصميم أو جرس الإشعارات إلى منشوره — كلاهما يعرف المنشور وحده، والرابط يحتاج
 * الكاليندر، فيُحلّ هنا. الافتراضي صفحة الإنتاج (التاسك)، و`?to=details` صفحة التفصيل (الجرس).
 */
export default async function GoToPost({ params, searchParams }: Props) {
  const [{ postId }, { to }] = await Promise.all([params, searchParams]);
  if (!objectIdSchema.safeParse(postId).success) notFound();
  const actor = await requireSocialActor("view");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;
  const post = await db.socialPost.findUnique({ where: { id: postId }, select: { id: true, calendarId: true } });
  if (!post) notFound();
  redirect(postHref(post.calendarId, post.id, to === "details" ? undefined : "production"));
}
