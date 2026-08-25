/**
 * The referrer policies Next.js accepts in `Metadata.referrer` (its `ReferrerEnum`).
 *
 * The value reaches us as free text from `Settings.defaultReferrerPolicy`, so it is checked
 * rather than cast: a typo there would otherwise be typed as valid and shipped as a
 * meaningless `<meta name="referrer">` that browsers ignore, silently falling back to their
 * own default on every page.
 */
export const REFERRER_POLICIES = [
  "no-referrer",
  "origin",
  "no-referrer-when-downgrade",
  "origin-when-cross-origin",
  "same-origin",
  "strict-origin",
  "strict-origin-when-cross-origin",
] as const;

export type ReferrerPolicy = (typeof REFERRER_POLICIES)[number];

/** The policy when Settings holds one Next.js understands, otherwise undefined. */
export function toReferrerPolicy(value: unknown): ReferrerPolicy | undefined {
  const v = typeof value === "string" ? value.trim() : "";
  return (REFERRER_POLICIES as readonly string[]).includes(v) ? (v as ReferrerPolicy) : undefined;
}
