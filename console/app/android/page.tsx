import type { Metadata } from "next";
import { headers } from "next/headers";
import { IconDownload, IconMobile } from "@modonty/shared/lib/icons";

/**
 * صفحة تحميل «بوابة مدونتي» للأندرويد — يفتحها الـQR وبانر الكونسول.
 *
 * كانت `/android` تحويلاً مباشراً إلى ملف الـAPK. على جوال خالد (٥ أكتوبر ٢٠٢٦) صوّر الـQR فلم
 * يبدأ أي تحميل: لا ملف في التنزيلات ولا جلسة تثبيت. السبب أن الكاميرا وواتساب وإنستغرام تفتح
 * الرابط في متصفّح داخلي يبتلع تحميل الملفات بصمت. فالصفحة الآن:
 *  - زرّ تحميل صريح يضغطه العميل بنفسه (`/android/download`)، وخطوات التثبيت تحته.
 *  - داخل متصفّح تطبيق: زرّ «افتح في كروم» أوّلاً — رابط intent يفتح الصفحة نفسها في كروم.
 *  - آيفون: تنويه أن نسخته قيد التطوير بلا زرّ.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تطبيق بوابة مدونتي للأندرويد",
  robots: { index: false, follow: false },
};

const IN_APP_BROWSER = /WhatsApp|Instagram|FBAN|FBAV|FB_IAB|Line\/|Snapchat|GSA\/|; wv\)/i;
const CHROME_INTENT = "intent://console.modonty.com/android#Intent;scheme=https;package=com.android.chrome;end";

export default async function AndroidDownloadPage() {
  const ua = (await headers()).get("user-agent") ?? "";
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const inAppBrowser = !isIos && IN_APP_BROWSER.test(ua);

  return (
    <main dir="rtl" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-10 font-[Tajawal,sans-serif]">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-primary/15">
          <IconMobile className="h-9 w-9" />
        </span>
        <h1 className="text-2xl font-bold text-foreground">بوابة مدونتي</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          طلباتك وردودك وتنبيهاتك على جوّالك — نفس حسابك في الكونسول.
        </p>
      </div>

      {isIos ? (
        <p className="rounded-xl border border-primary/25 bg-primary/[0.06] p-4 text-center text-sm leading-relaxed">
          نسخة الآيفون قيد التطوير — نبلّغك أوّل ما تجهز.
        </p>
      ) : (
        <>
          {inAppBrowser ? (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-4">
              <p className="text-sm font-semibold">افتح الصفحة في كروم أوّلاً</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                المتصفّح داخل هذا التطبيق لا يحمّل الملفات. اضغط الزر يفتحها لك في كروم، ثم حمّل من هناك.
              </p>
              <a href={CHROME_INTENT} className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">
                افتح في كروم
              </a>
            </div>
          ) : null}

          <a
            href="/android/download"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-base font-bold text-primary-foreground shadow-sm"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded bg-white">
              <IconDownload className="h-5 w-5" />
            </span>
            حمّل التطبيق (حوالي ٦١ ميجا)
          </a>

          <ol className="list-decimal space-y-2 rounded-xl border bg-card p-4 ps-8 text-sm leading-relaxed text-foreground">
            <li>تأكّد أن في جوّالك مساحة فارغة أكثر من ١ جيجا — الجوّال الممتلئ يعلّق التثبيت.</li>
            <li>اضغط «حمّل التطبيق» وانتظر حتى يكتمل التحميل (دقيقة أو دقيقتين).</li>
            <li>افتح الملف من إشعار التحميل أو من «التنزيلات»، ثم اضغط «تثبيت» (Install).</li>
            <li>إن طلب الجوّال إذناً، اسمح بالتثبيت من هذا المصدر.</li>
            <li>افتح «بوابة مدونتي» وادخل بنفس بريدك وكلمة مرورك في الكونسول.</li>
          </ol>

          {/* مقيس على جوال خالد ٥ أكتوبر ٢٠٢٦: نافذة Play Protect تظهر بعد «Install» بثوانٍ،
              وشاشة «Installing…» تبقى ظاهرة حتى بعد اكتمال التثبيت — فيظنّ العميل أنه علّق. */}
          <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-4 text-sm leading-relaxed">
            <p className="font-semibold">لو ظهرت لك رسالة Google Play Protect</p>
            <p className="text-muted-foreground">
              رسالة «App scan recommended» طبيعية لأي تطبيق من خارج المتجر. اضغط «Scan app» وانتظر
              دقيقة أو دقيقتين حتى يكتمل الفحص والتثبيت.
            </p>
            <p className="font-semibold">لو بقيت شاشة «Installing…» أكثر من دقيقتين</p>
            <p className="text-muted-foreground">
              ارجع للشاشة الرئيسية وابحث عن «بوابة مدونتي» بين تطبيقاتك — غالباً اكتمل التثبيت والشاشة لم تتحدّث.
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground">الإصدار 1.0.0 · آخر تحديث ٦ أكتوبر ٢٠٢٦</p>
        </>
      )}
    </main>
  );
}
