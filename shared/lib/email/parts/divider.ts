import { EMAIL_COLORS } from "../email-theme";

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${EMAIL_COLORS.border};margin:24px 0;" />`;
}
