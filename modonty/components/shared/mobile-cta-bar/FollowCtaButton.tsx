"use client";

import { useState } from "react";

import { AuthPromptLazy, warmAuthPrompt } from "@/components/shared/auth-prompt/AuthPromptLazy";
import { buttonVariants } from "@/components/ui/button";
import { ModontyNotificationsMark } from "@/components/icons/modonty-notifications-mark";

import { CTA_BAR_PRIMARY_CLASS } from "./MobileCtaBar";

/**
 * «تابع مدونتي» — the bottom bar's main ask on a reader's page.
 *
 * It replaced «صِر شريكاً» there on 22 Aug (Khalid). That link spent 65px of EVERY screen
 * sending the reader OFF the site to jbrseo.com — a sales funnel aimed at a business owner,
 * shown to someone who came to read. «صِر شريكاً» did not disappear; it moved to the
 * quieter second slot, so the door is still there for the visitor who actually wants it.
 *
 * The bar itself stays a Server Component: only this one button is client code, and the
 * dialog behind it is lazy, so a reader who never taps downloads none of it. `warmAuthPrompt`
 * on pointer-down fetches that chunk while the finger is still down, so the tap opens the
 * dialog instead of starting a download.
 */
export function FollowCtaButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onPointerDown={warmAuthPrompt}
        className={buttonVariants({ variant: "ghost", className: CTA_BAR_PRIMARY_CLASS })}
      >
        <ModontyNotificationsMark className="!size-6 shrink-0 [--modonty-notifications-accent:white]" aria-hidden />
        تابع مدونتي
      </button>
      {open && <AuthPromptLazy open={open} onOpenChange={setOpen} action="follow" />}
    </>
  );
}
