"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconError, IconHome, IconRefresh } from "@/lib/icons";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** What the visitor was trying to open, in their words: «صفحة الشريك» · «قائمة المقالات». */
  what: string;
  /** Where to send them instead of the homepage, when the parent listing is the better answer. */
  back?: { href: string; label: string };
}

/**
 * The error boundary every route shares.
 *
 * One component, not one copy per route: the twenty-two boundaries written before this each
 * carried their own seventy lines of the same card, so a wording or a11y fix had to be made
 * twenty-two times and never was. Routes pass what the visitor was opening and where to send
 * them back; everything else is identical by definition.
 *
 * `error.tsx` is always a Client Component — that is Next's contract, not a choice — so the
 * shared chunk is loaded once and the per-route file stays a few lines.
 */
export function RouteError({ error, reset, what, back }: RouteErrorProps) {
  return (
    <div className="container mx-auto max-w-[1128px] px-4 py-16">
      <Card className="mx-auto max-w-xl border-destructive/40">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
          <IconError className="h-12 w-12 text-destructive" aria-hidden />

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{what} ما فتحت</h1>
            <p className="text-sm text-muted-foreground">
              صار خلل من عندنا، مو من عندك. جرّب مرة ثانية — وإذا تكرّر، خبّرنا.
            </p>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="w-full rounded-md bg-muted p-3 text-start" dir="ltr">
              <p className="font-mono text-xs text-destructive">{error.message}</p>
              {error.digest && (
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">digest: {error.digest}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={reset} className="gap-2">
              <IconRefresh className="h-4 w-4" aria-hidden />
              جرّب مرة ثانية
            </Button>
            {back && (
              <Button asChild variant="outline">
                <Link href={back.href}>{back.label}</Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="gap-2">
              <Link href="/">
                <IconHome className="h-4 w-4" aria-hidden />
                الرئيسية
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
