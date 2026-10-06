import { Building2, CalendarDays } from "lucide-react";

import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «تعرّف علينا» — text first: the story in a comfortable measure, and beside it a quiet
 * facts card (founded · legal name) that gives the eye a second
 * anchor without repeating the logo the hero already showed. Content section pattern.
 */
/** Paragraphs as the partner typed them (blank line = new paragraph). */
function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

/**
 * The story text. Home shows the first two paragraphs and folds the rest under «اقرأ القصّة
 * كاملة» — a native <details>, no JavaScript (4 Oct 2026: one partner's story measured 3,042px
 * on a phone, the home page 10,628px). `/about` passes `full` and `skipFirst`: it is the story's
 * own page, and AboutIntro above it already printed the first paragraph.
 */
function StoryText({ text, full = false, skipFirst = false }: { text: string | null | undefined; full?: boolean; skipFirst?: boolean }) {
  const all = paragraphs(text).slice(skipFirst ? 1 : 0);
  const shown = full ? all : all.slice(0, 2);
  const rest = full ? [] : all.slice(2);
  const p = "max-w-prose whitespace-pre-line text-base leading-8 text-foreground/90";
  return (
    <div className="space-y-4">
      {shown.map((t, i) => <p key={i} className={p}>{t}</p>)}
      {rest.length > 0 && (
        <details className="group">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-bold text-[hsl(var(--primary-ink,var(--primary)))] group-open:hidden">
            اقرأ القصّة كاملة
          </summary>
          <div className="space-y-4">{rest.map((t, i) => <p key={i} className={p}>{t}</p>)}</div>
        </details>
      )}
    </div>
  );
}

export function ImageTextAbout({ data, full = false, skipFirst = false }: { data: HomeData; preview?: boolean; full?: boolean; skipFirst?: boolean }) {
  const facts = [
    data.hero.foundingYear ? { Icon: CalendarDays, label: "التأسيس", value: data.hero.foundingYear } : null,
    data.about.legalName ? { Icon: Building2, label: "الاسم الرسمي", value: data.about.legalName } : null,
    // Credentials left this card (4 Oct 2026): the trust strip prints them on the same page.
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  return (
    // «قصّتنا», not the partner's name: the name is already the page's h1 a screen above (review, 4 Oct 2026).
    <Section id="about" eyebrow="تعرّف علينا" heading="قصّتنا">
      <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:items-start">
        <StoryText text={data.about.description} full={full} skipFirst={skipFirst} />
        {facts.length > 0 && (
          <dl className="grid gap-4 rounded-[var(--ps-radius-card,0.5rem)] bg-muted/40 p-6 ring-1 ring-border">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[hsl(var(--primary-ink,var(--primary)))]">
                  <f.Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="text-sm text-muted-foreground md:text-xs">{f.label}</dt>
                  <dd className="text-sm font-medium text-foreground">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Section>
  );
}

/** `/about`: the whole story, minus the paragraph AboutIntro already showed above it. */
export function AboutStory(props: { data: HomeData; preview?: boolean }) {
  return <ImageTextAbout {...props} full skipFirst />;
}
