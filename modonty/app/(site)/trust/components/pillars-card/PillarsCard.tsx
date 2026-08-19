import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { IconShield, IconAnalytics, IconBriefcase } from "@/lib/icons";

const PILLARS: { Icon: typeof IconShield; title: string; desc: string }[] = [
  {
    Icon: IconAnalytics,
    title: "الأرقام = الواقع 100%",
    desc: "لوحة تحليلات حيّة تشوف فيها ظهورك وزياراتك وعملاءك بأرقام حقيقية — لا تقارير مجمّلة.",
  },
  {
    Icon: IconShield,
    title: "حضور لا وعود",
    desc: "ما نقول «مضمون» ولا «تصدّر خلال أيام». نبني لك حضوراً تراكمياً حقيقياً على جوجل بهدوء.",
  },
  {
    Icon: IconBriefcase,
    title: "أسعار شاملة وواضحة",
    desc: "السعر اللي تشوفه شامل كل الرسوم والضرائب — بدون مفاجآت ولا بنود مخفية.",
  },
];

/** «ليش تثق فينا» — the three promises, stated as behaviour rather than adjectives. */
export function PillarsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="ليش تثق فينا" icon={IconShield} />
        <CardDescription>نفس المبدأ اللي نكشف فيه أوراقنا، نطبّقه على شغلنا معك.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {PILLARS.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-border p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
