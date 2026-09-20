"use client";

import { useEffect, useRef } from "react";
import PusherClient from "pusher-js";

import type { RealtimeEventName } from "./channels";

/**
 * **الاستماعُ اللحظيّ — هوكٌ واحدٌ لكلّ الميزات.**
 *
 * ── اتّصالٌ واحدٌ للصفحة كلِّها ──
 * حصّةُ Pusher تُحسب بالاتّصالات المتزامنة (١٠٠ في الخطّة المجّانيّة)، ولو فتح كلُّ مكوّنٍ
 * اتّصالَه لاستهلك الموظّفُ الواحدُ خمسةً. فالعميلُ وحدةٌ مشتركة تُنشأ مرّةً عند أوّل
 * مستمعٍ، والاشتراكاتُ تتشاركها.
 */
let shared: PusherClient | null = null;

function getClient(): PusherClient | null {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) return null;

  if (!shared) {
    shared = new PusherClient(key, {
      cluster,
      // المسارُ الذي يقرّر مَن يسمع ماذا — انظر `app/api/pusher/auth/route.ts`.
      channelAuthorization: { endpoint: "/api/pusher/auth", transport: "ajax" },
    });
  }
  return shared;
}

/**
 * اسمعْ حدثاً على قناة، ونفِّذ `handler` كلّما وصل.
 *
 * `channel` تقبل `null` كي يستطيع المكوّنُ النداءَ قبل أن يعرف هوية المستخدم —
 * الهوكُ لا يُنادى شرطيّاً، فالشرطُ يكون في قيمته لا في استدعائه.
 *
 * ── ولماذا `handler` في مرجع ──
 * لو دخل في مصفوفة الاعتماد لأُعيد الاشتراكُ مع كلّ رسمٍ للمكوّن (الدالّةُ جديدةٌ في كلّ
 * مرّة)، وكلُّ اشتراكٍ يمرُّ بمسار التصديق. فالمرجعُ يُحدَّث والاشتراكُ يبقى.
 */
export function useRealtime(
  channel: string | null,
  event: RealtimeEventName,
  handler: () => void
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!channel) return;
    const client = getClient();
    if (!client) return;

    const sub = client.subscribe(channel);
    const fire = () => handlerRef.current();
    sub.bind(event, fire);

    return () => {
      sub.unbind(event, fire);
      // لا `unsubscribe` هنا: قد يسمع مكوّنٌ آخرُ نفسَ القناة بحدثٍ مختلف، وإلغاءُ
      // الاشتراك يقطعه معه. والقناةُ تُترك لعميلٍ مشتركٍ يموت بإغلاق الصفحة.
    };
  }, [channel, event]);
}
