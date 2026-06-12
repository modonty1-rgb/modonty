"use client";

import { useState } from "react";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/components/providers/SessionContext";
import { IconUsers, IconCheck, IconShare, IconFeatured, IconClients, IconSaved } from "@/lib/icons";
import { stripCloudinaryTransforms } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

import { ClientContactSheet } from "./client-contact-sheet";

interface ClientBottomBarProps {
  clientId: string;
  clientName: string;
  clientSlug: string;
  clientLogoUrl: string | null;
  ctaMode: "FORM" | "LINK" | "NONE";
  linkUrl: string | null;
  ctaLabel: string | null;
  phone: string | null;
  email: string | null;
  user: { name: string | null; email: string | null } | null;
  initialIsFollowing: boolean;
  initialIsFavorited: boolean;
}

/**
 * Mobile sticky bottom bar for the client page (lg:hidden) — same design language
 * as the article dock: engagement (follow · share | save · review) flanking the
 * client's raised LOGO in the center. Tapping the logo opens the client's primary
 * action — FORM → booking sheet · LINK → external link · NONE → contact sheet
 * (WhatsApp/call/email). «حفظ» toggles ClientFavorite (the user's saved list).
 * WhatsApp lives in its own floating button; on desktop the hero CTA row + sidebar
 * take over.
 */
export function ClientBottomBar({
  clientId,
  clientName,
  clientSlug,
  clientLogoUrl,
  ctaMode,
  linkUrl,
  ctaLabel,
  phone,
  email,
  user,
  initialIsFollowing,
  initialIsFavorited,
}: ClientBottomBarProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const router = useRouter();
  const pathname = usePathname();

  const [following, setFollowing] = useState(initialIsFollowing);
  const [busy, setBusy] = useState(false);
  const [favorited, setFavorited] = useState(initialIsFavorited);
  const [favBusy, setFavBusy] = useState(false);

  const hasContact = !!phone || !!email;
  const hasCta = ctaMode === "FORM" || (ctaMode === "LINK" && !!linkUrl);
  const logoSrc = clientLogoUrl ? stripCloudinaryTransforms(clientLogoUrl) ?? clientLogoUrl : null;
  const badgeLabel =
    ctaMode === "FORM"
      ? ctaLabel?.trim() || "احجز الآن"
      : ctaMode === "LINK"
        ? ctaLabel?.trim() || "تسوّق الآن"
        : null;

  const col =
    "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-primary";
  const chipClass =
    "group absolute inset-x-0 bottom-1.5 mx-auto flex w-[72px] flex-col items-center gap-0.5";

  const handleFollow = async () => {
    if (!isLoggedIn) {
      router.push(`/users/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    const prev = following;
    setFollowing(!following);
    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(clientSlug)}/follow`, {
        method: following ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json()) as { success: boolean; data?: { isFollowing: boolean } };
      setFollowing(data?.success && data.data ? data.data.isFollowing : prev);
    } catch {
      setFollowing(prev);
    } finally {
      setBusy(false);
    }
  };

  // «حفظ» — toggle the client in the user's favorites (ClientFavorite). Login-gated.
  const handleFavorite = async () => {
    if (!isLoggedIn) {
      router.push(`/users/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (favBusy) return;
    setFavBusy(true);
    const prev = favorited;
    setFavorited(!favorited);
    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(clientSlug)}/favorite`, {
        method: favorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json()) as { success: boolean; data?: { isFavorited: boolean } };
      setFavorited(data?.success && data.data ? data.data.isFavorited : prev);
    } catch {
      setFavorited(prev);
    } finally {
      setFavBusy(false);
    }
  };

  const handleShare = async () => {
    const url = typeof location !== "undefined" ? location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: clientName, url });
      } else {
        await navigator.clipboard?.writeText(url);
      }
    } catch {
      /* user dismissed share — ignore */
    }
    fetch(`/api/clients/${encodeURIComponent(clientSlug)}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "NATIVE" }),
      keepalive: true,
    }).catch(() => {});
  };

  const handleReview = () => {
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // The raised logo + optional CTA badge — the tappable focal point.
  const chipInner = (
    <>
      <span className="relative inline-block">
        <span className="grid size-14 place-items-center overflow-hidden rounded-full bg-background shadow-lg shadow-primary/30 outline outline-[3px] outline-background ring-2 ring-primary/60 transition-transform group-active:scale-95">
          {logoSrc ? (
            <NextImage src={logoSrc} alt={clientName} width={56} height={56} className="size-full object-contain p-1.5" sizes="56px" />
          ) : (
            <IconClients className="size-7 text-primary" />
          )}
        </span>
        {/* verified mark — مدوّنتي */}
        <span
          className="absolute -bottom-0.5 -start-0.5 grid size-5 place-items-center rounded-full border-2 border-background bg-accent text-white"
          title="موثّق من مدوّنتي"
          aria-hidden
        >
          <IconCheck className="size-3" />
        </span>
      </span>
      {badgeLabel && (
        <span className="whitespace-nowrap rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold leading-tight text-black shadow-sm">
          {badgeLabel}
        </span>
      )}
    </>
  );

  return (
    <div className="sticky bottom-0 z-30 border-t border-border bg-background/98 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-[480px] items-stretch px-2 py-1.5">
        {/* start side (RTL right): follow + share */}
        <div className="flex flex-1 items-stretch">
          <button
            type="button"
            onClick={handleFollow}
            disabled={busy}
            aria-pressed={following}
            aria-label="متابعة"
            className={cn(col, following && "text-primary")}
          >
            {following ? <IconCheck className="size-6" /> : <IconUsers className="size-6" />}
            <span>{following ? "متابَع" : "متابعة"}</span>
          </button>
          <button type="button" onClick={handleShare} aria-label="مشاركة" className={col}>
            <IconShare className="size-6" />
            <span>مشاركة</span>
          </button>
        </div>

        {/* center: the client's raised logo → unified action sheet (CTA + contact) */}
        <div className="relative w-[78px] shrink-0">
          {hasCta || hasContact ? (
            <ClientContactSheet
              clientId={clientId}
              clientName={clientName}
              phone={phone}
              email={email}
              ctaMode={ctaMode}
              linkUrl={linkUrl}
              ctaLabel={ctaLabel}
              user={user}
            >
              <button
                type="button"
                aria-label={badgeLabel ? `${badgeLabel} — ${clientName}` : `تواصل مع ${clientName}`}
                className={chipClass}
              >
                {chipInner}
              </button>
            </ClientContactSheet>
          ) : (
            <div className={chipClass} aria-hidden>
              {chipInner}
            </div>
          )}
        </div>

        {/* end side (RTL left): save + review — balances the follow+share pair on the
            start side. «حفظ» adds the client to the user's favorites list to revisit;
            «تقييم» jumps to the reviews section. */}
        <div className="flex flex-1 items-stretch">
          <button
            type="button"
            onClick={handleFavorite}
            disabled={favBusy}
            aria-pressed={favorited}
            aria-label="حفظ في المفضلة"
            className={cn(col, favorited && "text-primary")}
          >
            <IconSaved className={cn("size-6", favorited && "fill-current")} />
            <span>{favorited ? "محفوظ" : "حفظ"}</span>
          </button>
          <button type="button" onClick={handleReview} aria-label="اكتب تقييم" className={col}>
            <IconFeatured className="size-6" />
            <span>تقييم</span>
          </button>
        </div>
      </div>
    </div>
  );
}
