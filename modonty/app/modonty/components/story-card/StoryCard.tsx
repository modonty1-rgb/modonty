import Link from "next/link";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { IconChevronRight } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";

const SUMMARY = messages.modonty.story.summary;

interface Chapter {
  title: string;
  teaser: string;
  /** One word inside `teaser` to set apart (Khalid, 2026-08-17: «خلّي كلمة السعودية مميزة»). */
  highlight?: string;
}

/**
 * modonty's story in one card: the mark, one running paragraph with the chapter names in
 * bold accent, and one link to `/story` where the full audio pitch lives. Text visible,
 * not behind a click — Khalid (2026-08-17) rejected the drawer, then the popover:
 * «كارت واحد يتكلّم باختصار، والمزيد يودّي على رابط الـstory». Zero JavaScript.
 */
export function StoryCard() {
  const chapters: readonly Chapter[] = SUMMARY.chapters;
  return (
    <article aria-labelledby="modonty-story-heading" className="rounded-lg bg-card p-3 ring-1 ring-primary/10">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <ModontyMark className="h-5 w-5" aria-hidden />
        </span>
        <h2 id="modonty-story-heading" className="text-sm font-medium text-foreground">
          {SUMMARY.title}
        </h2>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground/75">
        {chapters.map((chapter, index) => (
          <span key={chapter.title}>
            {index > 0 && " "}
            <strong className="font-medium text-link-accent">{chapter.title}</strong>{" "}
            <Teaser text={chapter.teaser} highlight={chapter.highlight} />
          </span>
        ))}
      </p>
      {/* A person signs, a company doesn't — and it is always the team, never one name
          (Khalid, 2026-08-17: «دائماً فريق مدونتي، لأن الناس كلها شغّالة»). */}
      <p className="mt-2 text-xs text-foreground/60">{SUMMARY.signature}</p>

      <Link
        href="/story"
        className="group mt-4 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary transition-[color,transform] hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.98]"
      >
        {SUMMARY.moreLabel}
        <IconChevronRight
          className="h-4 w-4 transition-transform rtl:rotate-180 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </article>
  );
}

/** The teaser as-is, with its one highlighted word (if any) set in bold foreground. */
function Teaser({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const [before, ...rest] = text.split(highlight);
  return (
    <>
      {before}
      <strong className="font-medium text-foreground">{highlight}</strong>
      {rest.join(highlight)}
    </>
  );
}
