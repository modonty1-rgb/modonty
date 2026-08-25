export function buildSiteEntityIds(siteUrl: string) {
  const origin = siteUrl.trim().replace(/\/+$/, "");

  return {
    origin,
    organization: `${origin}/#organization`,
    website: `${origin}/#website`,
  } as const;
}

export function normalizeSiteEntityIdsInJson(json: string, siteUrl: string): string {
  const ids = buildSiteEntityIds(siteUrl);

  return json
    .replaceAll(`${ids.origin}#organization`, ids.organization)
    .replaceAll(`${ids.origin}#website`, ids.website);
}
