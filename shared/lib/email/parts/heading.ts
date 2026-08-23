import { EMAIL_COLORS } from "../email-theme";

export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:20px;font-weight:bold;color:${EMAIL_COLORS.navy};direction:rtl;">${text}</h1>`;
}
