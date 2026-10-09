import "server-only";

import type { SocialChannel, SocialFunnelStage, SocialPostFormat } from "@prisma/client";

import { db } from "@/lib/db";
import { RealtimeEvent, staffChannel } from "@/lib/realtime/channels";
import { publish } from "@/lib/realtime/publish";
import { escapeTgHtml, sendContentTeamTelegram } from "@modonty/shared/lib/telegram/client";

import { MONTH_LABELS } from "./dates";
import { CHANNEL_META, FORMAT_LABEL, FUNNEL_SHORT_LABEL } from "./social-labels";

/**
 * إشعارات تقويم السوشيال — تيليجرام فريق المحتوى + جرس الأدمن (PRD §٥.٣).
 *
 * | الحدث          | تيليجرام                         | الجرس                                   |
 * |----------------|----------------------------------|-----------------------------------------|
 * | created        | اختياري (checkbox) كالقديم       | creativeAssigneeId إن حُدِّد              |
 * | readyForReview | تلقائي                           | كاتب المحتوى (createdById)              |
 * | approved       | تلقائي                           | كل SOCIAL نشط                            |
 * | rejected       | تلقائي — جديد، القديم لا يرسل    | creativeAssigneeId أو كل CREATIVE نشط    |
 * | published      | تلقائي                           | كاتب المحتوى (createdById)              |
 *
 * نصوص تيليجرام منقولة من القديم (`EntryPageForm.tsx:436-445` · `ProductionForm.tsx:237-239` ·
 * `CalendarTable.tsx:267-269` · `PublishForm.tsx:121-123`) + سطر رابط يفتح المنشور في الأدمن.
 *
 * ── لا يُسقط الأكشن أبداً ──
 * الكتابة نجحت قبل الوصول هنا؛ فشل الإشعار يُسجَّل في السجلّ ويمضي (قاعدة `log-action.ts`).
 * وتيليجرام معطّل خارج الإنتاج بالتصميم (`sendContentTeamTelegram`) — محلياً يرجع
 * «disabled outside production» ولا شيء يسقط.
 */

export type SocialPostNotifyEvent = "created" | "readyForReview" | "approved" | "rejected" | "published";

export interface SocialPostNotifyInput {
  event: SocialPostNotifyEvent;
  post: {
    id: string;
    clientId: string;
    idea: string;
    scheduledFor: Date;
    format: SocialPostFormat | null;
    funnelStages: SocialFunnelStage[];
    channels: SocialChannel[];
    createdById: string | null;
    creativeAssigneeId: string | null;
  };
  clientName: string;
  actorId: string;
  /** created فقط: قيمة checkbox «إرسال إشعار على Telegram». بقية الأحداث تلقائية. */
  telegram?: boolean;
  assetCount?: number;
  note?: string | null;
}

/** ثابت، لا من `host`: رابط من localhost وصل فريقاً حقيقياً مرّة (`briefs/actions/notify-content-team.ts:27-33`). */
const ADMIN_ORIGIN = "https://admin.modonty.com";

function dayLine(d: Date): string {
  return `يوم ${d.getUTCDate()} — ${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function buildTelegram(input: SocialPostNotifyInput): string {
  const { post, clientName, event } = input;
  const idea = escapeTgHtml(post.idea);
  const client = escapeTgHtml(clientName);
  const link = `${ADMIN_ORIGIN}/social-calendar/${post.clientId}/posts/${post.id}`;
  const footer = `\n\n<a href="${escapeTgHtml(link)}">افتح المنشور</a>`;

  if (event === "created") {
    const stages = post.funnelStages.map((s) => FUNNEL_SHORT_LABEL[s]).join("، ");
    const channels = post.channels.map((c) => CHANNEL_META[c].label).join("، ");
    return (
      [
        "📋 منشور جديد",
        "",
        `📅 <b>التاريخ:</b> ${dayLine(post.scheduledFor)}`,
        `💡 <b>الفكرة:</b> ${idea}`,
        post.format ? `🎬 <b>نوع المحتوى:</b> ${FORMAT_LABEL[post.format]}` : null,
        stages ? `🎯 <b>هدف الحملة:</b> ${stages}` : null,
        channels ? `📢 <b>القنوات:</b> ${channels}` : null,
        `\n👤 <b>العميل:</b> ${client}`,
      ]
        .filter((l) => l !== null)
        .join("\n") + footer
    );
  }

  const head = `💡 <b>الفكرة:</b> ${idea}\n📅 ${dayLine(post.scheduledFor)}\n👤 العميل: ${client}`;
  switch (event) {
    case "readyForReview":
      return `🎨 <b>جاهز للمراجعة</b>\n\n${head}\n\nالإبداع جاهز (${input.assetCount ?? 0} ملف) — يرجى المراجعة والموافقة.${footer}`;
    case "approved":
      return `✅ <b>جاهز للنشر</b>\n\n${head}\n\nتمت الموافقة على الإبداع — جاهز للميديا باير.${footer}`;
    case "rejected": {
      const note = input.note?.trim();
      return (
        `↩️ <b>رُفض الإبداع — رجع لقيد الإنتاج</b>\n\n${head}` +
        (note ? `\n\n<b>سبب الرفض:</b>\n<blockquote>${escapeTgHtml(note)}</blockquote>` : "") +
        footer
      );
    }
    case "published":
      return `🚀 <b>تم النشر</b>\n\n${head}\n\nتم نشر المحتوى بنجاح.${footer}`;
  }
}

const BELL_TITLE: Record<SocialPostNotifyEvent, string> = {
  created: "منشور جديد بانتظار الإنتاج",
  readyForReview: "إبداع جاهز لمراجعتك",
  approved: "منشور جاهز للنشر",
  rejected: "رُفض الإبداع — رجع للإنتاج",
  published: "تم نشر منشورك",
};

async function bellRecipients(input: SocialPostNotifyInput): Promise<string[]> {
  const { event, post } = input;
  let ids: string[] = [];
  if (event === "created") {
    ids = post.creativeAssigneeId ? [post.creativeAssigneeId] : [];
  } else if (event === "readyForReview" || event === "published") {
    ids = post.createdById ? [post.createdById] : [];
  } else if (event === "approved") {
    const rows = await db.staff.findMany({ where: { role: "SOCIAL", NOT: { isActive: false } }, select: { id: true } });
    ids = rows.map((r) => r.id);
  } else if (event === "rejected") {
    if (post.creativeAssigneeId) {
      ids = [post.creativeAssigneeId];
    } else {
      const rows = await db.staff.findMany({ where: { role: "CREATIVE", NOT: { isActive: false } }, select: { id: true } });
      ids = rows.map((r) => r.id);
    }
  }
  // لا يُشعَر مَن فعل الفعل بفعله — ضجيجٌ يعلّمه تجاهل الجرس كلّه (نفس قاعدة `notifyAssignee`).
  return [...new Set(ids)].filter((id) => id !== input.actorId);
}

export async function notifySocialPostEvent(input: SocialPostNotifyInput): Promise<void> {
  const sendTelegram = input.event === "created" ? input.telegram === true : true;
  if (sendTelegram) {
    try {
      const res = await sendContentTeamTelegram(buildTelegram(input));
      if (!res.success) console.warn(`[social-calendar] telegram not sent (${input.event}):`, res.error);
    } catch (error) {
      console.error("[social-calendar] telegram failed", error);
    }
  }

  try {
    const recipients = await bellRecipients(input);
    if (recipients.length === 0) return;
    const body = input.event === "rejected" && input.note?.trim() ? `${input.post.idea} — ${input.note.trim()}` : input.post.idea;
    await db.notification.createMany({
      data: recipients.map((staffId) => ({
        staffId,
        clientId: input.post.clientId,
        type: "social_post",
        title: `${BELL_TITLE[input.event]} — ${input.clientName}`,
        body: body.slice(0, 500),
        relatedId: input.post.id,
      })),
    });
    for (const staffId of recipients) publish(staffChannel(staffId), RealtimeEvent.NOTIFICATION_NEW);
  } catch (error) {
    console.error("[social-calendar] bell notification failed", error);
  }
}
