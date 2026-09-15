import { getPublicTeam } from "@/app/data/get-account-manager";
import { getCachedPaySectionContent } from "@/app/data/get-cached-catalog";

/**
 * «من سيتابع معك» — وجوهُ الفريق على صفحة التصفّح.
 *
 * ── ليش على الصفحة الأولى، وبلا أرقام ──
 * صفحة الدفع تطلب من غريبٍ أن يسلّم بطاقته أو يحوّل مالاً. وأقوى ما يسبق ذلك ليس
 * وعداً مكتوباً بل **وجوهٌ وأسماء**: شركةٌ تضع موظّفيها باسمهم لا تختفي غداً. وهذا
 * يثقل في السوق المصريّ خاصّةً، حيث التحويل بنكيّ بلا بوّابةٍ تحمي المشتري.
 *
 * ولا أرقام هنا: رقمٌ على صفحةٍ عامّة يُجمَع في قوائم الإزعاج ولا يُسحَب، والزائر لم
 * يقرّر شيئاً بعد. الرقم يظهر في صفحة التحويل — بعد أن دفع، وهي لحظة الشكّ.
 *
 * ── ولا يُرسم القسم أصلاً بلا أحد ──
 * عنوانٌ «فريقك» فوق فراغٍ أسوأ من غيابه: يقرأ المشتري عطلاً في صفحةٍ يدفع فيها.
 */
/**
 * ── النصّان من الأدمن لا من الكود ──
 * الصياغة الأولى («فريقٌ باسمه ووجهه») وصفها خالد بأنها **تقلّل الثقة**، وهو محقّ:
 * جملةٌ تعلن أننا نثبت أننا حقيقيّون تزرع الشكّ الذي تنفيه. والبديل يقول ما يفعله
 * الفريق لا أنه موجود — ونصٌّ كهذا يُضبط بالتجربة، فيجب أن يتغيّر بلا نشرة.
 *
 * والافتراضيّ هنا لا في القاعدة: صفٌّ جديد لسوقٍ جديد يُرسم صحيحاً قبل أن يُملأ.
 */
const DEFAULT_HEADLINE = "من يتابع اشتراكك";
const DEFAULT_SUB = "بعد اشتراكك يتواصل معك فريقك ويتابع النشر شهراً بشهر.";

export async function PublicTeam({ market }: { market: "SA" | "EG" }) {
  const [team, content] = await Promise.all([getPublicTeam(), getCachedPaySectionContent(market)]);
  if (team.length === 0) return null;

  const headline = content.teamHeadline?.trim() || DEFAULT_HEADLINE;
  const sub = content.teamSubheadline?.trim() || DEFAULT_SUB;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-14">
      <h2 className="text-center text-[15px] font-black text-foreground">{headline}</h2>
      {sub ? (
        <p className="mx-auto mt-1.5 max-w-lg text-balance text-center text-[12.5px] leading-relaxed text-muted-foreground">
          {sub}
        </p>
      ) : null}

      <ul className="mt-6 flex flex-wrap items-start justify-center gap-x-5 gap-y-6">
        {team.map((m) => (
          <li key={m.name} className="flex w-[124px] flex-col items-center text-center">
            {m.image ? (
              /* `img` عاديّ لا `next/image`: صورٌ من نطاق CDN خارجيّ بأبعادٍ غير معلومة
                 مسبقاً، و`next/image` يطلب تهيئة نطاقٍ لكل مصدرٍ جديد يُضاف من الأدمن. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.image}
                alt=""
                aria-hidden
                loading="lazy"
                className="size-[72px] rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              /* بلا صورة: الحرف الأوّل في دائرة — لا مربّع مكسور ولا صورةٌ افتراضية
                 لشخصٍ لا وجود له. */
              <span
                aria-hidden
                className="grid size-[72px] place-items-center rounded-full bg-muted text-[24px] font-black text-muted-foreground ring-2 ring-border"
              >
                {m.name.charAt(0)}
              </span>
            )}
            <p className="mt-2.5 text-[13px] font-bold leading-tight text-foreground">{m.name}</p>
            {m.title ? (
              <p className="mt-0.5 text-[11.5px] leading-tight text-muted-foreground">{m.title}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
