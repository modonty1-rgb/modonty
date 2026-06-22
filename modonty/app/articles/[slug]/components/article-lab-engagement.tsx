"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CommentFormDialog } from "@/app/articles/[slug]/components/comment-form-dialog";
import { NewsletterCTA } from "@/app/articles/[slug]/components/client-lazy";
import { useSession } from "@/components/providers/SessionContext";
import { likeArticle, favoriteArticle } from "@/app/articles/[slug]/actions/article-interactions";
import { IconLike, IconSaved, IconComment, IconShare, IconNews } from "@/lib/icons";
import { cn } from "@/lib/utils";

function shareNow() {
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ url: location.href }).catch(() => {});
  }
}

interface EngagementStripProps {
  likes: number;
  userLiked?: boolean;
  userFavorited?: boolean;
  clientId: string | null;
  articleId: string;
  articleSlug: string;
  userId?: string | null;
  ctaText?: string | null;
}

/**
 * Thin engagement strip — desktop aside lane. Like/save are WIRED to the real
 * server actions (likeArticle/favoriteArticle) with optimistic UI + reconcile —
 * same pattern as the mobile bottom dock (one server-backed source of truth).
 * Comment & subscribe open dialogs. Share = native share sheet.
 */
export function ArticleLabEngagementStrip({ likes, userLiked, userFavorited, clientId, articleId, articleSlug, userId, ctaText }: EngagementStripProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const router = useRouter();
  const pathname = usePathname();
  const registerHref = pathname
    ? `/users/register?callbackUrl=${encodeURIComponent(pathname)}`
    : "/users/register";

  const [likeN, setLikeN] = useState(likes);
  const [liked, setLiked] = useState(!!userLiked);
  const [saved, setSaved] = useState(!!userFavorited);
  const [busy, setBusy] = useState<"like" | "save" | null>(null);

  const handleLike = async () => {
    if (busy) return;
    if (!isLoggedIn) { router.push(registerHref); return; }
    setBusy("like");
    const prevN = likeN, prevLiked = liked;
    setLiked(!liked);
    setLikeN(liked ? likeN - 1 : likeN + 1);
    try {
      const r = await likeArticle(articleId, articleSlug);
      if (r.success && r.data) { setLikeN(r.data.likes); setLiked(r.data.liked); }
      else { setLiked(prevLiked); setLikeN(prevN); }
    } catch { setLiked(prevLiked); setLikeN(prevN); }
    finally { setBusy(null); }
  };

  const handleSave = async () => {
    if (busy) return;
    if (!isLoggedIn) { router.push(registerHref); return; }
    setBusy("save");
    const prevSaved = saved;
    setSaved(!saved);
    try {
      const r = await favoriteArticle(articleId, articleSlug);
      if (r.success && r.data) { setSaved(r.data.favorited); }
      else { setSaved(prevSaved); }
    } catch { setSaved(prevSaved); }
    finally { setBusy(null); }
  };

  const btn =
    "flex w-12 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-60";

  return (
    <div className="flex flex-col gap-1.5">
      {!isLoggedIn && (
        <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
          <a href={registerHref} className="font-semibold text-primary underline-offset-4 hover:underline">اشترك مجاناً</a>
          {" للإعجاب أو حفظ المقال"}
        </p>
      )}
      <div className="flex items-center justify-around gap-0.5 rounded-xl border border-border bg-muted/40 px-1.5 py-1.5">
      <button type="button" onClick={handleLike} disabled={busy === "like"} className={cn(btn, liked && "text-primary")} aria-pressed={liked} aria-label="أعجبني">
        <IconLike className={cn("h-5 w-5", liked && "fill-current")} />
        <span>{likeN > 0 ? likeN : "إعجاب"}</span>
      </button>
      <button type="button" onClick={handleSave} disabled={busy === "save"} className={cn(btn, saved && "text-amber-500")} aria-pressed={saved} aria-label="حفظ">
        <IconSaved className={cn("h-5 w-5", saved && "fill-current")} />
        <span>حفظ</span>
      </button>
      <CommentFormDialog
        articleId={articleId}
        articleSlug={articleSlug}
        userId={userId}
        clientId={clientId ?? undefined}
        bare
        trigger={
          <button type="button" className={btn} aria-label="أضف تعليق">
            <IconComment className="h-5 w-5" />
            <span>تعليق</span>
          </button>
        }
      />
      <button type="button" onClick={shareNow} className={btn} aria-label="مشاركة">
        <IconShare className="h-5 w-5" />
        <span>مشاركة</span>
      </button>
      {clientId && (
        <>
          <div className="mx-0.5 h-7 w-px bg-border" />
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className={btn} aria-label="اشترك في النشرة">
                <IconNews className="h-5 w-5" />
                <span>اشترك</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm gap-0" dir="rtl">
              <DialogTitle className="sr-only">اشترك في النشرة الإخبارية</DialogTitle>
              <DialogDescription className="sr-only">سجّل بريدك ليصلك جديد مقالات العميل وتحديثاته.</DialogDescription>
              <NewsletterCTA clientId={clientId} articleId={articleId} ctaText={ctaText} />
            </DialogContent>
          </Dialog>
        </>
      )}
      </div>
    </div>
  );
}
