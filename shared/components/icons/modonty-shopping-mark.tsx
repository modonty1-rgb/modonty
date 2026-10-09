import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty SHOPPING mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-shopping-body` · `--modonty-shopping-accent` (the diamond).
 */
export function ModontyShoppingMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M5.5 8.5H18.5L20.5 18.5A2 2 0 0 1 18.5 20.5H5.5A2 2 0 0 1 3.5 18.5Z" stroke="var(--modonty-shopping-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.75 8.5V6.5A3.25 3.25 0 0 1 15.25 6.5V8.5" stroke="var(--modonty-shopping-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 12.48A0.5 0.5 0 0 1 12.35 12.48L14.12 14.25A0.5 0.5 0 0 1 14.12 14.95L12.35 16.72A0.5 0.5 0 0 1 11.65 16.72L9.88 14.95A0.5 0.5 0 0 1 9.88 14.25Z" fill="var(--modonty-shopping-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M4 6H12L13.5 12A1.5 1.5 0 0 1 12 13.5H4A1.5 1.5 0 0 1 2.5 12Z" stroke="var(--modonty-shopping-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.75 6V4.75A2.25 2.25 0 0 1 10.25 4.75V6" stroke="var(--modonty-shopping-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 8.34A0.3 0.3 0 0 1 8.21 8.34L9.56 9.69A0.3 0.3 0 0 1 9.56 10.11L8.21 11.46A0.3 0.3 0 0 1 7.79 11.46L6.44 10.11A0.3 0.3 0 0 1 6.44 9.69Z" fill="var(--modonty-shopping-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
