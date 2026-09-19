"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Loader2, KeyRound, Copy, Check, RefreshCw, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendClientWelcome } from "../../../actions/clients-actions";
import type { WelcomePreview as Preview } from "../helpers/build-welcome-preview";

/**
 * **مرحلتان: تُقرأ ثمّ تُرسَل.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «صفحةٌ أشوف فيها الرسالة، لأنّ فيها باسورد أبغى أشوفها وأشوف
 * التمبلت اللي شغّالة، ومن هناك الإرسال يتمّ».
 *
 * كان زرّاً واحداً يرسل بلا أن يرى أحدٌ ما أُرسل — ولا سبيلَ لمراجعته بعدها: المخزَّن
 * هشٌّ، والبريدُ خرج. فصار ما يُعرض هنا **هو** ما يصل: القالبُ مرسومٌ بنفس الدالّة،
 * والكلمةُ المعروضة تُمرَّر إلى الإرسال كما هي.
 *
 * ⚠ وكلُّ إعادةِ تحميلٍ تولّد كلمةً جديدة — لا شيءَ يُكتب حتّى تُضغط «أرسل».
 */
export function WelcomePreview({ preview }: { preview: Preview }) {
  const router = useRouter();
  const { toast } = useToast();
  const [sending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(preview.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ variant: "destructive", title: "تعذّر النسخ", description: "انسخها يدويّاً." });
    }
  }

  function send() {
    start(async () => {
      const res = await sendClientWelcome(preview.clientId, preview.password);
      if (!res.success) {
        toast({ variant: "destructive", title: "تعذّر الإرسال", description: res.error });
        return;
      }
      setSent(true);
      toast({ title: "أُرسلت بيانات الدخول", description: `وصلت بياناتُ الدخول إلى ${preview.email}.` });
      router.refresh();
    });
  }

  return (
    <main dir="rtl" className="mx-auto flex max-w-3xl flex-col gap-4 pb-10">
      <header className="flex items-center gap-2">
        <Link
          href={`/clients/${preview.clientId}/edit`}
          aria-label="رجوع لصفحة العميل"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
        >
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">بيانات الدخول — {preview.clientName}</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            راجع ما سيصله ثمّ أرسل. لا شيءَ يُحفظ قبل الضغط.
          </p>
        </div>
      </header>

      {preview.blocked ? (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-[12px] text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {preview.blocked}
        </p>
      ) : (
        <>
          <section className="rounded-2xl border bg-card">
            <dl className="grid grid-cols-1 gap-x-6 px-4 py-1 sm:grid-cols-2">
              <Row label="إلى" value={preview.email} ltr />
              <Row label="الموضوع" value={preview.subject} />
            </dl>

            {/**
              * الكلمةُ بارزةٌ ومنسوخة: هي الشيءُ الوحيدُ في الرسالة الذي لا يُسترجَع بعد
              * الإرسال — المخزَّنُ هشٌّ. فمن أراد إملاءها بالهاتف يقرؤها من هنا.
              */}
            <div className="flex flex-wrap items-center gap-3 border-t px-4 py-3">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
                <KeyRound className="size-3.5" aria-hidden />
                كلمة المرور التي ستُرسَل
              </span>
              <code dir="ltr" className="rounded-md border bg-muted px-2.5 py-1 font-mono text-[13px] font-bold tracking-wider">
                {preview.password}
              </code>
              <Button type="button" size="sm" variant="ghost" onClick={copy} className="h-7 gap-1 text-[11px]">
                {copied ? <Check className="size-3" aria-hidden /> : <Copy className="size-3" aria-hidden />}
                {copied ? "نُسخت" : "انسخ"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => router.refresh()} className="h-7 gap-1 text-[11px]">
                <RefreshCw className="size-3" aria-hidden />
                ولّد غيرها
              </Button>
            </div>

            {preview.hasStoredPassword && (
              <p className="border-t px-4 py-2 text-[11.5px] text-amber-700 dark:text-amber-400">
                للعميل كلمةٌ محفوظةٌ الآن — الإرسالُ يستبدلها بهذه.
              </p>
            )}
          </section>

          {/**
            * القالبُ في `iframe` بـ`srcDoc`: بريدُ HTML يحمل أنماطَه الخاصّة، وحقنُه في
            * الصفحة يخلط أنماطَه بأنماط الأدمن فيُرى غيرَ ما يصل. و`sandbox` بلا
            * `allow-scripts` — لا نُشغّل ما لا نكتبه.
            */}
          <section className="overflow-hidden rounded-2xl border bg-card">
            <h2 className="border-b px-4 py-2.5 text-sm font-semibold">معاينة الرسالة</h2>
            <iframe
              title="معاينة بيانات الدخول"
              srcDoc={preview.html}
              sandbox=""
              className="h-[520px] w-full bg-white"
            />
          </section>

          <div className="flex items-center gap-3">
            <Button onClick={send} disabled={sending || sent} size="lg" className="gap-2">
              {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Mail className="size-4" aria-hidden />}
              {sending ? "جارٍ الإرسال…" : sent ? "أُرسلت" : "أرسل الآن"}
            </Button>
            {sent && (
              <span className="text-[12px] text-emerald-700 dark:text-emerald-400">
                وصلت إلى {preview.email} — وكلمةُ المرور صارت هي المحفوظة.
              </span>
            )}
          </div>
        </>
      )}
    </main>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-2 last:border-0 sm:[&:nth-last-child(-n+2)]:border-0">
      <dt className="shrink-0 text-[12px] text-muted-foreground">{label}</dt>
      <dd dir={ltr ? "ltr" : undefined} className={`min-w-0 truncate text-[13px] font-medium ${ltr ? "text-start" : "text-end"}`}>
        {value || "—"}
      </dd>
    </div>
  );
}
