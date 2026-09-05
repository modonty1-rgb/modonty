import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STAGE_DOT, STAGE_LABEL, type Stage } from "../helpers/funnel";

/**
 * رأس الصفحة — الهويّة وحدها: مَن هو، وأين وقف الكلام معه.
 *
 * والأزرار ليست هنا. كانت في هذا الرأس، والصفحة تُمرَّر ثلاث شاشات (مقيس: `scroll 1457` مقابل
 * `client 963`)، فمَن أراد أن يحوّله إلى عميل بعد قراءة السجلّ رجع إلى الأعلى أوّلاً. صارت في
 * العمود الثابت يساراً: تُرى دائماً بلا تمرير.
 */
export function LeadHeader({
  name,
  company,
  stage,
}: {
  name: string;
  company: string | null;
  stage: Stage;
}) {
  return (
    <div className="flex items-start gap-2">
      {/* `asChild` لا `<Link><Button>`: الثانية تضع `<button>` داخل `<a>` — تعشيقٌ ممنوع في
          المواصفة، والقارئ الصوتيّ يعلن عنصرين حيث يوجد واحد. */}
      <Button asChild variant="ghost" size="icon" className="size-8 shrink-0">
        <Link href="/sales-leads" aria-label="رجوع لقائمة العملاء المحتملين">
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
        </Link>
      </Button>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-balance text-lg font-semibold leading-tight">{name}</h1>
          <Badge variant="outline" className="gap-1.5 text-[11px]">
            <span className={cn("size-1.5 rounded-full", STAGE_DOT[stage])} aria-hidden />
            {STAGE_LABEL[stage]}
          </Badge>
        </div>
        {company && <p className="mt-0.5 truncate text-xs text-muted-foreground">{company}</p>}
      </div>
    </div>
  );
}
