"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { GoogleIcon } from "@/components/auth/google-icon";
import { IconLoading, IconLike, IconSaved, IconComment } from "@/lib/icons";

interface AuthPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What the reader was trying to do — the dialog says it back to them. */
  action: "like" | "save" | "comment";
}

const ASKED_FOR = {
  like: { Icon: IconLike, line: "عشان نحفظ إعجابك" },
  save: { Icon: IconSaved, line: "عشان نحفظ المقال في قائمتك" },
  comment: { Icon: IconComment, line: "عشان نعرف مين صاحب التعليق" },
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

        <Button onClick={withGoogle} disabled={busy} className="h-11 w-full gap-2 font-semibold">
          {busy ? (
            <IconLoading className="size-4 animate-spin" aria-hidden />
          ) : (
            <GoogleIcon />
          )}
          تابع بحساب Google
        </Button>

        <DialogFooter className="sm:justify-center">
          <p className="text-center text-[12px] text-muted-foreground">
            تفضّل الإيميل؟{" "}
            <Link href="/users/register" className="font-semibold text-link hover:underline">
              أنشئ حساباً
            </Link>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
