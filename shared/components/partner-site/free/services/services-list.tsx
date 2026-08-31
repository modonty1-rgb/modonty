import { Briefcase } from "lucide-react";

import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «خدماتنا — بالتفصيل» — عمود صفحة الخدمات: عنوان، ثم سطر لكل خدمة (أيقونة · اسم · وصف).
 *
 * العنوان كان يلحق به `hero.slogan`، وهو حقلٌ حرّ يكتب فيه الشريك ما شاء — فخرج عند
 * «د. علاء الدين» عنوانٌ بلا معنى: «خدماتنا — عضو الجمعيه الأمريكيه لجراحه المناظير
 * SAGES». عنوان الصفحة لا يُبنى على حقلٍ لا نضمن شكله.
 */
export function ServicesList({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="services" eyebrow="ماذا نقدّم" heading={`خدمات ${data.name}`}>
      <ul className="divide-y">
        {data.services.map((s) => (
          <li key={s.title} className="grid gap-4 py-8 md:grid-cols-[auto_1fr] md:items-start">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-[hsl(var(--primary-ink,var(--primary)))]">
              <Briefcase className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
              {s.description ? (
                <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">{s.description}</p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">اسألنا عن التفاصيل — نردّ في نفس اليوم.</p>
              )}
            </div>
            {/* لا زرّ واتساب على كل خدمة: قِيست ٩ أزرار واتساب في هذي الصفحة وحدها
                (٣ منها هنا)، والقسم الذي يليها مباشرة هو «احجز الآن» بنموذجه وزرّه.
                الفعل المكرّر في كل بطاقة يفقد وزنه — والقائمة صارت قراءةً، والفعل تحتها. */}
          </li>
        ))}
      </ul>
    </Section>
  );
}
