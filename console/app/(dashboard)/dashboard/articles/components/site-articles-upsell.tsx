import Link from "next/link";
import { Globe, Check, ArrowLeft } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  "المقال ينشر على دومينك أنت — الزيارة والثقة تروح لموقعك.",
  "نفس فريق الكتابة ونفس معايير السيو اللي تشوفها في مقالات مودونتي.",
  "موقعك يسحب المحتوى منّا تلقائياً، وأي تعديل نسوّيه يوصلك خلال ساعة.",
] as const;

/**
 * The tab stays visible for a client who does not have the feature (Khalid 2026-08-11):
 * a hidden tab sells nothing, while an empty screen that explains what they are missing
 * is the one moment they are already thinking about their articles.
 */
export function SiteArticlesUpsell() {
  return (
    <Card className="border-violet-200 bg-violet-50/50 p-8 text-center dark:border-violet-900 dark:bg-violet-950/20">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200">
          <Globe className="h-7 w-7" aria-hidden="true" />
        </span>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-foreground">
            خلّ مقالاتك تنشر على موقعك أنت
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            هذي ميزة إضافية مو مفعّلة في اشتراكك الحالي. نكتب لك مقالات تطلع على موقعك
            مباشرة، مو على مودونتي.
          </p>
        </div>

        <ul className="space-y-2 text-start">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-foreground">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300"
                aria-hidden="true"
              />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Support, not a checkout: the feature is switched on by the team after a talk
            about the client's site, so a «buy» button would promise a flow we do not have. */}
        <Link href="/dashboard/support">
          <Button size="lg">
            كلّمنا نفعّلها لك
            <ArrowLeft className="ms-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
