import { EMAIL_COLORS } from "../email-theme";

export function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="background-color:${EMAIL_COLORS.blue};border-radius:6px;text-align:center;">
        <a href="${url}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;direction:rtl;">${text}</a>
      </td>
    </tr>
  </table>`;
}
