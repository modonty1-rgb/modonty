"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconError, IconHome, IconRefresh } from "@/lib/icons";

interface RouteErrorProps {
  error: Error & { digest?: string };
  /**
   * Next 16's `retry` — re-FETCHES and re-renders the segment.
   * `reset` is deliberately not accepted: it re-renders without re-fetching
   * (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md:157`),
   * so on a bad server payload it replays the same bad payload and the button does nothing.
   */
  retry: () => void;
  /** What the visitor was trying to open, in their words: «صفحة الشريك» · «قائمة المقالات». */
  what: string;
  /** Where to send them instead of the homepage, when the parent listing is the better answer. */
  back?: { href: string; label: string };
}

/** كم مرّة نحاول التعافي تلقائياً قبل ما نُظهر البطاقة. */
const AUTO_RETRIES = 1;
/** نافذة تمنع حلقة إعادة تحميل لا تنتهي على عطل دائم. */
const WINDOW_MS = 20_000;

/**
 * The error boundary every route shares.
 *
 * One component, not one copy per route: the twenty-two boundaries written before this each
 * carried their own seventy lines of the same card, so a wording or a11y fix had to be made
 * twenty-two times and never was. Routes pass what the visitor was opening and where to send
 * them back; everything else is identical by definition.
 *
 * ── لماذا يتعافى وحده (٣١ أغسطس ٢٠٢٦) ────────────────────────────────────────
 * قِيس على الإنتاج: التنقّل الداخلي إلى صفحة نسختُها في الكاش `STALE` يستقبل أحياناً
 * ردّاً سليم الشكل وفارغ الجسم — `200` مع `content-type: text/x-component` وصفر بايت.
 * حارس Next نفسه (`fetch-server-response.ts`) يفحص `!res.body` لا فراغه، فيمرّ الردّ
 * ثم يفشل تحليله، فتظهر هذه الشاشة على مقال سليم تماماً.
 *
 * فالبطاقة لم تعد أول ما يراه الزائر: نحاول الجلب مرّة تلقائياً، ثم ننتقل انتقالاً
 * كاملاً (وهو ما يفعله Next نفسه في `doMpaNavigation` حين يتعذّر عليه قراءة الحمولة)،
 * ولا تظهر البطاقة إلا إذا فشل الاثنان — أي حين يكون العطل حقيقياً لا عابراً.
 */
export function RouteError({ error, retry, what, back }: RouteErrorProps) {
  const [recovering, setRecovering] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // العدّاد في sessionStorage لأن `retry()` يعيد تركيب المكوّن فتضيع حالته.
    const key = `route-error:${window.location.pathname}`;
    let attempts = 0;
    let firstAt = Date.now();
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw) as { n: number; t: number };
        if (Date.now() - saved.t < WINDOW_MS) {
          attempts = saved.n;
          firstAt = saved.t;
        }
      }
    } catch {
      // الوضع الخاصّ أو تخزين محجوب — نكمل بلا عدّاد، والسقف يبقى محفوظاً بالمحاولة الواحدة.
    }

    if (attempts >= AUTO_RETRIES + 1) {
      setRecovering(false);
      return;
    }

    const next = { n: attempts + 1, t: firstAt };
    try {
      sessionStorage.setItem(key, JSON.stringify(next));
    } catch {
      // مثل أعلاه.
    }

    // بلا دالّة تنظيف عمداً: رياكت يفكّك هذا المكوّن ويعيد تركيبه أثناء التعافي نفسه،
    // ودالّة التنظيف كانت تُلغي المؤقّت فتعلق الشاشة على «لحظة، نفتح» إلى الأبد
    // (مقيس ٣١ أغسطس: عطل دائم ⇒ العدّاد يقف عند ٢ والبطاقة لا تصل). العدّاد أعلاه
    // هو الحدّ، لا المؤقّت.
    setTimeout(() => {
      if (attempts < AUTO_RETRIES) {
        // المحاولة الأولى: إعادة جلب الحمولة من جديد.
        retry();
      } else {
        // الثانية: انتقال كامل — يتجاوز حمولة RSC المعطوبة كما يفعل Next عند تعذّر قراءتها.
        window.location.reload();
      }
    }, 400);
  }, [retry]);

  // نجح التعافي؟ المكوّن يُفكَّك أصلاً. فشل؟ نُفرغ العدّاد كي لا يُحسب على زيارة قادمة.
  useEffect(() => {
    if (recovering) return;
    try {
      sessionStorage.removeItem(`route-error:${window.location.pathname}`);
    } catch {
      // مثل أعلاه.
    }
  }, [recovering]);

  if (recovering) {
    return (
      <div className="container mx-auto max-w-[1128px] px-4 py-16">
        <div
          className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <IconRefresh className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">لحظة، نفتح {what} من جديد…</p>
        </div>
      </div>
    );
  }

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
            <Button onClick={() => retry()} className="gap-2">
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
