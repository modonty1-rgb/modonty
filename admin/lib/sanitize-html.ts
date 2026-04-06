const ALLOWED_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "img", "ul", "ol", "li",
  "strong", "em", "b", "i",
  "blockquote", "pre", "code",
  "table", "thead", "tbody", "tr", "th", "td",
  "br", "hr",
  "span", "div",
  "figure", "figcaption",
  "iframe",
  "sub", "sup", "s", "u", "mark",
]);

const ALLOWED_ATTR = new Set([
  "href", "target", "rel",
  "src", "alt", "title", "width", "height", "loading",
  "class", "style", "id", "dir", "lang",
  "colspan", "rowspan", "scope",
  "allowfullscreen", "frameborder",
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

/** Sanitize HTML content from TipTap before storing to DB */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return html;

  // Remove script/style tags and their content entirely
  let clean = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Remove on* event handlers (onclick, onerror, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");

  // Remove javascript: URLs
  clean = clean.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="');
  clean = clean.replace(/src\s*=\s*["']?\s*javascript:/gi, 'src="');

  // Strip disallowed tags but keep their content
  clean = clean.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi, (match, tagName: string) => {
    const lower = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return "";
    // Self-closing or closing tag
    if (match.startsWith("</")) return `</${lower}>`;
    return stripDisallowedAttributes(match);
  });

  return clean;
}
