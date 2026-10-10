import { markSize, type MarkProps } from "./mark-size";

/**
 * The sector marks for the «اكتشف القطاعات» row on `/modonty`, redrawn to
 * documents/design/ICON-STANDARD-v2.md (9 Oct 2026). AI is not here — it lives in
 * `modonty-brand-icons.tsx` (`ModontyAiMark` → `IconAi`).
 */

/**
 * The modonty FOOTBALL mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-football-body` · `--modonty-football-accent` (the diamond).
 */
export function ModontyFootballMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="12" cy="12" r="6.6" stroke="var(--modonty-football-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6.75L16.99 10.38L15.09 16.25L8.91 16.25L7.01 10.38Z" stroke="var(--modonty-football-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-football-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="8" cy="8" r="5.5" stroke="var(--modonty-football-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 2.5V4" stroke="var(--modonty-football-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.23 6.3L11.8 6.76" stroke="var(--modonty-football-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.23 12.45L10.35 11.24" stroke="var(--modonty-football-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.77 12.45L5.65 11.24" stroke="var(--modonty-football-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.77 6.3L4.2 6.76" stroke="var(--modonty-football-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-football-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty MARKETS mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-markets-body` · `--modonty-markets-accent` (the diamond).
 */
export function ModontyMarketsMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="4" y="15.5" width="3" height="5" rx="1" stroke="var(--modonty-markets-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="10.5" y="13" width="3" height="7.5" rx="1" stroke="var(--modonty-markets-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="17" y="10" width="3" height="10.5" rx="1" stroke="var(--modonty-markets-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.15 3.13A0.5 0.5 0 0 1 18.85 3.13L20.62 4.9A0.5 0.5 0 0 1 20.62 5.6L18.85 7.37A0.5 0.5 0 0 1 18.15 7.37L16.38 5.6A0.5 0.5 0 0 1 16.38 4.9Z" fill="var(--modonty-markets-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="2.5" y="10.5" width="2" height="3" rx="0.75" stroke="var(--modonty-markets-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="8.75" width="2" height="4.75" rx="0.75" stroke="var(--modonty-markets-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="11.5" y="7" width="2" height="6.5" rx="0.75" stroke="var(--modonty-markets-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.29 2.14A0.3 0.3 0 0 1 12.71 2.14L14.06 3.49A0.3 0.3 0 0 1 14.06 3.91L12.71 5.26A0.3 0.3 0 0 1 12.29 5.26L10.94 3.91A0.3 0.3 0 0 1 10.94 3.49Z" fill="var(--modonty-markets-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty ENTERTAINMENT mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-entertainment-body` · `--modonty-entertainment-accent` (the diamond).
 */
export function ModontyEntertainmentMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M8 5.5H16A4.5 4.5 0 0 1 20.5 10V15.5A3 3 0 0 1 15.1 17.3L14 15.5H10L8.9 17.3A3 3 0 0 1 3.5 15.5V10A4.5 4.5 0 0 1 8 5.5Z" stroke="var(--modonty-entertainment-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8.5V11.5" stroke="var(--modonty-entertainment-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 10H9.5" stroke="var(--modonty-entertainment-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.65 8.38A0.5 0.5 0 0 1 16.35 8.38L18.12 10.15A0.5 0.5 0 0 1 18.12 10.85L16.35 12.62A0.5 0.5 0 0 1 15.65 12.62L13.88 10.85A0.5 0.5 0 0 1 13.88 10.15Z" fill="var(--modonty-entertainment-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M5.5 2.5H10.5A3 3 0 0 1 13.5 5.5V10.5A2 2 0 0 1 9.9 11.7L9.3 10.7H6.7L6.1 11.7A2 2 0 0 1 2.5 10.5V5.5A3 3 0 0 1 5.5 2.5Z" stroke="var(--modonty-entertainment-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.79 4.94A0.3 0.3 0 0 1 10.21 4.94L11.56 6.29A0.3 0.3 0 0 1 11.56 6.71L10.21 8.06A0.3 0.3 0 0 1 9.79 8.06L8.44 6.71A0.3 0.3 0 0 1 8.44 6.29Z" fill="var(--modonty-entertainment-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty EDUCATION mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-education-body` · `--modonty-education-accent` (the diamond).
 */
export function ModontyEducationMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M11.25 4.5L19.5 8.75L11.25 13L3 8.75Z" stroke="var(--modonty-education-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.75 11.3V14.8C6.75 16.4 8.6 17.8 11.25 17.8S15.75 16.4 15.75 14.8V11.3" stroke="var(--modonty-education-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.5 8.75V13.5" stroke="var(--modonty-education-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.15 15.88A0.5 0.5 0 0 1 19.85 15.88L21.62 17.65A0.5 0.5 0 0 1 21.62 18.35L19.85 20.12A0.5 0.5 0 0 1 19.15 20.12L17.38 18.35A0.5 0.5 0 0 1 17.38 17.65Z" fill="var(--modonty-education-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M7 3.25L12.25 5.9L7 8.5L1.75 5.9Z" stroke="var(--modonty-education-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 7.4V10C4.5 10.9 5.6 11.6 7 11.6S9.5 10.9 9.5 10V7.4" stroke="var(--modonty-education-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.25 5.9V8.8" stroke="var(--modonty-education-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.04 10.64A0.3 0.3 0 0 1 12.46 10.64L13.81 11.99A0.3 0.3 0 0 1 13.81 12.41L12.46 13.76A0.3 0.3 0 0 1 12.04 13.76L10.69 12.41A0.3 0.3 0 0 1 10.69 11.99Z" fill="var(--modonty-education-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty QURAN mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-quran-body` · `--modonty-quran-accent` (the diamond).
 */
export function ModontyQuranMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M4 8.25C7.5 7.5 10.5 8 12 9.5C13.5 8 16.5 7.5 20 8.25V15.25C16.5 14.5 13.5 15 12 16.5C10.5 15 7.5 14.5 4 15.25Z" stroke="var(--modonty-quran-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9.5V16.5" stroke="var(--modonty-quran-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.25 21L12 16.5L16.75 21" stroke="var(--modonty-quran-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 2.63A0.5 0.5 0 0 1 12.35 2.63L14.12 4.4A0.5 0.5 0 0 1 14.12 5.1L12.35 6.87A0.5 0.5 0 0 1 11.65 6.87L9.88 5.1A0.5 0.5 0 0 1 9.88 4.4Z" fill="var(--modonty-quran-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2 5.75C4.5 5.25 7 5.5 8 6.75C9 5.5 11.5 5.25 14 5.75V10.75C11.5 10.25 9 10.5 8 11.5C7 10.5 4.5 10.25 2 10.75Z" stroke="var(--modonty-quran-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6.75V11.5" stroke="var(--modonty-quran-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 14.25L8 11.5L11 14.25" stroke="var(--modonty-quran-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 1.34A0.3 0.3 0 0 1 8.21 1.34L9.56 2.69A0.3 0.3 0 0 1 9.56 3.11L8.21 4.46A0.3 0.3 0 0 1 7.79 4.46L6.44 3.11A0.3 0.3 0 0 1 6.44 2.69Z" fill="var(--modonty-quran-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty LUCKY WHEEL mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-lucky-wheel-body` · `--modonty-lucky-wheel-accent` (the diamond).
 */
export function ModontyLuckyWheelMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="12" cy="14" r="6.25" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.4 14H18.25" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.2 16.08L15.13 19.41" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.8 16.08L8.87 19.41" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.6 14H5.75" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.8 11.92L8.87 8.59" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.2 11.92L15.13 8.59" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 14h.01" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 3.13A0.5 0.5 0 0 1 12.35 3.13L14.12 4.9A0.5 0.5 0 0 1 14.12 5.6L12.35 7.37A0.5 0.5 0 0 1 11.65 7.37L9.88 5.6A0.5 0.5 0 0 1 9.88 4.9Z" fill="var(--modonty-lucky-wheel-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="8" cy="9.25" r="4.25" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 9.25H12.25" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.95 10.9L10.13 12.93" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.05 10.9L5.87 12.93" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.1 9.25H3.75" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.05 7.6L5.87 5.57" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.95 7.6L10.13 5.57" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9.25h.01" stroke="var(--modonty-lucky-wheel-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 1.54A0.3 0.3 0 0 1 8.21 1.54L9.56 2.89A0.3 0.3 0 0 1 9.56 3.31L8.21 4.66A0.3 0.3 0 0 1 7.79 4.66L6.44 3.31A0.3 0.3 0 0 1 6.44 2.89Z" fill="var(--modonty-lucky-wheel-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty IDEA mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-idea-body` · `--modonty-idea-accent` (the diamond).
 */
export function ModontyIdeaMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M9.5 13.75A5.75 5.75 0 1 1 14.5 13.75V16H9.5Z" stroke="var(--modonty-idea-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.75 19.25H14.25" stroke="var(--modonty-idea-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 6.63A0.5 0.5 0 0 1 12.35 6.63L14.12 8.4A0.5 0.5 0 0 1 14.12 9.1L12.35 10.87A0.5 0.5 0 0 1 11.65 10.87L9.88 9.1A0.5 0.5 0 0 1 9.88 8.4Z" fill="var(--modonty-idea-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M6 9.25A3.75 3.75 0 1 1 10 9.25V11H6Z" stroke="var(--modonty-idea-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.25 13.25H9.75" stroke="var(--modonty-idea-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 4.54A0.3 0.3 0 0 1 8.21 4.54L9.56 5.89A0.3 0.3 0 0 1 9.56 6.31L8.21 7.66A0.3 0.3 0 0 1 7.79 7.66L6.44 6.31A0.3 0.3 0 0 1 6.44 5.89Z" fill="var(--modonty-idea-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty HEALTH mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-health-body` · `--modonty-health-accent` (the diamond).
 */
export function ModontyHealthMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M10.5 3.5H13.5A2 2 0 0 1 15.5 5.5V8.5H18.5A2 2 0 0 1 20.5 10.5V13.5A2 2 0 0 1 18.5 15.5H15.5V18.5A2 2 0 0 1 13.5 20.5H10.5A2 2 0 0 1 8.5 18.5V15.5H5.5A2 2 0 0 1 3.5 13.5V10.5A2 2 0 0 1 5.5 8.5H8.5V5.5A2 2 0 0 1 10.5 3.5Z" stroke="var(--modonty-health-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-health-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M6.5 2H9.5A1.5 1.5 0 0 1 11 3.5V5H12.5A1.5 1.5 0 0 1 14 6.5V9.5A1.5 1.5 0 0 1 12.5 11H11V12.5A1.5 1.5 0 0 1 9.5 14H6.5A1.5 1.5 0 0 1 5 12.5V11H3.5A1.5 1.5 0 0 1 2 9.5V6.5A1.5 1.5 0 0 1 3.5 5H5V3.5A1.5 1.5 0 0 1 6.5 2Z" stroke="var(--modonty-health-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-health-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

