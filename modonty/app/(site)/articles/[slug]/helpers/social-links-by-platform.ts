import { socialIconFor, type SocialIcon } from "./social-icon-for";

// One icon per platform. A partner with two Facebook URLs rendered two identical buttons,
// same glyph and same label, so the visitor picked by coin toss — the first one wins.
export function socialLinksByPlatform(sameAs: string[] | undefined): { url: string; meta: SocialIcon }[] {
  return Array.from(
    (sameAs ?? [])
      .map((url) => ({ url, meta: socialIconFor(url) }))
      .filter((s): s is { url: string; meta: SocialIcon } => s.meta !== null)
      .reduce((byPlatform, s) => {
        if (!byPlatform.has(s.meta.label)) byPlatform.set(s.meta.label, s);
        return byPlatform;
      }, new Map<string, { url: string; meta: SocialIcon }>())
      .values()
  );
}
