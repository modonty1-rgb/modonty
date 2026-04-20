import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconBell, IconFeatured, IconZap, IconShield, IconUsers } from "@/lib/icons";

export const metadata: Metadata = {
  title: "جديد مودونتي | قريباً",
  description: "تابع آخر تحديثات وميزات منصة مودونتي — محتوى عربي احترافي يتطور معك.",
  robots: { index: false },
};

const UPCOMING: { icon: typeof IconFeatured; title: string; desc: string }[] = [
  { icon: IconZap,    title: "مقالات صوتية",        desc: "استمع لمقالاتك المفضلة أثناء التنقل" },
  { icon: IconUsers,  title: "متابعة الكتّاب",       desc: "تابع كتّابك المفضلين واحصل على إشعار عند نشر محتوى جديد" },
  { icon: IconBell,   title: "إشعارات ذكية",         desc: "تنبيهات مخصصة بناءً على اهتماماتك" },
  { icon: IconShield, title: "حسابات موثّقة",        desc: "شارة التوثيق للعملاء والكتّاب المتحقق منهم" },
  { icon: IconFeatured,   title: "محتوى مميز",           desc: "وصول حصري لتقارير ودراسات حالة متعمقة" },
];

export default function WhatsNewPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-primary/5 via-background to-background relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-xl mx-auto">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            نعمل على شيء رائع
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground leading-tight mb-4">
            جديد{" "}
            <span className="text-accent">مودونتي</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto">
            نبني الجيل القادم من منصة المحتوى العربي — ميزات جديدة، تجربة أفضل، ومحتوى أعمق. قريباً.
          </p>

          {/* CTA */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <IconArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            العودة للرئيسية
          </Link>
        </div>
      </section>

      {/* Upcoming features */}
      <section className="container mx-auto max-w-[1128px] px-4 py-16">
        <h2 className="text-center text-xl font-bold text-foreground mb-2">ما الذي يأتي قريباً؟</h2>
        <p className="text-center text-sm text-muted-foreground mb-10">لمحة على ما نبنيه لك</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {UPCOMING.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-5 flex gap-4 items-start hover:border-accent/40 hover:bg-accent/5 transition-colors"
            >
              <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}

          {/* Placeholder mystery card */}
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 flex gap-4 items-start">
            <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <span className="text-lg font-black">؟</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">مفاجأة قادمة</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">شيء لم تره بعد على منصة عربية — ترقّب.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
