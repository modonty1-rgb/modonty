"use client";

import { createElement, useEffect } from "react";

/**
 * ويدجت تمارا الرسمي — جدول الدفعات كما تحسبه تمارا لا كما نخمّنه نحن.
 *
 * المصدر: docs.tamara.co/docs/shopify-widgets (Embed Tamara Widget Snippet) و
 * docs.tamara.co/docs/direct-widgets — قائمة إطلاقهم تطلب الويدجت على صفحة الدفع بمفتاح
 * عامّ لكل بيئة. السكربت يُعرّف العنصر `<tamara-widget>` فيرقّي ما وُضع قبل تحميله.
 *
 * لا مفتاح ⇒ لا شيء يُعرض: ويدجتٌ فارغ أسوأ من غيابه.
 */
declare global {
  interface Window {
    tamaraWidgetConfig?: Record<string, unknown>;
  }
}

export function TamaraWidget({ amount, publicKey, cdnUrl }: { amount: number; publicKey: string; cdnUrl: string }) {
  useEffect(() => {
    if (!publicKey) return;
    window.tamaraWidgetConfig = {
      lang: "ar",
      country: "SA",
      publicKey,
      css: ":host { --font-primary: inherit !important; --font-secondary: inherit !important; }",
    };
    if (document.querySelector(`script[src="${cdnUrl}"]`)) return;
    const s = document.createElement("script");
    s.src = cdnUrl;
    s.defer = true;
    document.body.appendChild(s);
  }, [publicKey, cdnUrl]);

  if (!publicKey) return null;

  return (
    <div className="min-h-[56px]" dir="rtl">
      {createElement("tamara-widget", {
        type: "tamara-summary",
        amount: String(amount),
        "inline-type": "2",
        config: JSON.stringify({ badgePosition: "left", showExtraContent: "" }),
      })}
    </div>
  );
}
