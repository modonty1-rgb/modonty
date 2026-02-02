export function validateAndNormalizeUrls(urls: string[] | undefined): string[] {
  if (!urls || !Array.isArray(urls)) return [];

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const url of urls) {
    if (!url || typeof url !== "string") continue;

    const trimmed = url.trim();
    if (!trimmed) continue;

    let normalizedUrl: string;
    try {
      if (/^https?:\/\//i.test(trimmed)) {
        normalizedUrl = trimmed;
      } else {
        normalizedUrl = `https://${trimmed}`;
      }

      const urlObj = new URL(normalizedUrl);
      if (!["http:", "https:"].includes(urlObj.protocol)) continue;
      if (!urlObj.hostname || urlObj.hostname.length === 0) continue;
      if (normalizedUrl.length > 2048) continue;

      const lowerUrl = normalizedUrl.toLowerCase();
      if (seen.has(lowerUrl)) continue;
      seen.add(lowerUrl);

      normalized.push(normalizedUrl);
    } catch {
      continue;
    }
  }

  return normalized;
}

