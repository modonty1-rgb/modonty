import { NextResponse } from "next/server";

import { submitBookingRequest } from "@/components/shared/booking-form/booking-actions";

/**
 * وجهة نموذج «اترك رقمك» في صفحة تواصل معنا على موقع الشريك.
 *
 * كان النموذج يرسل إلى هذا المسار وهو **غير موجود** — `POST /api/booking → 404`، فرقم
 * الزائر يضيع بلا صفٍّ ولا تنبيه. النموذج يعيش في `shared/`، ولا يجوز لـ`shared` أن
 * تستورد من تطبيق، فالمسار هنا هو نقطة الوصل: يستقبل الطلب ويمرّره إلى **نفس** الأكشن
 * الذي تستعمله استمارة المقالات — تحقّق واحد، وكتابة واحدة، وتنبيهات واحدة، فلا تنحرف
 * نسختان بعد أوّل تعديل.
 */

/** محلّي (05…/01…) → E.164، لأن السكيما تقبل `+` وحدها والزائر يكتب رقمه كما اعتاد. */
function toE164(raw: string): string {
  const v = (raw ?? "").replace(/[\s-]/g, "");
  if (/^05\d{8}$/.test(v)) return "+966" + v.slice(1);
  if (/^01\d{9}$/.test(v)) return "+20" + v.slice(1);
  if (/^9665\d{8}$/.test(v) || /^201\d{9}$/.test(v)) return "+" + v;
  return v.startsWith("+") ? v : "+" + v;
}

export async function POST(request: Request) {
  let body: {
    clientId?: string;
    name?: string;
    phone?: string;
    message?: string;
    disclaimerAccepted?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "طلب غير صالح" }, { status: 400 });
  }

  if (!body.clientId) {
    return NextResponse.json({ success: false, error: "طلب غير صالح" }, { status: 400 });
  }

  // مُعرِّفٌ غير صالح كان يرمي داخل الأكشن (كاست ObjectId) فيخرج ٥٠٠ بلا جسم، والزائر
  // يشوف عطلاً بلا كلمة. أي انفجار هنا يرجع رسالة تُقرأ.
  let res: { success: boolean; error?: string };
  try {
    res = await submitBookingRequest(
      {
        name: body.name ?? "",
        phone: toE164(body.phone ?? ""),
        message: body.message ?? "",
      },
      {
        clientId: body.clientId,
        source: "client_page",
        disclaimerAccepted: body.disclaimerAccepted ?? false,
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "تعذّر إرسال طلبك، حاول مرة ثانية." },
      { status: 500 }
    );
  }

  // الرفض المتوقَّع (رقم غلط · طلب مكرّر · إقرار ناقص) ليس خطأ خادم: ٤٠٠ ومعه نصّه
  // كما هو، ليقرأه الزائر في مكانه بدل صفحة خطأ.
  return NextResponse.json(res, { status: res.success ? 200 : 400 });
}
