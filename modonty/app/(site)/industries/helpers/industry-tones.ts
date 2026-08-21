/**
 * One fixed tone per field, rotating over the five action tokens — the SAME index feeds
 * the field's card and its context strip, so the color the visitor taps is the color
 * that greets them (Khalid, 21 Aug: «the bar use the same color of the card I select»).
 */
export interface IndustryTone {
  bar: string;
  ring: string;
  stripBorder: string;
  stripBg: string;
  chip: string;
}

export const INDUSTRY_TONES: IndustryTone[] = [
  { bar: "bg-action-like", ring: "ring-action-like", stripBorder: "border-action-like", stripBg: "bg-action-like/10", chip: "bg-action-like text-action-like-foreground" },
  { bar: "bg-action-save", ring: "ring-action-save", stripBorder: "border-action-save", stripBg: "bg-action-save/10", chip: "bg-action-save text-action-save-foreground" },
  { bar: "bg-action-comment", ring: "ring-action-comment", stripBorder: "border-action-comment", stripBg: "bg-action-comment/10", chip: "bg-action-comment text-action-comment-foreground" },
  { bar: "bg-action-share", ring: "ring-action-share", stripBorder: "border-action-share", stripBg: "bg-action-share/10", chip: "bg-action-share text-action-share-foreground" },
  { bar: "bg-action-listen", ring: "ring-action-listen", stripBorder: "border-action-listen", stripBg: "bg-action-listen/10", chip: "bg-action-listen text-action-listen-foreground" },
];

export function toneForIndex(index: number): IndustryTone {
  return INDUSTRY_TONES[((index % INDUSTRY_TONES.length) + INDUSTRY_TONES.length) % INDUSTRY_TONES.length];
}

/**
 * The tone a field keeps EVERYWHERE — its card, its context strip, and the top line of
 * every partner who belongs to it (Khalid, 21 Aug). Derived from the slug, not from a
 * position in a list, so publishing a new field never reshuffles the colours a returning
 * visitor already learned.
 */
export function toneForSlug(slug: string | null | undefined): IndustryTone {
  if (!slug) return INDUSTRY_TONES[0];
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) hash = (hash * 31 + slug.charCodeAt(i)) % 100003;
  return INDUSTRY_TONES[hash % INDUSTRY_TONES.length];
}
