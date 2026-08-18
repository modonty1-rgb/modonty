"use client";

import { signIn } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import { IconAi, IconLogin } from "@/lib/icons";
import { Button } from "@/components/ui/button";

/** Shown instead of the chat when nobody is signed in — the whole feature is account-only. */
export function LoginCard() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Without an explicit destination next-auth returns to its own default, so a visitor who
  // arrived with a question in the URL came back to the homepage and lost it.
  const query = searchParams.toString();
  const callbackUrl = query ? `${pathname}?${query}` : pathname;

  return (
    <div dir="rtl" className="flex flex-col h-full items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <IconAi className="h-8 w-8 text-primary" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
        مودو شات بانتظارك
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          تجريبي
        </span>
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
        سجّل دخولك للاستفادة من محادثات ذكية حول مقالاتك المفضلة
      </p>
      <Button onClick={() => signIn(undefined, { callbackUrl })} className="gap-2" size="lg">
        <IconLogin className="h-4 w-4" />
        تسجيل الدخول
      </Button>
    </div>
  );
}
