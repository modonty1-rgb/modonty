import { SITE_URL } from "@/constants";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";
import { messages } from "@/lib/i18n/messages";
import { TEAM_MEMBERS } from "@/lib/team/team-members";

export const TEAM_PAGE_URL = `${SITE_URL}/team`;
const ORGANIZATION_ID = buildSiteEntityIds(SITE_URL).organization;

/**
 * One `@graph`: the page → the organization → thirteen `Person` nodes that `worksFor` it.
 * This is the E-E-A-T signal the page exists for — Google reads WHO is behind the site
 * from `Person` entities linked to the `Organization`, not from a photo grid. `email` is
 * a schema.org `Person` property; it is the business mailbox shown on the card, so the
 * markup never claims a contact the visitor cannot see (Khalid, 2026-08-17).
 */
export function buildTeamJsonLd(organization: Record<string, unknown>) {
  const orgNode = Object.fromEntries(Object.entries(organization).filter(([key]) => key !== "@context"));

  const people = TEAM_MEMBERS.map((member) => ({
    "@type": "Person",
    "@id": `${TEAM_PAGE_URL}#${member.slug}`,
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    image: member.imageUrl,
    email: member.email,
    url: `${TEAM_PAGE_URL}#${member.slug}`,
    worksFor: { "@id": ORGANIZATION_ID },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": TEAM_PAGE_URL,
        url: TEAM_PAGE_URL,
        name: messages.team.seoTitle,
        description: messages.team.seoDescription,
        // اسم الموقع ولغته من عقدة الهوية عبر `@id` — لا نسخة ثانية مكتوبة هنا. عقدة
        // `WebSite` تُبنى مرّة واحدة من `Settings`، وتكرار اسمها كان يخلق كياناً منافساً.
        isPartOf: { "@id": buildSiteEntityIds(SITE_URL).website },
        about: { "@id": ORGANIZATION_ID },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: people.map((person, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: { "@id": person["@id"] },
          })),
        },
      },
      { ...orgNode, "@id": ORGANIZATION_ID, employee: people.map((person) => ({ "@id": person["@id"] })) },
      ...people,
    ],
  };
}
