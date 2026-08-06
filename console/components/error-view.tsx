"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Copy, LifeBuoy, RefreshCw, Wrench, WifiOff } from "lucide-react";

interface ErrorViewProps {
  error: Error & { digest?: string };
  /** Next re-fetches and re-renders the failed segment. */
  retry: () => void;
  /** `full` centers on a blank screen (root/global boundary), `inline` sits inside the dashboard shell. */
  layout?: "full" | "inline";
}

/**
 * The screen a client lands on when something in the console breaks.
 *
 * Two things decide the tone here. First, the person reading it did nothing wrong and
 * cannot fix anything — so the copy takes the blame, tells them their data is intact,
 * and hands them one obvious button. Second, an error boundary only ever catches a
 * FAILED RENDER: saves go through server actions that return errors instead of throwing,
 * so "nothing you saved is lost" is a fact here, not a comforting guess.
 *
 * The offline case is split out because the reassuring version ("the fault is ours") is
 * simply false when their connection dropped, and sending them to retry a dead network
 * with no explanation is how a person ends up thinking the platform is broken.
 */
export function ErrorView({ error, retry, layout = "full" }: ErrorViewProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  // The digest is the only thread between what the client sees and the server-side log
  // (admin /system-errors). Without it, "it broke yesterday" is untraceable.
  //
  // Its ABSENCE is just as informative: Next attaches a digest only to errors forwarded
  // from the server, which `instrumentation.onRequestError` has already logged. So a
  // digest-less error came from the browser, and nothing anywhere recorded it — report it
  // ourselves rather than let it disappear the moment the client closes the tab.
  useEffect(() => {
    console.error("Console error boundary:", error);
    if (error.digest) return;

    fetch("/api/log-client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || "Unknown client error",
        path: window.location.pathname,
      }),
      // Survives the client navigating away mid-report — the whole point is that they
      // usually do exactly that.
      keepalive: true,
    }).catch(() => {
      // They are already looking at an error screen; a failed report changes nothing.
    });
  }, [error]);

  const copyDigest = async () => {
    if (!error.digest) return;
    try {
      await navigator.clipboard.writeText(error.digest);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // clipboard blocked (insecure context / permission) — the code is on screen anyway
    }
  };

  const Icon = isOnline ? Wrench : WifiOff;

  return (
    <div
      dir="rtl"
      className={
        layout === "full"
          ? "min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-amber-500/5 px-4 py-12"
          : "flex items-center justify-center px-4 py-16"
      }
    >
      <div className="w-full max-w-lg text-center">
        {/* Calm, not alarming — this is almost always temporary */}
        <div className="relative mx-auto mb-8 h-32 w-32">
          <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-2xl" aria-hidden="true" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/15">
            <Icon className="h-14 w-14 text-amber-600" aria-hidden="true" strokeWidth={1.5} />
          </div>
        </div>

        {isOnline ? (
          <>
            <h1 className="mb-3 text-2xl font-bold sm:text-3xl">
              الصفحة ما فتحت — والغلط من عندنا
            </h1>
            <p className="mx-auto mb-8 max-w-md leading-relaxed text-muted-foreground">
              صار خلل عندنا وإحنا نجهّز بيانات الصفحة. كل اللي حفظته موجود زي ما هو،
              ما ضاع منك شي. جرّب مرة ثانية وغالباً تفتح عادي.
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-3 text-2xl font-bold sm:text-3xl">
              يبدو إن النت فصل
            </h1>
            <p className="mx-auto mb-8 max-w-md leading-relaxed text-muted-foreground">
              ما قدرنا نوصل للسيرفر. تأكد من اتصالك بالإنترنت وجرّب مرة ثانية —
              شغلك المحفوظ ما تأثر.
            </p>
          </>
        )}

        {/* One obvious action first, an escape second */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-center">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/dashboard">لوحة التحكم</Link>
          </Button>
          <Button onClick={retry} className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            حاول مرة ثانية
          </Button>
        </div>

        {/* Hidden while offline: the digest points at a SERVER-side log entry, which a
            dropped connection never produced — and asking someone with no internet to
            send us a code is worse than saying nothing. */}
        {isOnline && error.digest && (
          <div className="mt-10 rounded-lg border bg-muted/40 p-4 text-start">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">رقم العطل</p>
                <code className="block truncate font-mono text-sm" dir="ltr">
                  {error.digest}
                </code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyDigest}
                className="shrink-0 gap-1.5"
                aria-label="نسخ رقم العطل"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    نسخ
                  </>
                )}
              </Button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              لو تكرّر معك، أرسل لنا الرقم هذا — يوصلنا للعطل بالضبط بدل ما ندوّر.
            </p>
          </div>
        )}

        {/* Dev only: production hides the real message on purpose (Next serializes a
            generic one to avoid leaking server details to the browser). */}
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 overflow-x-auto rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-start font-mono text-xs text-destructive" dir="ltr">
            {error.message}
          </pre>
        )}

        <div className="mt-10 border-t pt-6">
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <LifeBuoy className="h-4 w-4" aria-hidden="true" />
            لسه ما ضبط؟ افتح مركز المساعدة
          </Link>
        </div>
      </div>
    </div>
  );
}
