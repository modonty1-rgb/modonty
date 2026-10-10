import { markSize, type MarkProps } from "./mark-size";
/**
 * The modonty FOOTPRINTS mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-footprints-body` · `--modonty-footprints-accent` (the diamond).
 */
export function ModontyFootprintsMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M11.25 9L13.25 15.25" stroke="var(--modonty-footprints-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.5 10L7.5 13.25" stroke="var(--modonty-footprints-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.75 10.5L16.5 13.25" stroke="var(--modonty-footprints-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.25 15.25L9.75 18.25L8.5 20.75H4.75" stroke="var(--modonty-footprints-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.25 15.25L16.75 18L17.5 20.75H13.75" stroke="var(--modonty-footprints-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.15 2.13A0.5 0.5 0 0 1 10.85 2.13L12.62 3.9A0.5 0.5 0 0 1 12.62 4.6L10.85 6.37A0.5 0.5 0 0 1 10.15 6.37L8.38 4.6A0.5 0.5 0 0 1 8.38 3.9Z" fill="var(--modonty-footprints-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M7.75 6.35L9.1 10.35" stroke="var(--modonty-footprints-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.9 7.1L5.5 9.1" stroke="var(--modonty-footprints-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7.35L11 9.1" stroke="var(--modonty-footprints-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.1 10.35L6.75 12.35L6 14.1H4.5" stroke="var(--modonty-footprints-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.1 10.35L11.5 12.35L12 14.1H10.75" stroke="var(--modonty-footprints-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.79 1.29A0.3 0.3 0 0 1 7.21 1.29L8.56 2.64A0.3 0.3 0 0 1 8.56 3.06L7.21 4.41A0.3 0.3 0 0 1 6.79 4.41L5.44 3.06A0.3 0.3 0 0 1 5.44 2.64Z" fill="var(--modonty-footprints-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty LISTEN mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-listen-body` · `--modonty-listen-accent` (the diamond).
 */
export function ModontyListenMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M5 12.5V11.5A7 7 0 0 1 19 11.5V12.5" stroke="var(--modonty-listen-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="12.5" width="4" height="6.5" rx="2" stroke="var(--modonty-listen-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="17" y="12.5" width="4" height="6.5" rx="2" stroke="var(--modonty-listen-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 13.63A0.5 0.5 0 0 1 12.35 13.63L14.12 15.4A0.5 0.5 0 0 1 14.12 16.1L12.35 17.87A0.5 0.5 0 0 1 11.65 17.87L9.88 16.1A0.5 0.5 0 0 1 9.88 15.4Z" fill="var(--modonty-listen-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M3.25 8.5V8A4.75 4.75 0 0 1 12.75 8V8.5" stroke="var(--modonty-listen-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2" y="8.5" width="2.5" height="4.5" rx="1.25" stroke="var(--modonty-listen-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="11.5" y="8.5" width="2.5" height="4.5" rx="1.25" stroke="var(--modonty-listen-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 9.19A0.3 0.3 0 0 1 8.21 9.19L9.56 10.54A0.3 0.3 0 0 1 9.56 10.96L8.21 12.31A0.3 0.3 0 0 1 7.79 12.31L6.44 10.96A0.3 0.3 0 0 1 6.44 10.54Z" fill="var(--modonty-listen-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty LISTEN OFF mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-listen-off-body` · `--modonty-listen-off-accent` (the diamond).
 */
export function ModontyListenOffMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M5.5 14V12a6.5 6.5 0 0 1 13 0V14" stroke="var(--modonty-listen-off-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="14" width="3" height="5.5" rx="1.25" stroke="var(--modonty-listen-off-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="17" y="14" width="3" height="5.5" rx="1.25" stroke="var(--modonty-listen-off-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 17.5L17.5 6.5" stroke="var(--modonty-listen-off-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 14.88A0.5 0.5 0 0 1 12.35 14.88L14.12 16.65A0.5 0.5 0 0 1 14.12 17.35L12.35 19.12A0.5 0.5 0 0 1 11.65 19.12L9.88 17.35A0.5 0.5 0 0 1 9.88 16.65Z" fill="var(--modonty-listen-off-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M3.25 9V8a4.75 4.75 0 0 1 9.5 0V9" stroke="var(--modonty-listen-off-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2" y="9" width="2.5" height="3.5" rx="1" stroke="var(--modonty-listen-off-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="11.5" y="9" width="2.5" height="3.5" rx="1" stroke="var(--modonty-listen-off-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10.5L10.5 5" stroke="var(--modonty-listen-off-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 10.44A0.3 0.3 0 0 1 8.21 10.44L9.56 11.79A0.3 0.3 0 0 1 9.56 12.21L8.21 13.56A0.3 0.3 0 0 1 7.79 13.56L6.44 12.21A0.3 0.3 0 0 1 6.44 11.79Z" fill="var(--modonty-listen-off-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty MENU mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-menu-body` · `--modonty-menu-accent` (the diamond).
 */
export function ModontyMenuMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3 6H21" stroke="var(--modonty-menu-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12H21" stroke="var(--modonty-menu-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 18H21" stroke="var(--modonty-menu-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.15 15.88A0.5 0.5 0 0 1 13.85 15.88L15.62 17.65A0.5 0.5 0 0 1 15.62 18.35L13.85 20.12A0.5 0.5 0 0 1 13.15 20.12L11.38 18.35A0.5 0.5 0 0 1 11.38 17.65Z" fill="var(--modonty-menu-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2 3.5H14" stroke="var(--modonty-menu-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 8H14" stroke="var(--modonty-menu-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12.5H14" stroke="var(--modonty-menu-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.79 10.94A0.3 0.3 0 0 1 9.21 10.94L10.56 12.29A0.3 0.3 0 0 1 10.56 12.71L9.21 14.06A0.3 0.3 0 0 1 8.79 14.06L7.44 12.71A0.3 0.3 0 0 1 7.44 12.29Z" fill="var(--modonty-menu-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty REPLAY mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-replay-body` · `--modonty-replay-accent` (the diamond).
 */
export function ModontyReplayMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3.5 12.5A8.5 8.5 0 1 0 6 6.5" stroke="var(--modonty-replay-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 3.5V6.5H9.5" stroke="var(--modonty-replay-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 10.38A0.5 0.5 0 0 1 12.35 10.38L14.12 12.15A0.5 0.5 0 0 1 14.12 12.85L12.35 14.62A0.5 0.5 0 0 1 11.65 14.62L9.88 12.85A0.5 0.5 0 0 1 9.88 12.15Z" fill="var(--modonty-replay-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2.5 8.5A5.5 5.5 0 1 0 4.1 4.6" stroke="var(--modonty-replay-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.1 2.2V4.6H6.5" stroke="var(--modonty-replay-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.94A0.3 0.3 0 0 1 8.21 6.94L9.56 8.29A0.3 0.3 0 0 1 9.56 8.71L8.21 10.06A0.3 0.3 0 0 1 7.79 10.06L6.44 8.71A0.3 0.3 0 0 1 6.44 8.29Z" fill="var(--modonty-replay-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty TEXT BIGGER mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-text-bigger-body` · `--modonty-text-bigger-accent` (the diamond).
 */
export function ModontyTextBiggerMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3 20L8.5 5L14 20" stroke="var(--modonty-text-bigger-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 14.5H11.5" stroke="var(--modonty-text-bigger-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 8H21" stroke="var(--modonty-text-bigger-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.75 4.75V11.25" stroke="var(--modonty-text-bigger-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.4 5.88A0.5 0.5 0 0 1 18.1 5.88L19.87 7.65A0.5 0.5 0 0 1 19.87 8.35L18.1 10.12A0.5 0.5 0 0 1 17.4 10.12L15.63 8.35A0.5 0.5 0 0 1 15.63 7.65Z" fill="var(--modonty-text-bigger-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M1.75 14L5.5 3L9.25 14" stroke="var(--modonty-text-bigger-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.3 10.5H7.7" stroke="var(--modonty-text-bigger-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.75 5H14.25" stroke="var(--modonty-text-bigger-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2.75V7.25" stroke="var(--modonty-text-bigger-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.79 3.44A0.3 0.3 0 0 1 12.21 3.44L13.56 4.79A0.3 0.3 0 0 1 13.56 5.21L12.21 6.56A0.3 0.3 0 0 1 11.79 6.56L10.44 5.21A0.3 0.3 0 0 1 10.44 4.79Z" fill="var(--modonty-text-bigger-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty TEXT NORMAL mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-text-normal-body` · `--modonty-text-normal-accent` (the diamond).
 */
export function ModontyTextNormalMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3 20L8.5 5L14 20" stroke="var(--modonty-text-normal-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 14.5H11.5" stroke="var(--modonty-text-normal-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 5H21" stroke="var(--modonty-text-normal-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 11H21" stroke="var(--modonty-text-normal-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.4 5.88A0.5 0.5 0 0 1 18.1 5.88L19.87 7.65A0.5 0.5 0 0 1 19.87 8.35L18.1 10.12A0.5 0.5 0 0 1 17.4 10.12L15.63 8.35A0.5 0.5 0 0 1 15.63 7.65Z" fill="var(--modonty-text-normal-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M1.75 14L5.5 3L9.25 14" stroke="var(--modonty-text-normal-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.3 10.5H7.7" stroke="var(--modonty-text-normal-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.75 2.25H14.25" stroke="var(--modonty-text-normal-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.75 9.25H14.25" stroke="var(--modonty-text-normal-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.79 4.19A0.3 0.3 0 0 1 12.21 4.19L13.56 5.54A0.3 0.3 0 0 1 13.56 5.96L12.21 7.31A0.3 0.3 0 0 1 11.79 7.31L10.44 5.96A0.3 0.3 0 0 1 10.44 5.54Z" fill="var(--modonty-text-normal-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty TEXT SMALLER mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-text-smaller-body` · `--modonty-text-smaller-accent` (the diamond).
 */
export function ModontyTextSmallerMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M4.5 20L9 8L13.5 20" stroke="var(--modonty-text-smaller-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.2 16.5H11.8" stroke="var(--modonty-text-smaller-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 11H21" stroke="var(--modonty-text-smaller-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.4 8.88A0.5 0.5 0 0 1 18.1 8.88L19.87 10.65A0.5 0.5 0 0 1 19.87 11.35L18.1 13.12A0.5 0.5 0 0 1 17.4 13.12L15.63 11.35A0.5 0.5 0 0 1 15.63 10.65Z" fill="var(--modonty-text-smaller-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2.5 14L5.5 6L8.5 14" stroke="var(--modonty-text-smaller-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.8 11.5H7.2" stroke="var(--modonty-text-smaller-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.75 8H14.25" stroke="var(--modonty-text-smaller-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.79 6.44A0.3 0.3 0 0 1 12.21 6.44L13.56 7.79A0.3 0.3 0 0 1 13.56 8.21L12.21 9.56A0.3 0.3 0 0 1 11.79 9.56L10.44 8.21A0.3 0.3 0 0 1 10.44 7.79Z" fill="var(--modonty-text-smaller-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty VIDEO mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-video-body` · `--modonty-video-accent` (the diamond).
 */
export function ModontyVideoMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="3" y="6" width="12.5" height="12" rx="2" stroke="var(--modonty-video-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.5 10.5L21 7.5V16.5L15.5 13.5" stroke="var(--modonty-video-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.9 9.88A0.5 0.5 0 0 1 9.6 9.88L11.37 11.65A0.5 0.5 0 0 1 11.37 12.35L9.6 14.12A0.5 0.5 0 0 1 8.9 14.12L7.13 12.35A0.5 0.5 0 0 1 7.13 11.65Z" fill="var(--modonty-video-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="2" y="4" width="9" height="8" rx="1.5" stroke="var(--modonty-video-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 6.75L14 5V11L11 9.25" stroke="var(--modonty-video-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.29 6.44A0.3 0.3 0 0 1 6.71 6.44L8.06 7.79A0.3 0.3 0 0 1 8.06 8.21L6.71 9.56A0.3 0.3 0 0 1 6.29 9.56L4.94 8.21A0.3 0.3 0 0 1 4.94 7.79Z" fill="var(--modonty-video-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

