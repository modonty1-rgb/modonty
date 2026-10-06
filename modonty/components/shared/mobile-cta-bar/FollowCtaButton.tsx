"use client";

import { Suspense, useEffect, useState } from "react";

import { useSession } from "@/components/providers/SessionContext";

import { AuthPromptLazy, warmAuthPrompt } from "@/components/shared/auth-prompt/AuthPromptLazy";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModontyNotificationsMark } from "@/components/icons/modonty-notifications-mark";
import { IconCheck } from "@/lib/icons";

import { CTA_BAR_PRIMARY_CLASS } from "./MobileCtaBar";

/** Set before the sign-in round trip, read on return — so the follow the reader asked for happens. */
const PENDING_KEY = "modonty_follow_pending";

/**
 * «تابع مدونتي» — a real follow (Khalid, 3 Oct 2026). It used to open the sign-in dialog and stop
 * there: nothing was saved, and a signed-in reader got the same dialog again. Now it follows the
 * Client row that IS Modonty, through the same `/clients/[slug]/api/follow` every partner page uses,
 * so the follow lands in the reader's «المتابَعون» and in Modonty's followers like any other.
 *
 *   signed in    → tap follows · tap again unfollows · the label says which
 *   signed out   → sign-in dialog; the request is remembered and done on return
 *
 * Stage 2 (sending followers Modonty's news) is a separate decision — the dialog no longer promises it.
 * The dialog itself is lazy and warmed on pointer-down, so a reader who never taps downloads none of it.
 */
export function FollowCtaButton({ clientSlug }: { clientSlug: string | null }) {
  // The site's session hook suspends until the session resolves — the shell keeps the bar in the
  // static HTML, looking exactly the same, until it does.
  return (
    <Suspense
      fallback={
        <button type="button" className={cn(buttonVariants({ variant: "ghost" }), CTA_BAR_PRIMARY_CLASS)}>
          <ModontyNotificationsMark className="!size-5 shrink-0 [--modonty-notifications-accent:white]" aria-hidden />
          تابع مدونتي
        </button>
      }
    >
      <FollowCtaButtonLive clientSlug={clientSlug} />
    </Suspense>
  );
}

function FollowCtaButtonLive({ clientSlug }: { clientSlug: string | null }) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const api = clientSlug ? `/clients/${encodeURIComponent(clientSlug)}/api/follow` : null;

  const send = async (method: "POST" | "DELETE") => {
    if (!api) return;
    setBusy(true);
    try {
      const res = await fetch(api, { method });
      const body = (await res.json()) as { success: boolean; data?: { isFollowing: boolean } };
      if (body.success && body.data) setFollowing(body.data.isFollowing);
    } finally {
      setBusy(false);
    }
  };

  // Signed in: read the current state, and finish a follow asked for before the sign-in.
  useEffect(() => {
    if (status !== "authenticated" || !api) return;
    let pending = false;
    try {
      pending = sessionStorage.getItem(PENDING_KEY) === "1";
      sessionStorage.removeItem(PENDING_KEY);
    } catch {}
    if (pending) {
      void send("POST");
      return;
    }
    fetch(api)
      .then((r) => r.json())
      .then((b: { success: boolean; data?: { isFollowing: boolean } }) => b.success && b.data && setFollowing(b.data.isFollowing))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, api]);

  const onTap = () => {
    if (status !== "authenticated") {
      try {
        sessionStorage.setItem(PENDING_KEY, "1");
      } catch {}
      setOpen(true);
      return;
    }
    void send(following ? "DELETE" : "POST");
  };

  return (
    <>
      <button
        type="button"
        onClick={onTap}
        onPointerDown={status === "authenticated" ? undefined : warmAuthPrompt}
        disabled={busy}
        aria-pressed={following}
        className={cn(buttonVariants({ variant: "ghost" }), CTA_BAR_PRIMARY_CLASS)}
      >
        {following ? (
          <IconCheck className="!size-5 shrink-0" aria-hidden />
        ) : (
          <ModontyNotificationsMark className="!size-5 shrink-0 [--modonty-notifications-accent:white]" aria-hidden />
        )}
        {following ? "تتابع مدونتي" : "تابع مدونتي"}
      </button>
      {open && (
        <AuthPromptLazy
          open={open}
          onOpenChange={(next) => {
            // Closed without signing in → the request is dropped, so a later sign-in does not follow by surprise.
            if (!next) {
              try {
                sessionStorage.removeItem(PENDING_KEY);
              } catch {}
            }
            setOpen(next);
          }}
          action="follow"
        />
      )}
    </>
  );
}
