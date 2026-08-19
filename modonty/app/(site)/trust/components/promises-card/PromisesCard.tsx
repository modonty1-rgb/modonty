import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { IconCheckCircle, IconSuccess } from "@/lib/icons";

const CHECKS: { title: string; desc: string }[] = [
  {
    title: "فاتورة وسند رسمي",
    desc: "اشتراكك موثّق بفاتورة وسند رسمي — علاقتنا واضحة من أول لحظة، بدون عقود غامضة.",
  },
  { title: "باقة محدّدة بمميزاتها", desc: "تعرف بالضبط وش تشمل باقتك قبل ما تشترك — بدون مفاجآت." },
  { title: "دفع آمن", desc: "قنوات دفع موثوقة، وبياناتك محميّة." },
  { title: "سياسات معلنة", desc: "الخصوصية والاستخدام والاسترجاع — صفحات منشورة." },
];

/** «شفافيتنا معك» — what the subscription commits us to, in writing. */
export function PromisesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="شفافيتنا معك" icon={IconCheckCircle} />
        <CardDescription>
          وضوح من أول يوم — تعاملنا معك موثّق بالفاتورة والباقة، بلا التزامات غامضة. ونلتزم
          بمتطلبات نظام التجارة الإلكترونية السعودي.
        </CardDescription>
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
