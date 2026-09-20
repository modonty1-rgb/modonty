import "server-only";

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

function getClient(): Pusher | null {
  if (client) return client;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) return null;

  client = new Pusher({ appId, key, secret, cluster, useTLS: true });
  return client;
}

/** هل البثُّ مُهيّأ؟ يقرؤه مسارُ التصديق ليردَّ بوضوحٍ بدل أن يصمت. */
export function isRealtimeConfigured(): boolean {
  return getClient() !== null;
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
 * ── ولا يُنتظَر ──
 * الحمولةُ إشارةٌ فقيرة (انظر [channels.ts])، وانتظارُ ردِّ طرفٍ ثالثٍ يؤخّر ردَّ الخادم
 * على المستخدم. فنُطلقه ونلتقط سقوطَه.
 */
export function publish(
  channel: string,
  event: RealtimeEventName,
  payload: Record<string, unknown> = {}
): void {
  const c = getClient();
  if (!c) return;

  c.trigger(channel, event, payload).catch((error) => {
    console.error("[realtime] publish failed", { channel, event, error });
  });
}
