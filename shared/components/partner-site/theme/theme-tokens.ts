/**
 * A theme's LOOK, as CSS variables on the partner-site wrapper (`[data-partner-theme]`,
 * `#main-content`). Components read them with a fallback equal to the free theme's value, so a
 * page outside any wrapper still looks right:
 *
 *   rounded-[var(--ps-radius-card,0.5rem)] · py-[var(--ps-section-y,3rem)]
 *
 * Add a token only when a second theme actually needs it to differ — a variable no theme varies
 * is noise. The partner's colour is NOT a token: it is the partner's value (`primaryColor`).
 */
export interface ThemeTokens {
  /** Cards, images, section boxes. */
  radiusCard: string;
  /** Buttons, inputs, pills. */
  radiusControl: string;
  /** Vertical padding of every section on phones. */
  sectionY: string;
  /** Same, from `md`. */
  sectionYDesktop: string;
}

export function themeTokensCss(tokens: ThemeTokens): string {
  return (
    `--ps-radius-card:${tokens.radiusCard};` +
    `--ps-radius-control:${tokens.radiusControl};` +
    `--ps-section-y:${tokens.sectionY};` +
    `--ps-section-y-md:${tokens.sectionYDesktop}`
  );
}
