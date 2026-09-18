"use client";

import { useEffect, useRef, useState } from "react";

/**
 * الرسالةُ تُعرض في إطارٍ معزول (`srcDoc`) لا في الصفحة.
 *
 * قالبُ البريد يحمل أنماطه الخاصّة وجداولَ تخطيطٍ قديمة الطراز؛ حقنُه في شجرة الأدمن
 * يخلط أنماطَه بأنماطها فيُرى غيرَ ما يصل العميل — وهذا ينقض الغرضَ من المعاينة نفسِها.
 *
 * `allow-same-origin` بلا `allow-scripts`: لا سكربت يعمل داخله (وهو مستندُ بريدٍ لا
 * صفحةٌ تُشغَّل)، لكنّ الصفحةَ تقرأ ارتفاعَه فتتمدّد به. و`sandbox=""` وحدها تجعله أصلاً
 * غامضاً فلا يُقرأ ارتفاعُه، فيبقى محبوساً في صندوقٍ ثابتٍ بشريط تمريرٍ ثانٍ.
 */
export function EmailPreviewFrame({ html, title }: { html: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(760);

  // يتمدّد الإطارُ بمقدار المستند فلا يُقرأ داخل شريط تمريرٍ ثانٍ.
  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const fit = () => {
      const doc = frame.contentDocument;
      if (doc?.body) setHeight(Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight) + 24);
    };
    frame.addEventListener("load", fit);
    const t = setTimeout(fit, 400);
    return () => {
      frame.removeEventListener("load", fit);
      clearTimeout(t);
    };
  }, [html]);

  return (
    <iframe
      ref={ref}
      title={title}
      srcDoc={html}
      sandbox="allow-same-origin"
      className="w-full rounded-lg border bg-white"
      style={{ height }}
    />
  );
}
