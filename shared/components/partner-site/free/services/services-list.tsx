import { serviceIcon } from "./parts/service-icon";

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
    <Section id="services" eyebrow="ماذا نقدّم" heading="كل خدماتنا">
      <ul className="divide-y">
        {/* `id` per service: the footer links each one here (4 Oct 2026) — six links to the same
            page with no anchor read as six broken links. Same order and filter as the footer. */}
        {data.services.map((s, i) => (
          <li key={s.title} id={`service-${i}`} className="grid scroll-mt-24 gap-4 py-8 md:grid-cols-[auto_1fr] md:items-start">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-[hsl(var(--primary-ink,var(--primary)))]">
              <ServiceIconMark title={s.title} icon={s.icon} />
            </span>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
              {s.description ? (
                <p className="mt-2 max-w-2xl whitespace-pre-line text-base leading-7 text-muted-foreground">{s.description}</p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">اسألنا عن التفاصيل ونردّ عليك بأقرب وقت.</p>
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

function ServiceIconMark({ title, icon }: { title: string; icon?: string | null }) {
  const Icon = serviceIcon(title, icon);
  return <Icon className="h-6 w-6" aria-hidden />;
}
