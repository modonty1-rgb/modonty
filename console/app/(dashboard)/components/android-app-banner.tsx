"use client";

import { useEffect, useState } from "react";
import { IconClose, IconDownload, IconMobile } from "@modonty/shared/lib/icons";

/**
 * بانر «تطبيق الأندرويد جاهز للتجربة» — التحميل من الكونسول نفسه بدل إرسال الملف لكل عميل.
 *
 * أغلب العملاء يفتحون الكونسول من الجوّال (خالد ٥ أكتوبر ٢٠٢٦)، فالشكل يتبع الجهاز:
 *  - أندرويد: زرّ تحميل مباشر + خطوات التثبيت.
 *  - كمبيوتر: QR يصوّره العميل بجوّاله — وعلى الشاشة الضيّقة زرّ تحميل بدله.
 *  - آيفون: تنويه أن نسخته قيد التطوير، بلا زرّ — كي لا يظنّ العميل أنه مستثنى.
 * الجهاز يُعرف بعد التركيب لا على الخادم، فلا يظهر شيء حتى يُحسم (بلا وميض شكلٍ خاطئ).
 * يُغلق ويُحفظ الإغلاق في المتصفّح: من ثبّت التطبيق لا يُلاحَق بالبانر.
 */
const DISMISS_KEY = "modonty-android-banner-dismissed";
const DOWNLOAD_PATH = "/android";

type Device = "android" | "ios" | "desktop";

function detectDevice(ua: string): Device {
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return "desktop";
}

export function AndroidAppBanner() {
  const [device, setDevice] = useState<Device | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDevice(detectDevice(navigator.userAgent));
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (device === null || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // التخزين محجوب (تصفّح خاص) — يُغلق لهذه الزيارة فقط.
    }
  };

  return (
    <section
      aria-label="تطبيق مدونتي للجوّال"
      className="relative flex flex-wrap items-center gap-3 rounded-lg border border-primary/25 bg-primary/[0.06] px-3 py-3 sm:flex-nowrap sm:gap-4 sm:px-4"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="إخفاء"
        className="absolute end-1 top-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
      >
        <IconClose className="h-4 w-4" />
      </button>

      <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-primary/15 sm:flex">
        <IconMobile className="h-6 w-6" />
      </span>

      <div className="min-w-0 flex-1 pe-8">
        <p className="text-sm font-semibold">
          {device === "ios" ? "تطبيق مدونتي للآيفون قيد التطوير" : "تطبيق مدونتي للأندرويد جاهز للتجربة"}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {device === "ios"
            ? "نبلّغك أوّل ما تجهز."
            : "طلباتك وردودك وتنبيهاتك على جوّالك. نسخة الآيفون قيد التطوير."}
        </p>

        {device === "android" && (
          <details className="mt-2 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">طريقة التثبيت</summary>
            <ol className="mt-1.5 list-decimal space-y-0.5 ps-5 leading-relaxed">
              <li>اضغط «حمّل التطبيق» وانتظر انتهاء التحميل.</li>
              <li>افتح الملف من إشعار التحميل.</li>
              <li>إن طلب الجوّال إذناً، اسمح بالتثبيت من هذا المصدر ثم اضغط «تثبيت».</li>
              <li>ادخل بنفس بريدك وكلمة مرورك في الكونسول.</li>
            </ol>
          </details>
        )}
      </div>

      {device !== "ios" && (
        // الزرّ لأيّ شاشة جوّال، والـQR للكمبيوتر الواسع فقط — شاشة ضيّقة لا تصوّر نفسها.
        <a
          href={DOWNLOAD_PATH}
          className={`w-full shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto ${
            device === "android" ? "inline-flex" : "inline-flex sm:hidden"
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded bg-white">
            <IconDownload className="h-4 w-4" />
          </span>
          حمّل التطبيق
        </a>
      )}
      {device === "desktop" && (
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <p className="max-w-[11rem] text-xs leading-relaxed text-muted-foreground">
            صوّر الرمز بكاميرا جوّالك الأندرويد لتحميل التطبيق
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG ثابت صغير، لا يحتاج تحسين الصور */}
          <img
            src="/android-qr.svg"
            alt="رمز QR لتحميل تطبيق مدونتي للأندرويد"
            width={104}
            height={104}
            className="h-[104px] w-[104px] shrink-0 rounded-md border bg-white p-1"
          />
        </div>
      )}
    </section>
  );
}
