"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import NextImage from "next/image";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CommentFormDialog } from "@/app/articles/[slug]/components/comment-form-dialog";
import { useSession } from "@/components/providers/SessionContext";
import { likeArticle, favoriteArticle } from "@/app/articles/[slug]/actions/article-interactions";
import { IconLike, IconSaved, IconComment, IconShare, IconClients } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ArticleLabBottomDockProps {
  likes: number;
  favorites: number;
  userLiked?: boolean;
  userFavorited?: boolean;
  clientId: string | null;
  articleId: string;
  articleSlug: string;
  userId?: string | null;
  clientName: string;
  clientLogoUrl?: string | null;
  /** The existing client card (server-rendered) — shown inside the bottom sheet. Reused, not rebuilt. */
  clientCard: ReactNode;
}

// Mobile sticky bottom bar: article engagement (like/save/comment/share) flanking a
// center docked client button. Like/save are WIRED to the real server actions
// (likeArticle/favoriteArticle) with optimistic UI + reconcile; comment = CommentFormDialog;
// share = native share sheet. The center dock opens the existing client card.
export function ArticleLabBottomDock({
  likes,
  favorites,
  userLiked,
  userFavorited,
  clientId,
  articleId,
  articleSlug,
  userId,
  clientName,
  clientLogoUrl,
  clientCard,
}: ArticleLabBottomDockProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  const [likeN, setLikeN] = useState(likes);
  const [favN, setFavN] = useState(favorites);
  const [liked, setLiked] = useState(!!userLiked);
  const [saved, setSaved] = useState(!!userFavorited);
  const [busy, setBusy] = useState<"like" | "save" | null>(null);

  const handleLike = async () => {
    if (!isLoggedIn || busy) return;
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
    if (!isLoggedIn || busy) return;
    setBusy("save");
    const prevN = favN, prevSaved = saved;
    setSaved(!saved);
    setFavN(saved ? favN - 1 : favN + 1);
    try {
      const r = await favoriteArticle(articleId, articleSlug);
      if (r.success && r.data) { setFavN(r.data.favorites); setSaved(r.data.favorited); }
      else { setSaved(prevSaved); setFavN(prevN); }
    } catch { setSaved(prevSaved); setFavN(prevN); }
    finally { setBusy(null); }
  };

  const action =
    "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary";

  return (
    <>
      {!isLoggedIn && (
        <div className="px-3 pt-1.5 text-center text-[11px] text-muted-foreground">
          <a href="/users/login" className="font-semibold text-primary">سجّل الدخول</a>{" للإعجاب أو الحفظ"}
        </div>
      )}
    <div className="flex items-stretch px-1">
      <button type="button" onClick={handleLike} disabled={!isLoggedIn || busy === "like"} className={cn(action, liked && "text-primary")} aria-pressed={liked} aria-label="أعجبني">
        <IconLike className={cn("size-6", liked && "fill-current")} />
        <span>{likeN > 0 ? likeN : "إعجاب"}</span>
      </button>
      <button type="button" onClick={handleSave} disabled={!isLoggedIn || busy === "save"} className={cn(action, saved && "text-amber-500")} aria-pressed={saved} aria-label="حفظ">
        <IconSaved className={cn("size-6", saved && "fill-current")} />
        <span>{favN > 0 ? favN : "حفظ"}</span>
      </button>

      {/* center docked client button → opens the existing client card */}
      <div className="relative w-[78px] shrink-0">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label={`احجز الآن — ${clientName}`}
              className="group absolute inset-x-0 bottom-1.5 mx-auto flex w-[72px] flex-col items-center gap-0.5"
            >
              {/* brand chip: logo framed by a primary ring + white outline → distinct, tappable, no text label */}
              <span className="grid size-14 place-items-center overflow-hidden rounded-full bg-background shadow-lg shadow-primary/30 outline outline-[3px] outline-background ring-2 ring-primary/60 transition-transform group-active:scale-95">
                {clientLogoUrl ? (
                  <NextImage src={clientLogoUrl} alt={clientName} width={56} height={56} className="size-full object-contain p-1.5" sizes="56px" />
                ) : (
                  <IconClients className="size-7 text-primary" />
                )}
              </span>
              {/* strong booking CTA (fixed text → no long-name truncation issue). LAB MOCKUP: tap opens the
                  client card for now; real booking needs a Client.bookingUrl flow before porting to /articles. */}
              <span className="whitespace-nowrap rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold leading-tight text-black shadow-sm">احجز الآن</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" dir="rtl" className="mx-auto max-w-[480px] rounded-t-2xl p-4">
            <SheetTitle className="sr-only">بطاقة {clientName}</SheetTitle>
            <SheetDescription className="sr-only">معلومات العميل وطرق التواصل معه.</SheetDescription>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden />
            {clientCard}
          </SheetContent>
        </Sheet>
      </div>

      <CommentFormDialog
        articleId={articleId}
        articleSlug={articleSlug}
        userId={userId}
        clientId={clientId ?? undefined}
        bare
        trigger={
          <button type="button" className={action} aria-label="أضف تعليق">
            <IconComment className="size-6" />
            <span>تعليق</span>
          </button>
        }
      />
      <button type="button" onClick={shareNow} className={action} aria-label="مشاركة">
        <IconShare className="size-6" />
        <span>مشاركة</span>
      </button>
    </div>
    </>
  );
}

function shareNow() {
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ url: location.href }).catch(() => {});
  }
}
