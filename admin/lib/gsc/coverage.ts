

type PathType = "article" | "homepage" | "client" | "category" | "tag" | "industry" | "author" | "static" | "other";

/**
 * Parse a GSC URL into its semantic parts.
 * Handles trailing slashes and Arabic-encoded slugs.
 */
export function parseUrl(rawUrl: string): { type: PathType; path: string; slug?: string } {
  let path: string;
  try {
    const u = new URL(rawUrl);
    path = u.pathname;
  } catch {
    path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  }

  // Normalize: remove trailing slash (except root)
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  if (path === "" || path === "/") {
    return { type: "homepage", path: "/" };
  }

  const decode = (s: string): string => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };

  const matchPrefix = (prefix: string): string | null => {
    if (path.startsWith(prefix)) {
      const rest = path.slice(prefix.length);
      // Take only the first segment as the slug (ignore deeper paths like /articles/x/comments)
      const slug = decode(rest.split("/")[0] ?? "");
      return slug || null;
    }
    return null;
  };

  const articleSlug = matchPrefix("/articles/");
  if (articleSlug) return { type: "article", path, slug: articleSlug };

  const clientSlug = matchPrefix("/clients/");
  if (clientSlug) return { type: "client", path, slug: clientSlug };

  const categorySlug = matchPrefix("/categories/");
  if (categorySlug) return { type: "category", path, slug: categorySlug };

  const tagSlug = matchPrefix("/tags/");
  if (tagSlug) return { type: "tag", path, slug: tagSlug };

  const industrySlug = matchPrefix("/industries/");
  if (industrySlug) return { type: "industry", path, slug: industrySlug };

  const authorSlug = matchPrefix("/authors/");
  if (authorSlug) return { type: "author", path, slug: authorSlug };

  // Static pages: /about, /contact, /privacy, /terms, etc.
  if (/^\/(about|contact|privacy|terms|search|trending|saved|news|categories|clients|tags|authors|industries)$/.test(path)) {
    return { type: "static", path };
  }
  if (path.startsWith("/legal") || path.startsWith("/help")) {
    return { type: "static", path };
  }

  return { type: "other", path };
}
