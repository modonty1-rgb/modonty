"use client";

import { signIn } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";

import { ModoCharacter } from "@modonty/shared/components/modo-character/ModoCharacter";
import { IconLogin } from "@/lib/icons";
import { Button } from "@/components/ui/button";

/**
 * The end of the free trial — an invitation, not a refusal.
 *
 * It appears INSIDE the conversation, under the answers the visitor already got, so what they
 * are asked to sign in for is on screen above it. The old design put the wall in front of an
 * empty page: the visitor was asked to pay with an account before seeing anything worth it.
 */
export function TrialWall() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Without an explicit destination next-auth returns to its own default, so a visitor who
  // arrived with a question in the URL came back to the homepage and lost it.
  const query = searchParams.toString();
  const callbackUrl = query ? `${pathname}?${query}` : pathname;

  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-md rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/10 to-primary/5 p-5 text-center"
      role="status"
    >
      <span className="mx-auto mb-3 block h-12 w-12 overflow-hidden rounded-xl ring-1 ring-primary/20">
        <ModoCharacter sizes="48px" decorative />
      </span>

      <p className="text-base font-bold text-foreground">خلّصت أسئلتك المجّانية</p>
      <p className="mx-auto mt-1.5 max-w-[300px] text-sm leading-relaxed text-muted-foreground">
        سجّل دخولك وأكمل — محادثتك تنحفظ لك، وترجع لها وقت ما تبي.
      </p>

      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={() => signIn(undefined, { callbackUrl })}
      >
        <IconLogin className="h-4 w-4" aria-hidden />
        سجّل دخولك وأكمل
      </Button>
    </div>
  );
}
