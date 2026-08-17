/** How the visitor asked for the list — everything the page reads off the URL. */
export interface PartnersQuery {
  /** Free text typed in the bar; matched against name, description and industry. */
  q: string;
  /** Industry slug, or "" for «الكل». */
  industry: string;
  /** 1-based chunk of the list. */
  page: number;
}

/**
 * Reads the URL into a shape the page can trust: every field present, every value already
 * normalised. A hand-typed `?page=abc` falls back to the first page instead of reaching
 * the slicer.
 */
export function parsePartnersQuery(searchParams: Record<string, string | string[] | undefined>): PartnersQuery {
  const read = (key: string) => {
    const value = searchParams[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || "";
  };

  const page = Number.parseInt(read("page"), 10);

  return {
    q: read("q"),
    industry: read("industry"),
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}
