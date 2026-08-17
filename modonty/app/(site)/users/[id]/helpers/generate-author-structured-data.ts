export function generateAuthorStructuredData(author: any) {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    ...(author.bio && { description: author.bio }),
    ...(author.image && { image: author.image }),
    ...(author.url && { url: author.url }),
    ...(author.email && { email: author.email }),
    ...(author.firstName && { givenName: author.firstName }),
    ...(author.lastName && { familyName: author.lastName }),
    ...(author.jobTitle && { jobTitle: author.jobTitle }),
    ...(author.worksFor && {
      worksFor: {
        "@type": "Organization",
        "@id": author.worksFor,
      },
    }),
    ...(author.expertiseAreas && author.expertiseAreas.length > 0 && {
      knowsAbout: author.expertiseAreas,
    }),
    ...(author.credentials && author.credentials.length > 0 && {
      hasCredential: author.credentials,
    }),
    ...(author.memberOf && author.memberOf.length > 0 && {
      memberOf: author.memberOf.map((org: string) => ({
        "@type": "Organization",
        name: org,
      })),
    }),
  };

  const sameAs: string[] = [];
  if (author.linkedIn) sameAs.push(author.linkedIn);
  if (author.twitter) sameAs.push(author.twitter);
  if (author.facebook) sameAs.push(author.facebook);
  if (author.sameAs && author.sameAs.length > 0) {
    sameAs.push(...author.sameAs);
  }
  if (sameAs.length > 0) {
    structuredData.sameAs = sameAs;
  }

  return structuredData;
}
