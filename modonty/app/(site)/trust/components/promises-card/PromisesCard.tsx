import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { messages } from "@/lib/i18n/messages";
import { IconCheckCircle, IconSuccess } from "@/lib/icons";

const text = messages.trust.promises;

const CHECKS: { title: string; desc: string }[] = [
  { title: text.invoice.title, desc: text.invoice.desc },
  { title: text.plan.title, desc: text.plan.desc },
  { title: text.payment.title, desc: text.payment.desc },
  { title: text.policies.title, desc: text.policies.desc },
];

/** «شفافيتنا معك» — what the subscription commits us to, in writing. */
export function PromisesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title={text.title} icon={IconCheckCircle} />
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-4 sm:grid-cols-2">
          {CHECKS.map((c) => (
            <li key={c.title} className="flex gap-3">
              <IconSuccess className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <span className="block font-semibold">{c.title}</span>
                <span className="text-sm text-muted-foreground">{c.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
