import { BRAND_LOGO_URL } from "../../brand-assets";
import { EMAIL_BRAND_AR, EMAIL_COLORS } from "../email-theme";

/**
 * THE email header for the whole repo — brand logo on white with the navy rule under it.
 *
 * A standalone part, not markup buried inside `baseTemplate`: any app can compose its own
 * shell from `emailHeader() + content + emailFooter()` and still be the same email.
 */
export function emailHeader(): string {
  return `<tr>
            <td style="background-color:#ffffff;padding:28px 32px;text-align:center;border-bottom:3px solid ${EMAIL_COLORS.navy};">
              <img src="${BRAND_LOGO_URL}" alt="${EMAIL_BRAND_AR}" width="160" height="auto" style="display:inline-block;max-height:56px;object-fit:contain;" />
            </td>
          </tr>`;
}
