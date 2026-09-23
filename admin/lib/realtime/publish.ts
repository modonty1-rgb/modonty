import "server-only";

import { after } from "next/server";
import Pusher from "pusher";

import type { RealtimeEventName } from "./channels";

/**
 * **الناشرُ — نقطةُ الخروج الوحيدة إلى Pusher.**
 *
 * `server-only` في أوّل السطر حارسٌ لا تعليق: الملفُّ يحمل `PUSHER_SECRET`، واستيرادُه
 * من مكوّنِ عميلٍ بالخطأ يوقف البناءَ بدل أن يسرّب السرَّ إلى الحزمة.
 */

/**
 * عميلٌ واحدٌ يُنشأ عند أوّل نداء.
 *
 * ── ولماذا كسولاً لا في أعلى الملفّ ──
 * `new Pusher({...})` يرمي إن نقص مفتاح. وفي البناء تُستورَد الوحداتُ بلا بيئةٍ كاملة،
 * فإنشاؤه في الأعلى يُسقِط بناءً كاملاً بسبب ميزةٍ ثانويّة. وكسولاً: مَن لا يبثُّ لا يدفع.
 */
let client: Pusher | null = null;

export function getRealtimeServer(): Pusher | null {
  if (client) return client;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) return null;

  client = new Pusher({ appId, key, secret, cluster, useTLS: true });
  return client;
}

/**
 * ابثَّ إشارةً على قناة.
 *
 * ── لا يرمي أبداً ──
 * البثُّ زينةٌ فوق كتابةٍ نجحت: الإشعارُ محفوظٌ في مونغو قبل أن نصل هنا. فسقوطُ Pusher
 * أو نفادُ حصّته يجب ألّا يُفشل الفعلَ الذي بثَّ عنه — يُسجَّل ويمضي، كما يفعل
 * `notifyAssignee` بالضبط وللسبب نفسِه. وأسوأُ ما يحدث حينها: يرى الموظّفُ الإشعارَ
 * عند أوّل تنقّل بدل أن يراه فوراً.
 *
 * ── ولا يُنتظَر، ولا يُترك يتيماً ──
 * انتظارُ ردِّ طرفٍ ثالثٍ يؤخّر ردَّ الخادم على المستخدم. لكنّ وعداً يُطلَق بلا صاحب قد
 * لا يكتمل على Vercel: الدالّةُ تُجمَّد بعد إرسال الردّ. فيُسلَّم لـ`after()` — يعمل بعد
 * الردّ ويُبقي الدالّةَ حيّةً حتى ينتهي (nextjs.org/docs/app/api-reference/functions/after).
 * وخارج طلبٍ (سكربت أو اختبار) `after` يرمي، فيُطلَق مباشرةً.
 */
export function publish(
  channel: string,
  event: RealtimeEventName,
  payload: Record<string, unknown> = {}
): void {
  const c = getRealtimeServer();
  if (!c) return;

  const send = () =>
    c.trigger(channel, event, payload).catch((error) => {
      console.error("[realtime] publish failed", { channel, event, error });
    });

  try {
    after(send);
  } catch {
    void send();
  }
}
