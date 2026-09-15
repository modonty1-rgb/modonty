import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * حدود المعدّل — Upstash Redis، عميلٌ واحد وثلاث سياسات بأسماء مختلفة
 * (`rl:checkout:<ip>` · `rl:order:<ip>` · `rl:status:<ip>`).
 *
 * منقولة من جبر سيو. لماذا Redis لا ذاكرة العملية: مدونتي تعمل على Vercel، وكل طلبٍ قد
 * يقع على نسخةٍ أخرى — فعدّادٌ في الذاكرة يعني أن مُجرِّب البطاقات يحصل على ثلاث محاولات
 * **لكل نسخة**، أي بلا حدٍّ عملي. (المسار الوحيد الذي يكتفي بالذاكرة هو `log-failure`
 * لأنه لا يلمس مالاً ولا قاعدة.)
 *
 * بلا مفاتيح Upstash: حدٌّ لا يفعل شيئاً — وهذا مقصود للتطوير والساندبوكس. يبقى بندٌ
 * مفتوحاً: قبل أوّل بيع حقيقي يجب أن تُضاف المفاتيح، وإلا فالمسار الذي يُنشئ طلباً
 * ويحاول دفعةً مفتوحٌ بلا سقف.
 */

/**
 * ── اسمان لشيءٍ واحد، و`KV_` أوّلاً (١٥ سبتمبر ٢٠٢٦) ──
 * قاعدة الدفع أُنشئت عبر Vercel Marketplace، وهو يحقن أسماءه هو
 * (`KV_REST_API_URL` · `KV_REST_API_TOKEN`) لا أسماء Upstash المباشرة.
 *
 * والأولوية له لا لنا عمداً: هذه المتغيّرات **يملكها التكامل ويدوّرها**، فلو نسخنا
 * قيمتها إلى `UPSTASH_…` يدوياً لصار عندنا سرٌّ ثانٍ يبيت قديماً عند أوّل تدوير —
 * والعطل حينها صامت: حدُّ معدّلٍ يفشل في الخلفية بينما الصفحة تبدو سليمة.
 *
 * و`UPSTASH_…` يبقى خلفه لا يُحذف: هو ما يستعمله جهاز التطوير المحلّي، وحذفه يقطع
 * الحدّ على اللوكل بلا فائدة.
 */
function makeRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = makeRedis();

export type LimiterResult = { success: boolean; limit: number; remaining: number; reset: number };

const NOOP_LIMIT: LimiterResult = { success: true, limit: Infinity, remaining: Infinity, reset: 0 };

/** True حين تكون الحدود فعّالة حقاً — تُقرأ في فحص الجاهزية قبل الإطلاق. */
export function rateLimitingIsConfigured(): boolean {
  return redis !== null;
}

function build(prefix: string, limit: number, windowSec: number) {
  if (!redis) return { limit: async (): Promise<LimiterResult> => NOOP_LIMIT };
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: true,
    /**
     * `pay:` لا `rl:` — والفرق قيس (١٤ سبتمبر ٢٠٢٦): جبر سيو يستعمل نفس قاعدة
     * Upstash ونفس الأسماء حرفاً بحرف (`lib/rate-limit.ts:66` — `build("order", 3, 60)`).
     * فببادئةٍ واحدة يصير `rl:order:<ip>` عدّاداً مشتركاً: زائر جبر سيو يستهلك
     * سقف مشتري مدونتي من نفس الـIP، فيُردّ مشترٍ صادق بـ٤٢٩ لذنب مشروعٍ آخر.
     */
    prefix: `pay:${prefix}`,
  });
  return {
    limit: async (key: string): Promise<LimiterResult> => {
      try {
        const r = await rl.limit(key);
        return { success: r.success, limit: r.limit, remaining: r.remaining, reset: r.reset };
      } catch (e) {
        /**
         * ── ليش `try` أصلاً، والسقف اليومي هو السبب ──
         * توثيق Upstash الرسميّ نصّاً: «Exceeding the request limit on a Free Database
         * (10,000 requests per day) will cause the exceeding commands to **return an
         * exception**» (`_snippets/faq-snippet.mdx`). فالتجاوز ليس بطئاً ولا `success:
         * false` — بل رميةٌ تخرج من هذا السطر.
         *
         * وكان النداء عارياً في المواضع الأربعة (`bank-transfer` · `create-payment` ·
         * `tamara` · `status`)، فالرمية تصعد إلى المسار فيرجع ٥٠٠. أي أن حارساً
         * وُضع ليصدّ مُجرِّب البطاقات كان — عند أوّل يومٍ مزدحم — **يقفل الشراء على
         * الجميع** بدل أن يصدّه وحده. وحملةٌ إعلانية هي بالضبط اليوم المزدحم.
         *
         * ── ولماذا يُفتح لا يُقفل ──
         * الخياران كلاهما خسارة: الفتح يعني بُرهةً بلا سقفٍ ثانٍ، والإقفال يعني ردّ كل
         * مشترٍ صادق بـ٤٢٩ لعطلٍ عندنا لا عنده. ويُرجّح الفتح لسببين: Turnstile هو
         * الحارس الأوّل ضدّ الآلات وهو قائمٌ مستقلّ عن ريديس، وهذه الوحدة **تفتح أصلاً**
         * حين تغيب المفاتيح (`NOOP_LIMIT` أعلاه) — فالإقفال هنا يناقض عقدها المعلن.
         *
         * والصمت ممنوع: بلا هذا السطر يمرّ فقدان السقف بلا أثرٍ في سجلّ Vercel، فتُقرأ
         * حملةٌ مكشوفة نجاحاً هادئاً.
         */
        console.error(`[rate-limit] pay:${prefix} تعذّر — مرّ الطلب بلا سقف`, e);
        return NOOP_LIMIT;
      }
    },
  };
}

/** صفحة الدفع — هدفٌ عالي القيمة، فالسقف ضيّق. */
export const checkoutLimiter = build("checkout", 5, 600); // ٥ / ١٠ دقائق / IP

/** إنشاء طلبٍ ومحاولة دفعة — الأضيق: هذا بالضبط ما يُستغلّ لتجريب البطاقات بالجملة. */
export const orderLimiter = build("order", 3, 60); // ٣ / دقيقة / IP

/** الاستعلام عن حالة طلب — يُنادى بالتكرار من شاشة الانتظار، فسقفه أوسع. */
export const statusLimiter = build("status", 60, 60); // ٦٠ / دقيقة / IP
