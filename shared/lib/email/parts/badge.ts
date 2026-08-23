import { EMAIL_COLORS } from "../email-theme";

export function badge(text: string, color: string = EMAIL_COLORS.teal): string {
  return `<span style="display:inline-block;background-color:${color};color:#fff;font-size:11px;font-weight:bold;padding:3px 10px;border-radius:12px;">${text}</span>`;
}
