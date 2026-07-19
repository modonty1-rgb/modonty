/**
 * Visitor geo from Vercel edge request headers — free, no external API.
 * Official names (vercel.com/docs/headers/request-headers):
 *   x-vercel-ip-country        → ISO 3166-1 alpha-2 (SA, EG, ...)
 *   x-vercel-ip-country-region → ISO 3166-2 region portion (≤3 chars)
 *   x-vercel-ip-city           → RFC3986-encoded city name (must decode)
 * All null in local dev (headers only exist on Vercel).
 */

export interface VisitorGeo {
  country: string | null;
  region: string | null;
  city: string | null;
}

export function getGeoFromHeaders(headersList: Headers): VisitorGeo {
  const country = headersList.get("x-vercel-ip-country") || null;
  const region = headersList.get("x-vercel-ip-country-region") || null;
  const rawCity = headersList.get("x-vercel-ip-city");
  let city: string | null = null;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }
  return { country, region, city };
}
