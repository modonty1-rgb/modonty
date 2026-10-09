import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty PROFILE FILLED mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-profile-body` · `--modonty-profile-accent` (the diamond) · `--modonty-knockout` (the ring around the diamond; defaults to the page background).
 */
export function ModontyProfileFilledMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="12" cy="6.5" r="3" fill="var(--modonty-profile-body, currentColor)" stroke="var(--modonty-profile-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 21v-1a6.75 6.75 0 0 1 6.75-6.75h2.5a6.75 6.75 0 0 1 6.75 6.75v1" fill="var(--modonty-profile-body, currentColor)" stroke="var(--modonty-profile-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 16.13A0.5 0.5 0 0 1 12.35 16.13L14.12 17.9A0.5 0.5 0 0 1 14.12 18.6L12.35 20.37A0.5 0.5 0 0 1 11.65 20.37L9.88 18.6A0.5 0.5 0 0 1 9.88 17.9Z" fill="var(--modonty-knockout, hsl(var(--background)))" stroke="var(--modonty-knockout, hsl(var(--background)))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 16.13A0.5 0.5 0 0 1 12.35 16.13L14.12 17.9A0.5 0.5 0 0 1 14.12 18.6L12.35 20.37A0.5 0.5 0 0 1 11.65 20.37L9.88 18.6A0.5 0.5 0 0 1 9.88 17.9Z" fill="var(--modonty-profile-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="8" cy="4" r="2" fill="var(--modonty-profile-body, currentColor)" stroke="var(--modonty-profile-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 14.25v-.75a4.75 4.75 0 0 1 4.75-4.75h2.5a4.75 4.75 0 0 1 4.75 4.75v.75" fill="var(--modonty-profile-body, currentColor)" stroke="var(--modonty-profile-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 11.19A0.3 0.3 0 0 1 8.21 11.19L9.56 12.54A0.3 0.3 0 0 1 9.56 12.96L8.21 14.31A0.3 0.3 0 0 1 7.79 14.31L6.44 12.96A0.3 0.3 0 0 1 6.44 12.54Z" fill="var(--modonty-knockout, hsl(var(--background)))" stroke="var(--modonty-knockout, hsl(var(--background)))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 11.19A0.3 0.3 0 0 1 8.21 11.19L9.56 12.54A0.3 0.3 0 0 1 9.56 12.96L8.21 14.31A0.3 0.3 0 0 1 7.79 14.31L6.44 12.96A0.3 0.3 0 0 1 6.44 12.54Z" fill="var(--modonty-profile-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
