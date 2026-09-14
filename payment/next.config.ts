import { config as loadDotenv } from "dotenv";
import path from "node:path";
import type { NextConfig } from "next";

// نفس متغيّرات المونوريبو المشتركة التي تقرأها مدونتي محليّاً (على Vercel تُقرأ من تبويب
// Shared Env Vars). و`override:false` هو السلوك الافتراضي، فـ`payment/.env.local` يتقدّم.
loadDotenv({ path: path.resolve(process.cwd(), "../.env.shared") });

// أي نشرٍ غير الإنتاج (النطاق الاختباري · معاينات الفروع) يبقى خارج قوقل. ومنطق الاحتياط
// منقول كما هو من مدونتي لسببه المكتوب هناك: بلا `VERCEL_ENV` نحن لسنا على Vercel، و`NODE_ENV`
// هو الإشارة الصادقة — وإلّا شحن إنتاجٌ مستضاف بغير Vercel ترويسة `noindex` على كل صفحة.
const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  /**
   * لا `basePath` ولا `assetPrefix`: الحزمة على نطاقها الخاصّ (pay.modonty.com)،
   * فلا شيء تصطدم به. وجذر النطاق هو صفحة الباقات نفسها — خالد ١٤ سبتمبر ٢٠٢٦:
   * «الهوم بيج المفروض تكون الصفحة اللي تعرض فيها الباقات… ما أبغى تعقيد».
   *
   * وكانا موجودَين حين كانت الخطة أن تصل مدونتي إليها بـrewrites تحت /pay.
   */

  /**
   * ⚠ مطلوبةٌ لا خياريّة: قارئ الكتالوج يستعمل `'use cache'` مع `cacheTag`
   * (`app/data/get-cached-catalog.ts`)، وصفحة الباقات تصدّر `export const instant = false`.
   * كلاهما لا يعمل بغير هذه الراية — وإطفاؤها يُسقط الصفحة عند البناء لا عند الطلب.
   */
  cacheComponents: true,

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        // ⚠ لا `X-Frame-Options: DENY` هنا كما في مدونتي: صفحة الدفع تركّب إطار
        // المزوّد (3DS) داخلها، والحظر المطلق يمنع التحقّق من البطاقة. الحماية المطلوبة
        // هي ألّا يُؤطَّر موقعنا نحن — وهي `frame-ancestors` في CSP يوم تُكتب (PAY-S3).
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ...(isProduction ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
      ],
    },
  ],

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;
