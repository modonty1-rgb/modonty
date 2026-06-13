"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import NextImage from "next/image";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CommentFormDialog } from "@/app/articles/[slug]/components/comment-form-dialog";
import { BookingForm } from "@/app/articles/[slug]/components/booking-form";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { useSession } from "@/components/providers/SessionContext";
import { likeArticle, favoriteArticle } from "@/app/articles/[slug]/actions/article-interactions";
import type { BookingSource } from "@/app/articles/[slug]/actions/booking-actions";
import { BRAND_AVATAR_RADIUS } from "@/lib/brand-avatar";
import { IconLike, IconSaved, IconComment, IconShare, IconClients, IconExternal } from "@/lib/icons";
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
  /** Primary CTA config (admin-controlled): NONE shows the card only; FORM/LINK add the action. */
  cta: { mode: "NONE" | "FORM" | "LINK"; label?: string | null; url?: string | null };
  /** Session user (name + email) — booking requires login. */
  bookingUser: { name: string | null; email: string | null } | null;
  /** The existing client card (server-rendered with its own CTA hidden) — shown inside the bottom sheet. */
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
  cta,
  bookingUser,
  clientCard,
}: ArticleLabBottomDockProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  // Chip label follows the configured action; NONE shows just the logo (card-only sheet).
  const ctaChipLabel =
    cta.mode === "FORM"
      ? cta.label?.trim() || "احجز الآن"
      : cta.mode === "LINK"
        ? cta.label?.trim() || "تسوّق الآن"
        : null;

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

      {/* center docked client button → opens the booking-first client sheet */}
      <div className="relative w-[78px] shrink-0">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label={ctaChipLabel ? `${ctaChipLabel} — ${clientName}` : `بطاقة ${clientName}`}
              className="group absolute inset-x-0 bottom-1.5 mx-auto flex w-[72px] flex-col items-center gap-0.5"
            >
              {/* brand chip: logo framed by a primary ring + white outline → distinct, tappable */}
              <span className={cn("grid size-14 place-items-center overflow-hidden bg-background shadow-lg shadow-primary/30 outline outline-[3px] outline-background ring-2 ring-primary/60 transition-transform group-active:scale-95", BRAND_AVATAR_RADIUS)}>
                {clientLogoUrl ? (
                  <NextImage src={clientLogoUrl} alt={clientName} width={56} height={56} className="size-full object-contain p-1.5" sizes="56px" />
                ) : (
                  <IconClients className="size-7 text-primary" />
                )}
              </span>
              {/* CTA label follows the client's configured action (احجز الآن / تسوّق الآن). NONE → no badge. */}
              {ctaChipLabel && (
                <span className="whitespace-nowrap rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold leading-tight text-black shadow-sm">
                  {ctaChipLabel}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" dir="rtl" className="mx-auto max-w-[480px] rounded-t-2xl p-0">
            <SheetTitle className="sr-only">بطاقة {clientName}</SheetTitle>
            <SheetDescription className="sr-only">معلومات العميل وطلب الحجز.</SheetDescription>
            <div className="max-h-[85vh] overflow-y-auto p-4">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden />
              {clientCard}

              {/* Booking-first: the action lives in the sheet (the card above has its own CTA hidden). */}
              {cta.mode === "FORM" && clientId && (
                <div className="mt-4">
                  <BookingForm
                    clientId={clientId}
                    articleId={articleId}
                    source="article_dock"
                    clientName={clientName}
                    user={bookingUser}
                    submitLabel={cta.label?.trim() || "تأكيد الحجز"}
                  />
                </div>
              )}

              {cta.mode === "LINK" && cta.url && (
                <div className="sticky bottom-0 mt-4 border-t border-border bg-background py-3">
                  <CtaTrackedLink
                    href={cta.url}
                    label={cta.label?.trim() || "تسوّق الآن"}
                    type="LINK"
                    articleId={articleId}
                    clientId={clientId ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <IconExternal className="h-4 w-4" />
                    {cta.label?.trim() || "تسوّق الآن"}
                  </CtaTrackedLink>
                </div>
              )}
            </div>
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
