import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { arabicCount, arabicMetaLine, arabicRelativeTime } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

/**
 * طلبات التواصل (S15) — قناتان في جدول واحد، ولا تُخلطان.
 *
 * `channel: "form"` زائرٌ ترك رقمه ورسالته وينتظر ردّاً → **مهمّة** لها حالة تتقدّم.
 * `channel: "whatsapp"` زائرٌ ضغط زرّ واتساب فانتقل الحديث إلى هناك، ولا نحفظ رقمه
 * («ما نحفظ رقمه، بس نثبّت لك إنه تواصل» — `lib/ar.ts:1150`) → **خبرٌ لا مهمّة**.
 *
 * لذلك: عدّاد الرئيسية يحصي طلبات النموذج **المفتوحة** وحدها، وواتساب تُعرض في قسمها بنصّها
 * الذي يشرح لماذا لا يوجد ما يُفعَل بها. والتقسيم مطابق لفلتر القنوات في الكونسول.
 *
 * **الشاشة عرضٌ محض — صفر أفعال** — قرار خالد (٢٩ أغسطس): «هي الصفحة هذه عرض بس مو أكثر».
 * فكنتُ بنيتُ مسار `/status` وزرَّي حالة، ثم زرَّي «اتصل» و«واتساب» — وكلّها أفعال.
 * إدارة الحالة مكانها الكونسول حيث يعمل الفريق (وزرّان لنفس الحالة على سطحين يفتحان باب
 * التعارض)، والاتصال يفعله العميل من دفتر هاتفه. الجوّال يوصّل الخبر: من طلب، ورقمه،
 * وماذا قال، ومن أين جاء، ومتى. لا أكثر.
 */
const statusLabels: Record<string, string> = { new: "جديد", contacted: "تواصلت معه", done: "خلص", archived: "مؤرشف" };
const statusTones: Record<string, "pending" | "done" | "neutral"> = { new: "pending", contacted: "pending", done: "done", archived: "neutral" };

const sourceLabels: Record<string, string> = {
  article_dock: "من داخل مقال",
  article_card: "من بطاقة مقال",
  client_page: "من صفحتك",
  client_list: "من دليل العملاء",
};

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const clientId = session.clientId;

  const [requests, whatsappCount] = await Promise.all([
    db.bookingRequest.findMany({
      where: { clientId, channel: "form" },
      select: { id: true, name: true, phone: true, email: true, message: true, source: true, status: true, createdAt: true, confirmedAt: true, article: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.bookingRequest.count({ where: { clientId, channel: "whatsapp" } }),
  ]);

  /** المفتوح يساوي ما يعدّه العدّاد في الرئيسية حرفياً — رقمٌ واحد لا رقمان. */
  const openStatuses = new Set(["new", "contacted"]);
  const waiting = requests.filter((row) => openStatuses.has(row.status)).length;
  // المفتوح أولاً ثم الأحدث: الشاشة تبدأ بما ينتظر عملاً، والمغلق تاريخٌ يليه.
  const ordered = [...requests].sort((a, b) => {
    const openDelta = Number(openStatuses.has(b.status)) - Number(openStatuses.has(a.status));
    return openDelta !== 0 ? openDelta : b.createdAt.getTime() - a.createdAt.getTime();
  });

  return ok({
    screenTitle: "طلبات التواصل",
    backLabel: "رجوع",
    subtitle: waiting === 0 ? "ما في طلب مفتوح — خلّصت كل طلبات التواصل." : arabicCount(waiting, "طلب مفتوح ينتظرك", "طلبان مفتوحان ينتظرانك", "طلبات مفتوحة تنتظرك"),
    emptyTitle: "ما وصلك طلب تواصل بعد",
    emptyDescription: "لما يترك زائر رقمه من مقالاتك أو صفحتك، بيظهر لك هنا.",
    /** قسم واتساب: خبرٌ يُعرض ولا يُفعَل به شيء — ولهذا لا زرّ فيه. */
    whatsapp: whatsappCount === 0 ? null : {
      title: "تواصل واتساب",
      countLabel: arabicCount(whatsappCount, "زائر", "زائران", "زوّار"),
      description: "ضغطوا زرّ واتساب ووصلتك رسالتهم. الحديث معهم على واتساب مباشرة — ما نحفظ أرقامهم، بس نثبّت لك إنهم تواصلوا.",
    },
    requests: ordered.map((row) => ({
      id: row.id,
      name: row.name?.trim() || "زائر بلا اسم",
      phone: row.phone,
      email: row.email,
      message: row.message?.trim() || null,
      statusLabel: statusLabels[row.status] ?? row.status,
      statusTone: statusTones[row.status] ?? "neutral",
      metaLabel: arabicMetaLine([sourceLabels[row.source] ?? null, row.article?.title ?? null, arabicRelativeTime(row.createdAt)]),
    })),
  });
}
