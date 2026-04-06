const ALLOWED_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "img", "ul", "ol", "li",
  "strong", "em", "b", "i", "u", "s",
  "blockquote", "pre", "code",
  "table", "thead", "tbody", "tr", "th", "td",
  "br", "hr", "span", "div",
  "figure", "figcaption", "iframe",
]);

const ALLOWED_ATTR = new Set([
  "href", "src", "alt", "title", "class", "id",
  "target", "rel", "width", "height", "style",
  "colspan", "rowspan", "dir",
]);

function stripDisallowedAttributes(tag: string): string {
  return tag.replace(
    /\s([a-z\-]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*))?/gi,
    (match, attrName: string) => {
      const lower = attrName.toLowerCase();
      if (ALLOWED_ATTR.has(lower) || lower.startsWith("data-")) return match;
      return "";
    },
  );
}

/** Sanitize HTML content before rendering */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return dirty;

  // Remove script/style tags and their content
  let clean = dirty.replace(/<script[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Remove on* event handlers
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");

  // Remove javascript: URLs
  clean = clean.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="');
  clean = clean.replace(/src\s*=\s*["']?\s*javascript:/gi, 'src="');

  // Strip disallowed tags but keep their content
  clean = clean.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi, (match, tagName: string) => {
    const lower = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return "";
    if (match.startsWith("</")) return `</${lower}>`;
    return stripDisallowedAttributes(match);
  });

  return clean;
}
