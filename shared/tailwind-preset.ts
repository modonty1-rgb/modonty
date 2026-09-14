import type { Config } from "tailwindcss";

/**
 * خريطة توكنات مدونتي لتايلويند، في مكانٍ واحد يستهلكه أكثر من تطبيق.
 *
 * لماذا وُجد (PAY-S1): حزمة `payment` تحتاج نفس أسماء الألوان كي يعمل المكوّن المشترك
 * `PlanCard` فيها كما يعمل في مدونتي والأدمن. وإعادة كتابة الخريطة في كل تطبيق تعني أن
 * توكناً يُضاف في مدونتي ويسقط في الدفع بلا رسالة خطأ — فالبطاقة تُقَرّ بلونٍ وتُطلق بآخر،
 * وهو بعينه العطل الذي وُلد له مولّد `pay-stage.css`.
 *
 * القيم كلّها `hsl(var(--token))` — أي أن هذا الملفّ لا يحمل لوناً واحداً، بل أسماءً تشير
 * إلى ما يعرّفه `globals.css`. فمصدر اللون الوحيد يبقى `modonty/app/globals.css`.
 *
 * ⚠ مدونتي لا تستهلكه بعد: نسختها داخل `modonty/tailwind.config.ts` كما هي، كي لا يمسّ
 * هذا البند تطبيقاً حيّاً. توحيدهما بندٌ مستقلّ في `PAY-S7` (صفر كود مكرَّر).
 */
export const modontyTokensPreset = {
  darkMode: "class",
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-tajawal)",
          "var(--font-montserrat)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        arabic: ["var(--font-tajawal)", "sans-serif"],
        latin: ["var(--font-montserrat)", "-apple-system", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // الأزرق كنصّ: `text-primary` يرسب في AA على السطوح الداكنة، فللنصّ توكنه.
        link: "hsl(var(--link))",
        "link-accent": "hsl(var(--link-accent))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        brand: {
          navy: "hsl(var(--brand-navy))",
          blue: "hsl(var(--brand-blue))",
          teal: "hsl(var(--brand-teal))",
          "gray-light": "hsl(var(--brand-gray-light))",
          gray: "hsl(var(--brand-gray))",
          "gray-dark": "hsl(var(--brand-gray-dark))",
        },
        star: "hsl(var(--star))",
        // أفعال القارئ الستّة. لا تستعملها مكوّنات البيع اليوم (قياس: صفر)، لكنها تبقى
        // هنا لأن العطل الذي وقع في PAY-S1 كان بالضبط «مفتاحٌ ناقص في الخريطة»: صنفٌ
        // لا يُولَّد، فعنصرٌ بلا خلفية ونصٌّ أبيض على أبيض. والخريطة إعدادٌ لا CSS —
        // تايلويند لا يشحن إلا المستعمَل، فاكتمالها بلا كلفة.
        action: {
          like: "hsl(var(--action-like))",
          "like-foreground": "hsl(var(--action-like-foreground))",
          save: "hsl(var(--action-save))",
          "save-foreground": "hsl(var(--action-save-foreground))",
          comment: "hsl(var(--action-comment))",
          "comment-foreground": "hsl(var(--action-comment-foreground))",
          share: "hsl(var(--action-share))",
          "share-foreground": "hsl(var(--action-share-foreground))",
          listen: "hsl(var(--action-listen))",
          "listen-foreground": "hsl(var(--action-listen-foreground))",
          audio: "hsl(var(--action-audio))",
          "audio-foreground": "hsl(var(--action-audio-foreground))",
          reels: "hsl(var(--tab-reels))",
          "reels-foreground": "hsl(var(--tab-reels-foreground))",
        },
        // ⚠ سقطت في PAY-S1 فصار زرّ باقة «الريادة» (ثيم PREMIUM = bg-chart-4)
        // بلا خلفية أصلاً ونصُّه `text-background` أبيض — زرٌّ غير مرئيّ في مسار الشراء.
        // القياس (١٤ سبتمبر ٢٠٢٦): backgroundColor = rgba(0,0,0,0) · color = rgb(243,243,241).
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
} satisfies Config;

export default modontyTokensPreset;
