import { OptimizedImage, asMedia } from "../../../optimized-image";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «الفريق» — صورة دائرية واسم ومسمّى (Tailwind "team grid").
 *
 * كلّهم، لا ثمانية (خالد ٣١ أغسطس): «من نحن» هي بيت الفريق الوحيد، فالتاسع كان يختفي
 * عن الزائر في كل صفحة. الشبكة تنزل صفوفاً من نفسها، فالعدد لا يكسر التخطيط.
 */
export function TeamGrid({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="team" eyebrow="مَن يخدمك" heading="فريقنا">
      <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
        {data.team.map((m) => (
          <li key={m.name} className="text-center">
            <span className="relative mx-auto block h-24 w-24 overflow-hidden rounded-full bg-muted">
              {m.photoUrl && <OptimizedImage media={asMedia(m.photoUrl, m.name)} alt="" fill sizes="avatar" className="object-cover" />}
            </span>
            <p className="mt-3 text-base font-bold text-foreground">{m.name}</p>
            {m.role && <p className="text-sm text-muted-foreground">{m.role}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}
