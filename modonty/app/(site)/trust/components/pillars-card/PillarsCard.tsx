import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { messages } from "@/lib/i18n/messages";
import { IconShield, IconAnalytics, IconBriefcase } from "@/lib/icons";

const text = messages.trust.pillars;

const PILLARS: { Icon: typeof IconShield; title: string; desc: string }[] = [
  { Icon: IconAnalytics, title: text.numbers.title, desc: text.numbers.desc },
  { Icon: IconShield, title: text.presence.title, desc: text.presence.desc },
  { Icon: IconBriefcase, title: text.pricing.title, desc: text.pricing.desc },
];

/** «ليش تثق فينا» — the three promises, stated as behaviour rather than adjectives. */
export function PillarsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title={text.title} icon={IconShield} />
        <CardDescription>{text.description}</CardDescription>
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
