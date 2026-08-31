"use client";

import { Phone } from "lucide-react";

import { cn } from "../../../../lib/utils/index";
import { useCurrentNavHref } from "./parts/use-current-nav-href";
import { BrandLogo } from "../../parts/brand-logo";
import { VerifiedBadge } from "../../parts/verified-badge";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { HeaderBar } from "./parts/header-bar";
import { MobileMenu } from "./parts/mobile-menu";
import type { HeaderData } from "./header-data";

/** «الكبسولة» — links inside a bordered pill in the centre; two round actions at the end (phone · WhatsApp). */
export function PillHeader({ data }: { data: HeaderData }) {
  // الصفحة الحالية من المسار لا من الترتيب — كان `links[0]` يُضيء «الرئيسية» دائماً.
  const current = useCurrentNavHref(data.links);
  return (
    <header className="relative bg-background">
      <HeaderBar>
        {/* اسم النشاط لا ينكمش على الديسكتوب: كان الوحيد الذي يحمل `min-w-0` في الشريط،
            فانضغط إلى ١٣٠px وهو يحتاج ١٥٣ فبُتِر (مقيس ١٢٨٠ · ٣١ أغسطس). شريط الروابط
            يملك ٥٧٨px ففيه فائضٌ يكفي، والاسم أهمّ من مسافة بين الروابط. */}
        <a href={data.homeHref} className="min-w-0 xl:shrink-0 max-md:flex max-md:min-h-11 max-md:items-center">
          {/* «الكبسولة» تنفق عرضها على شريط الروابط وزرّي الهاتف والقائمة، فلا يبقى للعلامة
              إلا ١٥٥px — والسطر التعريفي يحتاج ١٩٢ فيُبتَر «السياحة العلاجية · الإسكندري…»
              على ٣٩٠ **وعلى ١٢٨٠ معاً** (مقيس ٣١ أغسطس). سطرٌ نصفه لا يفيد، فيُحذف من هذا
              القالب وحده — وبقيّة القوالب تعرضه لأن عندها متّسعاً. */}
          <BrandLogo name={data.name} logoUrl={data.logoUrl} />
        </a>
        {/* الشارة تختفي تحت `md`: الشريط ينفق عرضه على زرّي الهاتف والقائمة، والمقيس على
            ٣٩٠ أن اسم النشاط لم يبق له إلا ٩٢px من ١٥٣ فبُتِر. الاسم يسبق الشارة —
            والشارة باقية على الديسكتوب وفي بقيّة القوالب. */}
        <VerifiedBadge className="max-md:hidden" />
        {/* شريط الروابط من ١٢٨٠ فقط: بين ٧٦٨ و١٢٧٩ كان يزاحم اسم النشاط فيُبتَر (١٥٣←١١٥
            مقيس على ٩٥٠)، أو يدفع أزرار الطرف خارج الشاشة حين مُنع الاسم من الانكماش.
            دون ذلك يتولّى زرّ القائمة — ونفس الروابط داخله. */}
        <nav className="hidden items-center rounded-full border p-1 xl:flex" aria-label="الصفحات">
          {data.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={l.href === current ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                l.href === current ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {data.phone && (
            <a
              href={`tel:${data.phone}`}
              aria-label="اتصال"
              // ٤٤×٤٤ على الجوّال: المقيس كان ٤٠×٤٠ — دون حدّ Apple HIG، ومخالف لجاره
              // زرّ واتساب المدوّر الذي يكبر بـ`max-md:h-11 max-md:w-11` في نفس الشريط.
              // الحبر لا اللون الخام: أيقونة بلون الشريك على الأرضية الداكنة قِيست ٢٫٧٣:١،
              // وWCAG 1.4.11 يفرض ٣:١ للعناصر غير النصّية. المتغيّر يحمل النسخة المقروءة.
              className="grid h-10 w-10 place-items-center rounded-full border text-[hsl(var(--primary-ink,var(--primary)))] max-md:h-11 max-md:w-11"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
          <WhatsAppButton href={data.whatsappHref} variant="round" className="hidden xl:grid" />
          <MobileMenu data={data} hideAt="xl:hidden" />
        </div>
      </HeaderBar>
    </header>
  );
}
