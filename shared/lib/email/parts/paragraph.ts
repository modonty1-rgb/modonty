import { EMAIL_COLORS } from "../email-theme";

export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:${EMAIL_COLORS.text};direction:rtl;">${text}</p>`;
}
