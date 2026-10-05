import { db } from "@/lib/db";

/*
 * مصدر واحد لـ«مين صاحب هذا الدخول؟» — دخول الويب (`auth.config.ts`) ودخول الجوّال
 * (`app/api/mobile/v1/auth/login`) يناديانه معاً، فلا يقبل أحدهما ما يرفضه الآخر.
 */

/**
 * محارف التعبير النمطي تُهرَّب قبل أي بحثٍ غير حسّاس لحالة الأحرف.
 *
 * السبب مقيس لا مفترَض (١٦ سبتمبر ٢٠٢٦): موصّل مونجو في بريزما ينفّذ
 * `mode: "insensitive"` بتعبيرٍ نمطيّ **ولا يهرّب مدخل المستخدم**. فالبحث عن
 * `.*@jbrseo.com` رجع بحساب `support@jbrseo.com` — أي أنّ خانة الدخول تقبل نمطاً
 * لا نصّاً. التهريب يقفل ذلك، والتحقّق النصّيّ بعده يقفله مرّةً ثانية.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * يجد العميل ببريده أو بمعرّفه، بلا حساسيّةٍ لحالة الأحرف.
 *
 * ولماذا لا نُنزّل المدخل إلى حروفٍ صغيرة ونقارن: خمسة عملاء في القاعدة بريدهم
 * مخزَّنٌ بحرفٍ كبير (`Dr.ahmedsheikhelarabeye@gmail.com` وغيره)، فالتنزيل يكسر
 * دخولهم. والمطابقة غير الحسّاسة آمنة هنا: قِيس أنّه لا يوجد بريدان يختلفان
 * بحالة الأحرف وحدها (٤٠ عميلاً، صفر تصادم).
 *
 * والمقارنة النصّيّة الأخيرة ليست زيادةً: هي الّتي تضمن أنّ ما رجع يساوي المدخل
 * فعلاً مهما فعل التعبير النمطيّ تحتنا.
 */
export async function findClientByIdentifier(id: string) {
  const exact = id.includes("@")
    ? await db.client.findFirst({ where: { email: id } })
    : await db.client.findUnique({ where: { slug: id } });
  if (exact) return exact;

  const pattern = escapeRegex(id);
  const loose = id.includes("@")
    ? await db.client.findMany({ where: { email: { equals: pattern, mode: "insensitive" } }, take: 2 })
    : await db.client.findMany({ where: { slug: { equals: pattern, mode: "insensitive" } }, take: 2 });

  const wanted = id.toLowerCase();
  const matches = loose.filter((c) =>
    id.includes("@") ? c.email?.toLowerCase() === wanted : c.slug?.toLowerCase() === wanted,
  );

  /** أكثر من واحد = غموضٌ لا يُحسم، فلا يُفتح أيّ حساب. */
  return matches.length === 1 ? matches[0] : null;
}
