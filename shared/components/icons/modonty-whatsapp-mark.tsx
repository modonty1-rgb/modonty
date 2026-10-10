import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty WHATSAPP mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-whatsapp-body` · `--modonty-whatsapp-accent` (the diamond).
 */
export function ModontyWhatsappMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M4.72 14.4A7.75 7.75 0 1 1 8.72 18.77L4 19.75Z" stroke="var(--modonty-whatsapp-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.75 8.75V10A4 4 0 0 0 13.75 14H15" stroke="var(--modonty-whatsapp-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.75 8.75H10.75" stroke="var(--modonty-whatsapp-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 13V15" stroke="var(--modonty-whatsapp-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.75 15.28A0.5 0.5 0 0 1 6.45 15.28L8.22 17.05A0.5 0.5 0 0 1 8.22 17.75L6.45 19.52A0.5 0.5 0 0 1 5.75 19.52L3.98 17.75A0.5 0.5 0 0 1 3.98 17.05Z" fill="var(--modonty-whatsapp-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M3.3 9.46A5 5 0 1 1 5.89 12.28L2.5 13.25Z" stroke="var(--modonty-whatsapp-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5.25V6.25A2.5 2.5 0 0 0 8.5 8.75H9.5" stroke="var(--modonty-whatsapp-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 5.25H6.75" stroke="var(--modonty-whatsapp-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 8V9.5" stroke="var(--modonty-whatsapp-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.19 9.84A0.3 0.3 0 0 1 4.61 9.84L5.96 11.19A0.3 0.3 0 0 1 5.96 11.61L4.61 12.96A0.3 0.3 0 0 1 4.19 12.96L2.84 11.61A0.3 0.3 0 0 1 2.84 11.19Z" fill="var(--modonty-whatsapp-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
