import { config as loadDotenv } from "dotenv";
import path from "node:path";
import type { NextConfig } from "next";

// Load monorepo-level shared env vars (local dev only — Vercel uses Shared Env Vars tab).
// override:false (default) → admin/.env.local takes precedence.
loadDotenv({ path: path.resolve(process.cwd(), "../.env.shared") });

const nextConfig: NextConfig = {
  // التطوير وحده: Next 16 يحجب طلبات التطوير القادمة من أصلٍ غير الذي بدأ منه،
  // فتفشل الترطيب (hydration) والخطوط بـ403 عند فتح الصفحة على 127.0.0.1 بدل localhost.
  // يخصّ خادم التطوير فقط ولا أثر له في الإنتاج.
  // `192.168.1.12` مضاف لأنّ متصفّح الفحص الآليّ لا يصل إلى loopback هذا الجهاز — يرفض
  // الاتّصال على 127.0.0.1 و localhost معاً، ويمرّ عبر عنوان الشبكة وحده. وبلا إدراجه هنا
  // يحجب نكست أصولَ التطوير، فلا تحصل hydration، فيُرسَل نموذجُ الدخول إرسالاً أصليّاً
  // (GET بكلمة المرور في الرابط) بدل ما يناديَ الفعل. تطويرٌ فقط — لا أثر على البناء.
  // عناوينُ الشبكة تتغيّر بتغيّر المكان (بيت ← مكتب)، ومتصفّحُ الفحص لا يصل
  // loopback هذا الجهاز — فيمرّ عبر عنوان الشبكة وحده. تُضاف هنا كي لا يحجب
  // نكست أصولَ التطوير فتموت الـhydration بلا رسالة خطأ واحدة.
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.12", "10.29.20.68"],
  // sharp is a native module (aspect-crop generation) — must be required at runtime,
  // not bundled, or its win32/native binding fails to load in the server runtime.
  serverExternalPackages: ["sharp"],
  redirects: async () => [
    { source: "/seo-overview", destination: "/seo", permanent: true },
    { source: "/seo-overview/:path*", destination: "/seo", permanent: true },
    // صفحة التأهيل حُذفت (١٢ سبتمبر ٢٠٢٦) ونزل محتواها إلى صفحة كل قسم. واللوحة أقرب
    // ما يجيب سؤال من يفتح الرابط القديم: ماذا يُنتظر منّي ومن أي قسم.
    { source: "/playbook/onboarding", destination: "/playbook/roles", permanent: true },
    { source: "/playbook/job-descriptions", destination: "/playbook/roles", permanent: true },
    { source: "/playbook/job-descriptions/:slug", destination: "/playbook/roles", permanent: true },
    // «كيف نتكلّم» وُزّعت: القواعد والكلمات في الهويّة، والمواقف في أقسامها.
    { source: "/playbook/persona", destination: "/playbook#voice", permanent: true },
    // صفحات المبيعات السبع طُويت داخل صفحة القسم، وصار لكلٍّ منها مرساة فيها.
    { source: "/playbook/sales/:slug", destination: "/playbook/sales", permanent: true },
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Next 16 default is [75] only; any other value is silently coerced to the nearest
    // allowed one. Must mirror QUALITIES in shared/components/optimized-image.tsx,
    // or a quality set in code never reaches the browser (bug QUALCFG, 8 Aug 2026).
    qualities: [25, 50, 75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
