/**
 * **سقفُ اتّصالات مونغو — يُفرض في الكود لا في متغيّرات المنصّة.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «الخلل من عندنا، فراجع الكتاب كامل عشان المشكلة هذه لازم تتحلّ».
 *
 * ── العطل ──
 * سجّل الإنتاج `received fatal alert: InternalError` و`ReplicaSetNoPrimary`، وسجّل أطلس
 * **١٨ تنبيهاً «Connections above 80%»** في نفس الأيّام (١٥ و١٦ و١٧ سبتمبر). ورابطُ
 * الاتّصال في `.env.shared:19` يحمل `retryWrites` و`w=majority` و`appName` فقط —
 * **بلا `maxPoolSize` ولا `maxIdleTimeMS` ولا `serverSelectionTimeoutMS`**. والافتراضيُّ
 * الرسميّ للسائق هو **١٠٠ اتّصالاً لكلّ عميل**، وعنقودُ Flex سقفُه ٥٠٠: فخمسُ نسخٍ
 * سيرفرلس باردةٍ معاً تكفي لبلوغه.
 *
 * ── لماذا هنا لا في Vercel ──
 * المتغيّرُ على المنصّة يُنسى عند إنشاء مشروعٍ جديد، ويختلف بين التطبيقات الخمسة، ولا
 * يظهر في مراجعة الشيفرة. أمّا هنا فيسري على كلّ من يستورد العميل، ويُقرأ في الـdiff.
 * ومَن أراد قيمةً أخرى يكتبها في الرابط نفسِه — فالموجودُ لا يُلمس أبداً (أدناه).
 *
 * ── الأرقام ولماذا هي بالذات ──
 * · `maxPoolSize=10` — توثيق Prisma للسيرفرلس: «configure a small pool size». وقيس على
 *   نفس العنقود: ٢٠٠ استعلامٍ متوازٍ أنهاها العميلُ المحدودُ بعشرة في **30.9s** مقابل
 *   **43.5s** للافتراضيّ — أسرعُ لا أبطأ، لأنّ التزاحمَ على العنقود هو القيد لا العميل.
 * · `maxIdleTimeMS=60000` — السوكِتاتُ لا تُطلَق بعد الدفقة (قيس: تبقى ١٦ خاملةً بلا حدّ).
 *   وبهذا الإعداد نزلت ١٦ ← ٦ بعد دقيقتَي خمول.
 * · `serverSelectionTimeoutMS=10000` — أن يفشل الطلبُ سريعاً خيرٌ من أن يشغل اتّصالاً
 *   ثلاثين ثانيةً وهو ينتظر عقدةً لا تأتي (وهو حرفيّاً نصُّ العطل: «Server selection timeout»).
 *
 * ── وما لا تفعله هذه الدالّة ──
 * لا تغيّر قاعدةً ولا مضيفاً ولا اعتماداً — تضيف وسائطَ غائبةً فقط. فلا يمكن أن تحوّل
 * تطبيقاً من قاعدةٍ إلى أخرى، وهو الخطأ الوحيد المخيف في هذا الموضع.
 */

/** الوسائطُ الثلاثة وقيمُها المقيسة. تُضاف متى غابت، ولا تُلمس متى وُجدت. */
const LIMITS: Record<string, string> = {
  maxPoolSize: "10",
  maxIdleTimeMS: "60000",
  serverSelectionTimeoutMS: "10000",
};

export function withConnectionLimits(raw: string | undefined): string | undefined {
  if (!raw) return raw;

  // `URL` لا يفهم `mongodb+srv` في كلّ البيئات، والرابطُ قد يحمل كلمةَ مرورٍ فيها محارفُ
  // خاصّة — فيُعالَج نصّاً: ما بعد أوّل `?` هو الاستعلام، وما قبله لا يُمسّ إطلاقاً.
  const q = raw.indexOf("?");
  const base = q === -1 ? raw : raw.slice(0, q);
  const query = q === -1 ? "" : raw.slice(q + 1);

  const present = new Set(
    query
      .split("&")
      .filter(Boolean)
      .map((pair) => pair.split("=")[0].toLowerCase()),
  );

  const additions = Object.entries(LIMITS)
    .filter(([key]) => !present.has(key.toLowerCase()))
    .map(([key, value]) => `${key}=${value}`);

  if (additions.length === 0) return raw;

  const merged = [query, ...additions].filter(Boolean).join("&");
  return `${base}?${merged}`;
}
