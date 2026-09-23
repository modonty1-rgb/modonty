import { randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { LUCKY_WHEEL_CAMPAIGN, LUCKY_WHEEL_PRIZES, SPINS_PER_PHONE } from "@/app/(site)/lucky-wheel/prizes";
import { isWheelRateLimited } from "./is-wheel-rate-limited";

/**
 * One spin: the visitor sends name + phone, the SERVER picks the slice and stores it, and only
 * then does the browser animate — to the index we return. The browser never names a prize, so
 * posting «TECHNE20» by hand wins nothing. A phone gets up to `SPINS_PER_PHONE` rolls; past
 * that it gets its last stored outcome back instead of a new one.
 */
const spinSchema = z.object({
  name: z.string().trim().min(2, "اكتب الاسم كاملًا.").max(100),
  phone: z.string().trim().min(7, "اكتب رقم جوال صحيحًا.").max(24).regex(/^[+\d\s()-]+$/, "اكتب رقم جوال صحيحًا."),
});

/**
 * One number, one spelling — the phone IS the one-spin limit, so «+966 50…», «00966 50…»,
 * «966 50…», «050…» and «50…» must all land on the same row. Measured: with a `+` kept, the
 * same number spun twice. Saudi numbers fold to the local `05…` form (the event is in Riyadh);
 * anything else keeps its digits with the international `00`/`+` stripped.
 */
function normalizePhone(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("966") && digits.length === 12) digits = `0${digits.slice(3)}`;
  if (digits.startsWith("5") && digits.length === 9) digits = `0${digits}`;
  return digits;
}

function indexOfCode(code: string | null) {
  const index = LUCKY_WHEEL_PRIZES.findIndex((prize) => prize.code === code);
  return index === -1 ? LUCKY_WHEEL_PRIZES.length - 1 : index;
}

export async function POST(request: NextRequest) {
  // Same bucket rule as the newsletter signup: the LAST x-forwarded-for entry is Vercel's.
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",") ?? [];
  const clientIp = forwardedFor[forwardedFor.length - 1]?.trim() || "unknown";
  if (isWheelRateLimited(clientIp, Date.now())) {
    return NextResponse.json({ success: false, error: "محاولات كثيرة. جرّب بعد شوي." }, { status: 429 });
  }

  const parsed = spinSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "تحقق من البيانات." }, { status: 400 });
  }

  const { name } = parsed.data;
  const phone = normalizePhone(parsed.data.phone);
  if (phone.length < 7) {
    return NextResponse.json({ success: false, error: "اكتب رقم جوال صحيحًا." }, { status: 400 });
  }

  try {
    const where = { campaign: LUCKY_WHEEL_CAMPAIGN, phone };
    const used = await db.luckyWheel.count({ where });

    if (used >= SPINS_PER_PHONE) {
      const last = await db.luckyWheel.findFirst({ where, orderBy: { createdAt: "desc" }, select: { prizeCode: true } });
      return NextResponse.json({
        success: true,
        data: { index: indexOfCode(last?.prizeCode ?? null), alreadyPlayed: true, spinsLeft: 0 },
      });
    }

    const index = randomInt(LUCKY_WHEEL_PRIZES.length);
    const prize = LUCKY_WHEEL_PRIZES[index];
    await db.luckyWheel.create({
      data: { campaign: LUCKY_WHEEL_CAMPAIGN, prizeCode: prize.code, prizeLabel: prize.label, name, phone },
    });

    // Two taps racing past `count` could both spin — at worst one roll over the cap, which the
    // rate limit bounds. Not worth a transaction for a promotional wheel.
    return NextResponse.json(
      { success: true, data: { index, alreadyPlayed: false, spinsLeft: Math.max(0, SPINS_PER_PHONE - used - 1) } },
      { status: 201 },
    );
  } catch (error) {
    console.error("[lucky-wheel] Spin failed:", error);
    return NextResponse.json({ success: false, error: "تعذر تسجيل اللفّة الآن. جرّب مرة أخرى." }, { status: 500 });
  }
}
