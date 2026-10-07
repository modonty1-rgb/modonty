import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";
import { LOGO_URL, MODONTY_AUTHOR_SLUG } from "@/constants";
import type { getAuthorBySlug } from "../data/get-author-by-slug";

type AuthorJsonLdInput = Pick<
  NonNullable<Awaited<ReturnType<typeof getAuthorBySlug>>>,
  | "slug"
  | "name"
  | "firstName"
  | "lastName"
  | "bio"
  | "image"
  | "jobTitle"
  | "email"
  | "linkedIn"
  | "twitter"
  | "facebook"
  | "sameAs"
  | "expertiseAreas"
  | "credentials"
  | "memberOf"
>;

export function buildAuthorJsonLd(author: AuthorJsonLdInput, siteUrl: string) {
  const sameAs: string[] = [
    ...(author.linkedIn ? [author.linkedIn] : []),
    ...(author.twitter ? [author.twitter] : []),
    ...(author.facebook ? [author.facebook] : []),
    ...(author.sameAs || []),
  ];
  // Modonty = the platform-brand Organization author (same @id as the site #organization
  // node + every article's author → one authoritative entity). A future individual writer
  // stays a Person, which is correct for a person.
  return author.slug === MODONTY_AUTHOR_SLUG
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": buildSiteEntityIds(siteUrl).organization,
        name: author.name,
        url: siteUrl,
        logo: { "@type": "ImageObject", url: LOGO_URL },
        ...(author.bio && { description: author.bio }),
        ...(author.email && { email: author.email }),
        ...(sameAs.length > 0 && { sameAs }),
      }
    : {
        "@context": "https://schema.org",
        "@type": "Person",
        name: author.name,
        ...(author.firstName && { givenName: author.firstName }),
        ...(author.lastName && { familyName: author.lastName }),
        ...(author.bio && { description: author.bio }),
        ...(author.image && { image: author.image }),
        url: `${siteUrl}/authors/${author.slug}`,
        ...(author.jobTitle && { jobTitle: author.jobTitle }),
        ...(author.email && { email: author.email }),
        ...(sameAs.length > 0 && { sameAs }),
        ...(author.expertiseAreas && author.expertiseAreas.length > 0 && { knowsAbout: author.expertiseAreas }),
        ...(author.credentials && author.credentials.length > 0 && { hasCredential: author.credentials }),
        ...(author.memberOf && author.memberOf.length > 0 && {
          memberOf: author.memberOf.map((org) => ({ "@type": "Organization", name: org })),
        }),
      };
}
