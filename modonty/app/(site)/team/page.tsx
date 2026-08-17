import type { Metadata } from "next";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { AccentHeading } from "@/components/shared/accent-heading/AccentHeading";
import { jsonLdHtml } from "@/lib/seo";
import { getLegalEntity, buildOrganizationJsonLd } from "@/lib/seo/organization-jsonld";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { messages } from "@/lib/i18n/messages";
import { TEAM_MEMBERS } from "@/lib/team/team-members";
import type { TeamDept } from "@/lib/team/team-members";

import { TeamMemberCard } from "./components/team-member-card/TeamMemberCard";
import { buildTeamJsonLd } from "./helpers/build-team-jsonld";

const text = messages.team;

/** Reading order on the page — leadership first, then the people a partner actually deals with. */
const DEPARTMENTS: readonly TeamDept[] = ["leadership", "content", "creative", "ops", "outreach"];
const SECTIONS = DEPARTMENTS.map((dept) => ({
  dept,
  label: text.departments[dept],
  members: TEAM_MEMBERS.filter((member) => member.dept === dept),
})).filter((section) => section.members.length > 0);

/** The first row of the first section is above the fold on desktop — those load eager. */
const EAGER_COUNT = 3;

// No page row exists for /team yet, so the builder runs on its fallbacks (it still ships
// og:, twitter:, robots and the nine hreflang locales from Settings, exactly like every page).
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(null, {
    path: "/team",
    fallbackTitle: text.seoTitle,
    fallbackDescription: text.seoDescription,
  });
}

/**
 * Who is behind modonty — thirteen people by department, each with a portrait, a role,
 * two lines, and a business mailbox. A page and not a popover because Google reads
 * `Person` entities from an indexed page (Khalid, 2026-08-17: «صفحة مخصّصة تخصّ الفريق
 * … عشان نستفيد منها في السيو وتدي مصداقية أكثر»). Static data, zero DB reads.
 */
export default async function TeamPage() {
  const entity = await getLegalEntity();
  const jsonLd = buildTeamJsonLd(buildOrganizationJsonLd(entity));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <div className="container mx-auto max-w-4xl space-y-10 px-4 py-6 sm:py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: text.breadcrumbLabel },
          ]}
        />

        <header className="space-y-3">
          <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">{text.title}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-foreground/75">{text.tagline}</p>
        </header>

        {SECTIONS.map((section, sectionIndex) => (
          <section key={section.dept} aria-labelledby={`team-${section.dept}`} className="space-y-4">
            <AccentHeading id={`team-${section.dept}`} size="title">
              {section.label}
            </AccentHeading>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.members.map((member, memberIndex) => (
                <li key={member.slug}>
                  <TeamMemberCard member={member} aboveFold={sectionIndex === 0 && memberIndex < EAGER_COUNT} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
