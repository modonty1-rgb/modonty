import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty KEYPOINTS mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-keypoints-body` · `--modonty-keypoints-accent` (the diamond).
 */
export function ModontyKeypointsMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M14.75 6.5H3.25" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.75 12H3.25" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.75 17.5H4.5" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.25 12h.01" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.25 17.5h.01" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.9 4.38A0.5 0.5 0 0 1 19.6 4.38L21.37 6.15A0.5 0.5 0 0 1 21.37 6.85L19.6 8.62A0.5 0.5 0 0 1 18.9 8.62L17.13 6.85A0.5 0.5 0 0 1 17.13 6.15Z" fill="var(--modonty-keypoints-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M9.25 4.25H3" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.25 8H4.75" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.25 11.75H6.5" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.75 8h.01" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.75 11.75h.01" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.54 2.69A0.3 0.3 0 0 1 12.96 2.69L14.31 4.04A0.3 0.3 0 0 1 14.31 4.46L12.96 5.81A0.3 0.3 0 0 1 12.54 5.81L11.19 4.46A0.3 0.3 0 0 1 11.19 4.04Z" fill="var(--modonty-keypoints-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
