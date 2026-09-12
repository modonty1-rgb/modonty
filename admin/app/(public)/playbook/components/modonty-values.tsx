import type { SVGProps } from "react";
import { ModontyCheckMark } from "@modonty/shared/components/icons/modonty-check-mark";
import { ModontyPartnerMark } from "@modonty/shared/components/icons/modonty-partner-mark";
import { ModontyReelsMark } from "@modonty/shared/components/icons/modonty-reels-mark";
import { ModontyTrustMark } from "@modonty/shared/components/icons/modonty-trust-mark";

import { coreValues } from "../what-is-modonty-helpers/identity";

const icons: Record<string, (p: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  Reliable: ModontyTrustMark,
  Partner: ModontyPartnerMark,
  Accurate: ModontyCheckMark,
  Creative: ModontyReelsMark,
};

/**
 * اثنتان في السطر، يفصل بينها خطٌّ قصير لا يبلغ الحافة.
 *
 * التساوي التامّ يصنع جدولًا (خالد، ١٢ سبتمبر ٢٠٢٦: «كل الكروت عبارة عن جدول»)، والخطُّ
 * الممتدّ من حافة إلى حافة هو مسطرة الجدول. فالفاصل هنا خطّان قصيران في الوسط، طول كلٍّ
 * منهما نحو ٧٠٪ فقط: يفصلان بلا أن يُغلقا خانة. الخانة تحتاج أربعة أضلاع، وهذه لا تُغلق شيئًا.
 *
 * وعلى الشاشة الضيّقة يسقط العمودان ويصير الفاصل معيَّنًا صغيرًا بلون العلامة — وهو الشكل
 * نفسه الذي تحمله نقاط الأيقونات، فالفاصل من الهوية لا من مكتبة أشكال.
 */
export function ModontyValues() {
  return (
    <div className="relative px-5 py-5">
      <span aria-hidden className="absolute inset-y-[14%] start-1/2 hidden w-px bg-border/70 md:block" />
      <span aria-hidden className="absolute inset-x-[14%] top-1/2 hidden h-px bg-border/70 md:block" />

      <div className="grid gap-x-10 md:grid-cols-2">
        {coreValues.map((value, i) => {
          const Icon = icons[value.titleEn];
          return (
            <div key={value.titleEn} className={i > 1 ? "md:pt-6" : "md:pb-6"}>
              {i > 0 && (
                <div aria-hidden className="flex justify-center py-4 md:hidden">
                  <span className="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-[#00d8d8]/70" />
                </div>
              )}
              <div className="flex gap-3.5">
                <Icon className="mt-0.5 shrink-0 text-[38px]" />
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold leading-6">{value.titleAr}</h3>
                  <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{value.meaning}</p>
                  <p className="mt-1 text-[12.5px] leading-6 text-foreground/65">{value.example}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
