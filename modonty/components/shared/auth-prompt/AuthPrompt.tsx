"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { GoogleIcon } from "@modonty/shared/components/icons/google-icon";
import { IconLoading, IconLike, IconSaved, IconComment, IconBell } from "@/lib/icons";

interface AuthPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What the reader was trying to do — the dialog says it back to them. */
  action: "like" | "save" | "comment" | "follow";
}

const ASKED_FOR = {
  like: { Icon: IconLike, line: "عشان نحفظ إعجابك" },
  save: { Icon: IconSaved, line: "عشان نحفظ المقال في قائمتك" },
  comment: { Icon: IconComment, line: "عشان نعرف مين صاحب التعليق" },
  // The only one of the four that is not a reaction to something on screen — it is the
  // page's main ask on `/modonty`, where the reader has nothing to like or save yet.
  // كان «عشان يوصلك جديدنا أول بأول» — وما فيه شيء يرسل الجديد للمتابع بعد (المرحلة ٢، خالد ٣ أكتوبر ٢٠٢٦).
  follow: { Icon: IconBell, line: "عشان نحفظ متابعتك لمدونتي" },
} as const;

/**
 * Sign in without leaving the article.
 *
 * The reader used to be pushed to `/users/register`, and two things were broken there: the page
 * ignored `callbackUrl` entirely (`register-form.tsx:49,77` sent everyone to "/"), and the link
 * carried the wrong path — measured live, `?callbackUrl=/users/register`, pointing at itself.
 * Anyone who tapped «أعجبني» lost the article. Both faults disappear here: there is no path to
 * remember and no return to manage.
 *
 * Deliberately NOT the full registration form. That one pulls react-hook-form, a resolver and a
 * schema — weight this page has no reason to carry for someone who only wanted to tap a heart.
 * One Google button covers the common case in a single tap; the email path keeps its own page,
 * one link away. `signIn` is free here: `next-auth/react` is already loaded because the
 * engagement bar reads the session.
 *
 * Built on the shared shadcn dialog rather than a hand-rolled overlay, so focus trapping, the
 * escape key, the scroll lock and the close button behave like every other dialog in the app.
 */
export function AuthPrompt({ open, onOpenChange, action }: AuthPromptProps) {
  const [busy, setBusy] = useState(false);
  const { Icon, line } = ASKED_FOR[action];
  // Both email links bring the reader back to this page — login and register both honour it.
  const back = `?callbackUrl=${encodeURIComponent(usePathname() || "/")}`;

  const withGoogle = () => {
    setBusy(true);
    // Google's round trip is the one navigation that genuinely has to leave — and it returns to
    // this exact article, not to the homepage.
    signIn("google", { callbackUrl: window.location.href });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The shared primitive is `w-full` with `sm:rounded-lg`, so on a phone it lands as a
          square-cornered slab touching both screen edges — measured 390×250 at x=0. A margin and
          a radius make it read as a card floating over the article, which is what it is. */}
      <DialogContent className="w-[calc(100%-2rem)] rounded-xl sm:max-w-[400px]" dir="rtl">
        <DialogHeader className="items-start text-start">
          <span className="mb-1 grid size-11 place-items-center rounded-full bg-primary/10 text-link">
            <Icon className="size-5" aria-hidden />
          </span>
          <DialogTitle className="text-base">سجّل دخولك بثانية</DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            {line} — وترجع لمكانك على طول.
          </DialogDescription>
        </DialogHeader>

        <Button onClick={withGoogle} disabled={busy} className="h-11 w-full gap-2 font-bold">
          {busy ? (
            <IconLoading className="size-4 animate-spin" aria-hidden />
          ) : (
            <GoogleIcon />
          )}
          تابع بحساب Google
        </Button>

        {/* An email account holder had no way in from here — only «أنشئ حساباً», which invites a
            duplicate sign-up (QA finding #12, 29 Sep 2026). */}
        <DialogFooter className="flex-col gap-1 sm:flex-col sm:justify-center">
          <p className="text-center text-xs text-muted-foreground">
            عندك حساب بالإيميل؟{" "}
            <Link href={`/users/login${back}`} className="inline-flex min-h-11 items-center font-bold text-link hover:underline">
              سجّل دخولك
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            جديد هنا؟{" "}
            <Link href={`/users/register${back}`} className="inline-flex min-h-11 items-center font-bold text-link hover:underline">
              أنشئ حساباً بالإيميل
            </Link>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
