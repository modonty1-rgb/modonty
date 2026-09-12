"use client";

import { useEffect } from "react";
import { useReactFlow, useStore, type FitViewOptions } from "@xyflow/react";

/**
 * يعيد ملاءمة الرسم كلّما تغيّر عرض الحاوية أو ارتفاعها.
 *
 * `fitView` يُحسب مرّةً واحدة عند التركيب، ولا شيء في React Flow يعيده عند تغيّر المقاس —
 * فالرسم يبقى على تحويلٍ حُسب لعرضٍ آخر، ويخرج عن حاويته فيقصّه `overflow-hidden`.
 *
 * قِيس على `/playbook` في ١٢ سبتمبر ٢٠٢٦ عبر خمسة عروض: عند ١٤٤٠ الرسوم الثلاثة سليمة،
 * وكلّما ضاق العرض زاد القصّ من اليمين — ٢٦ ثم ٦٥ ثم ٣٢١ ثم ٦٦٥ بكسل عند ٤٢٠.
 * ولهذا كان خالد يرى كسراً لا أراه: متصفّحه أضيق من نافذة الفحص.
 *
 * يُركَّب داخل `<ReactFlow>` لا خارجه، فيقرأ أبعاد الحاوية من متجره مباشرةً.
 */
export function FitOnResize({ options }: { options?: FitViewOptions }) {
  const { fitView } = useReactFlow();
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);

  useEffect(() => {
    if (!width || !height) return;
    fitView(options);
    // `options` ثابتٌ في وحدة كل رسم، فلا يعيد التشغيل إلا المقاس.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, fitView]);

  return null;
}
