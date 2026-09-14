import type { Config } from "tailwindcss";
import { modontyTokensPreset } from "../shared/tailwind-preset";

const config: Config = {
  // الخريطة كلّها (الألوان · الخطوط · الاستدارة) من المشترك — فلا تُكتب هنا مرّتين.
  presets: [modontyTokensPreset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    // بطاقة الباقة وقسم البيع يعيشان في `shared`، خارج مجلّد هذا التطبيق. وبغير هذا السطر
    // يُشطب كل صنفٍ لا يستعمله إلا هما — نفس العطل الذي أصاب الأدمن والكونسول قبلاً.
    "../shared/components/**/*.{ts,tsx}",
    // ⚠ و`shared/lib` أيضاً: ثيمات الباقات (`plan-themes.ts`) تحمل أصنافها نصّاً —
    // `bg-chart-4` وأخواتها. وبغياب هذا السطر لا يُولَّد الصنف أصلاً، فيصير زرّ باقة
    // «الريادة» بلا خلفية ونصُّه أبيض على أبيض: زرٌّ غير مرئيّ في مسار الشراء.
    // قيس (١٤ سبتمبر ٢٠٢٦): backgroundColor = rgba(0,0,0,0) · color = rgb(243,243,241).
    "../shared/lib/**/*.{ts,tsx}",
  ],
  plugins: [require("tailwindcss-animate")],
};

export default config;
