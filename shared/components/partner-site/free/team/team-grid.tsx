import { OptimizedImage, asMedia } from "../../../optimized-image";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «الفريق» — صورة دائرية واسم ومسمّى (Tailwind "team grid").
 *
 * كلّهم، لا ثمانية (خالد ٣١ أغسطس): «من نحن» هي بيت الفريق الوحيد، فالتاسع كان يختفي
 * عن الزائر في كل صفحة. الشبكة تنزل صفوفاً من نفسها، فالعدد لا يكسر التخطيط.
 */
/**
 * First letter of the name after any title — «د/ سارة» and «دكتور محمد» gave four identical «د»
 * circles on one partner (measured 4 Oct 2026).
 */
function initial(name: string): string {
  const bare = name.trim().replace(/^(?:(?:الدكتورة|الدكتور|دكتورة|دكتور)\s+|(?:د|أ|م)\s*[./]\s*|(?:د|أ|م)\s+)/, "");
  return (bare || name.trim()).charAt(0);
}

export function TeamGrid({ data }: { data: HomeData; preview?: boolean }) {
  // One person under «فريقنا» read as a team of one (4 Oct 2026): the heading follows the count,
  // and a lone card sits centred instead of in the first of four columns.
  const solo = data.team.length === 1;
  return (
    <Section id="team" eyebrow={solo ? undefined : "مَن يخدمك"} heading={solo ? "مَن يخدمك" : "فريقنا"}>
      <ul className={solo ? "flex justify-center" : "grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4"}>
        {data.team.map((m) => (
          <li key={m.name} className="text-center">
            {/* No photo was an empty grey circle; now the first letter on the partner's tint. */}
            <span className="relative mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-primary/10 text-3xl font-bold text-[hsl(var(--primary-ink,var(--primary)))]">
              {m.photoUrl ? (
                <OptimizedImage media={asMedia(m.photoUrl, m.name)} alt="" fill sizes="avatar" className="object-cover" />
              ) : (
                <span aria-hidden>{initial(m.name)}</span>
              )}
            </span>
            <p className="mt-3 text-base font-bold text-foreground">{m.name}</p>
            {m.role && <p className="text-sm text-muted-foreground">{m.role}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}
