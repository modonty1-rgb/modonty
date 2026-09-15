import type { Metadata, Viewport } from "next";

import { Tajawal, Montserrat } from "next/font/google";

import "./globals.css";
import { payPublicUrl } from "@/lib/pay-public-url";
import { ThemeProvider } from "./theme-provider";

/**
 * تخطيط جذر حزمة الدفع.
 *
 * ما ليس فيه هو أهمّ ما فيه: لا ترويسة موقع · لا تذييل · لا قائمة · **ولا مصادقة**.
 * صفحة الدفع يزورها مشترٍ غير مسجَّل (خالد ١٤ سبتمبر ٢٠٢٦: «صفحة الدفع المفروض تكون خارج
 * الأوثنتيكيشن»)، وكان جرس إشعارات مدونتي يُنفَّذ عليها عبر `app/not-found.tsx` فيملأ سجلّ
 * الخادم بأخطاء JWT ويوقف التهيئة بـ`crypto.getRandomValues()`. هنا لا يوجد ما يُنفَّذ أصلاً.
 */

/**
 * الأوزان الخمسة لا ثلاثة (خالد ١٤ سبتمبر ٢٠٢٦: «الثقل اللي فوق… على اللايت مو شغال صح»).
 *
 * القياس على `/sa`: الصفحة تستعمل ٥٠٠ و٦٠٠ و٧٠٠ و٨٠٠، والمحمَّل ٤٠٠ و٥٠٠ و٧٠٠ فقط —
 * فوزن ٨٠٠ بلا ملفّ، والمتصفّح **يزيّفه** بتغليظ حروف الـ٧٠٠ صناعياً. والتزييف يبدو
 * ثقيلاً خشناً على الداكن ويذوب على الفاتح، فالعناوين لا تُقرأ كما صُمِّمت.
 *
 * و٦٠٠ لا وجود له في تايجوال أصلاً (أوزانها ٢٠٠ ٣٠٠ ٤٠٠ ٥٠٠ ٧٠٠ ٨٠٠ ٩٠٠)، فيسقط على
 * أقرب محمَّل. وتحميل ٨٠٠ و٩٠٠ يجعل `font-extrabold` و`font-black` حقيقيَّين.
 */
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
  preload: true,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
});

/**
 * بطاقة المشاركة — ما يراه من يرى رابط الإعلان قبل أن يضغطه.
 *
 * لماذا أُضيفت (خالد ١٥ سبتمبر ٢٠٢٦: «عندي حملة إعلانية فلا تخسرني فلوس»): قيس على
 * السيرفر المحلّي — الصفحة كانت تُرسل **صفر** وسوم `og:` و`twitter:`. فرابطٌ يُلصق في
 * إعلان ميتا أو في واتساب يُرسَم بطاقةً عارية: بلا صورة ولا عنوان ولا وصف، عنوانٌ خامٌ
 * وحده. وبطاقةٌ عارية في إعلانٍ مدفوع تخفض النقر وتُضعف مراجعة الإعلان.
 *
 * و`metadataBase` شرطٌ لا زينة: بدونه تُطبع الصورة بمسارٍ **نسبيّ**، وبوت المعاينة لا
 * يملك أصلاً يحلّه عليه فيسقطها. ويُقرأ من `payPublicUrl()` نفسه الذي تبني به البوّابة
 * روابط العودة — مصدرٌ واحد، فلا ينفرط عنوانٌ عن عنوان.
 *
 * والفهرسة تبقى مغلقة: `robots: index:false` هنا، و`robots.txt` يفتح الزحف لبوتات
 * المعاينة وحدها على صفحتَي التسويق. الزحف والفهرسة قراران منفصلان.
 */
export const metadata: Metadata = {
  metadataBase: new URL(payPublicUrl()),
  title: "الباقات والدفع",
  description:
    "منصّة سعودية ١٠٠٪ لإدارة محتوى مدوّنتك — اختر باقتك وابدأ الانتشار. فاتورة ضريبية معتمدة، ودفع آمن عبر مدى وفيزا وماستركارد وآبل باي وتمارا.",
  // لا فهرسة لمسار الدفع: صفحات النتيجة والطلب لا مكان لها في نتائج البحث.
  // صفحة الباقات وحدها تصرّح بعكس ذلك في `generateMetadata` الخاصّ بها.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "مدونتي",
    url: "/",
    title: "مدونتي — منصّة سعودية ١٠٠٪ لإدارة محتوى مدوّنتك",
    description:
      "اختر باقتك وابدأ الانتشار. فاتورة ضريبية معتمدة، ودفع آمن عبر مدى وفيزا وماستركارد وآبل باي وتمارا.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "مدونتي — باقات إدارة المحتوى" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "مدونتي — منصّة سعودية ١٠٠٪ لإدارة محتوى مدوّنتك",
    description: "اختر باقتك وابدأ الانتشار. فاتورة ضريبية معتمدة ودفع آمن.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E065A",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${tajawal.variable} ${montserrat.variable}`}
    >
      <body className="bg-background font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          {/*
            ⚠ الزرّ العائم **لم يعد هنا** (خالد ١٥ سبتمبر ٢٠٢٦).

            كان في التخطيط ليغطّي المسار كلّه، وهو صحيحٌ لصفحات التصفّح. لكنّ مسار
            الدفع صار له زرّ واتساب خاصٌّ به: صفحة التحويل المصرية تُرسل الإيصال إلى
            رقم المؤسّسة، وصفحتا الفشل والنجاح لهما زرّهما. فبقاؤه هناك يعني زرّين
            أخضرين على شاشةٍ واحدة برقمين مختلفين — والمشتري في اللحظة التي يريد أن
            ينتهي فيها يُسأل «أيّهما؟».

            فصار يُركَّب في صفحات التصفّح وحدها: الأوفرفيو (`page.tsx` و`[market]/page.tsx`)
            وصفحة الباقات. وصفحات مسار الشراء لا تحمله — لأن فيها ما هو أدقّ منه.
          */}
        </ThemeProvider>
      </body>
    </html>
  );
}
