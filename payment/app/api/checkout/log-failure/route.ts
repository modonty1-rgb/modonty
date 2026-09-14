import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";

/**
 * يستقبل إخفاق الدفع الذي يحدث في المتصفّح **قبل** أن يوجد أي طلب (PAY-G15).
 *
 * لماذا هذا المسار موجود أصلاً: بطاقة أجنبية أو مصرية تُرفض عند التوكنة داخل SDK المزوّد،
 * فلا يصل السيرفر شيءٌ ولا يُنشأ طلب — وسجلّنا يبدأ من الطلب. فأكثر إخفاق متوقَّع في سوقنا
 * هو بالضبط الذي لم نكن نراه. جبر سيو دفع ثمن هذا الدرس وبنى `/api/checkout/log-failure`؛
 * هذا نظيره عندنا، ويكتب في `PaymentAttempt` بلا `orderId` (PAY-G14).
 *
 * أين يسكن: تحت مجموعة `(pay)` لا في كومة `app/api` — فهو يخصّ مسار الدفع وحده. والمجموعة
 * لا تظهر في العنوان، فالعنوان النهائي `/api/checkout/log-failure`. ولم يوضع تحت
 * `pay/[market]/` لأن `/log-failure` كان سيُقرأ كاسم سوق.
 *
 * مفتوح للعامّة بحكم طبيعته — المتصفّح هو من يناديه ولا سرّ يحمله. فكل ما يدخل منه عدوّ
 * حتى يُثبت العكس: مخطّط صارم · أطوال مقصوصة · حدّ معدّل · وردٌّ واحد لا يفرّق بين نجاح
 * وفشل كي لا يصير أداة استكشاف.
 */

// لا `export const dynamic` ولا `runtime` هنا: مدونتي تعمل بـ`cacheComponents` في
// Next 16، وهي ترفض الاثنين عند البناء («Route segment config … is not compatible»).
// وهما بلا معنى أصلاً لمعالج POST — لا يُكاش، ويعمل على Node افتراضياً.

/** القائمة المغلقة نفسها التي في السكيما — قيمة خارجها تُرفض ولا تُخزَّن كنصّ حرّ. */
const STAGES = ["validate", "session", "create_order", "auth", "three_ds", "poll", "webhook"] as const;
const OUTCOMES = ["failed", "declined", "timeout", "error"] as const;
const PROVIDERS = ["NGENIUS", "TAMARA", "BANK_TRANSFER"] as const;

const trimmed = (max: number) => z.string().trim().max(max).optional();

const Payload = z.object({
  provider: z.enum(PROVIDERS),
  stage: z.enum(STAGES),
  outcome: z.enum(OUTCOMES),
  reasonCode: trimmed(80),
  message: trimmed(500),
  state: trimmed(60),
  planSlug: trimmed(80),
  paidMonths: z.number().int().min(1).max(60).optional(),
  market: z.enum(["SA", "EG"]).optional(),
  cardScheme: trimmed(30),
  /**
   * ستّة أرقام بالضبط. الطول مفروض لا مقصوص: لو أرسل العميل رقم البطاقة كاملاً فالقصّ
   * يجعلنا نخزّنه صامتين ونحسب أننا التزمنا — الرفض يجعل الخطأ مرئياً عند من أرسله.
   */
  cardBin: z.string().regex(/^\d{6}$/).optional(),
  email: z.string().trim().email().max(160).optional(),
  providerRef: trimmed(120),
});

// حدّ معدّل في الذاكرة: يكفي لمسار يُنادى مرّة عند إخفاق حقيقي، ويوقف حلقةً مجنونة في
// المتصفّح أو عابثاً بسيطاً. ليس حارساً موزَّعاً — نسخ السيرفر لا تتشارك العدّاد، ويُرقّى
// إلى حارس حقيقي يوم يصير المسار هدفاً (مكتوب هنا كي لا يُظنّ أكثر مما هو).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5_000) for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip"))?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) return new NextResponse(null, { status: 429 });

  const parsed = Payload.safeParse(await req.json().catch(() => null));
  // ردٌّ واحد مهما كان السبب: المسار سجلٌّ لا واجهة، والمتصفّح لا يتصرّف بناءً على جوابه.
  // وتفصيل سبب الرفض هنا يعلّم العابث شكل المخطّط بلا مقابل.
  if (!parsed.success) return new NextResponse(null, { status: 204 });

  const p = parsed.data;

  try {
    await db.paymentAttempt.create({
      data: {
        // بلا orderId عمداً — هذا هو الإخفاق الذي لا طلب له (PAY-G14).
        provider: p.provider,
        stage: p.stage,
        outcome: p.outcome,
        reasonCode: p.reasonCode,
        message: p.message,
        state: p.state,
        planSlug: p.planSlug,
        paidMonths: p.paidMonths,
        market: p.market,
        cardScheme: p.cardScheme,
        cardBin: p.cardBin,
        email: p.email,
        ip,
        userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? undefined,
        providerRef: p.providerRef,
      },
    });
  } catch {
    // سجلٌّ لا يُفشل شيئاً: المشتري يرى خطأ الدفع من المزوّد، وعجزُنا عن تسجيله شأننا وحدنا.
    // ولا يُطبع الجسم في السجلّ — فيه بريد ومعرّفات.
    console.error("[log-failure] تعذّر تسجيل محاولة الدفع");
  }

  return new NextResponse(null, { status: 204 });
}
