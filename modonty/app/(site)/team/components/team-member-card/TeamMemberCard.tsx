import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconEmail } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import type { TeamMember } from "@/lib/team/team-members";

interface TeamMemberCardProps {
  member: TeamMember;
  /** Above the fold on desktop → eager; the rest lazy. */
  aboveFold?: boolean;
}

/**
 * One person, the same way for all thirteen: portrait in one crop, name, role, two lines
 * on what they do, and the business mailbox as a real `mailto:` link — visible, not
 * obfuscated (Khalid, 2026-08-17: partners must be able to write to the right person).
 * The card `id` is the anchor the JSON-LD `Person.url` points at.
 */
export function TeamMemberCard({ member, aboveFold = false }: TeamMemberCardProps) {
  return (
    <article
      id={member.slug}
      className="flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-border transition hover:ring-2 hover:ring-primary/40"
    >
      <div className="relative aspect-[4/5] bg-muted">
        <OptimizedImage
          media={asMedia(member.imageUrl)}
          alt={member.name}
          fill
          loading={aboveFold ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw"
          className="object-cover object-top"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-base font-medium leading-tight text-foreground">{member.name}</h3>
        <p className="text-sm leading-tight text-primary">{member.role}</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">{member.bio}</p>

        <a
          href={`mailto:${member.email}`}
          className="mt-auto flex items-center gap-2 pt-4 text-sm text-foreground/75 transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary"
        >
          <IconEmail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="sr-only">{messages.team.contactLabel} </span>
          <span dir="ltr" className="truncate">{member.email}</span>
        </a>
      </div>
    </article>
  );
}
