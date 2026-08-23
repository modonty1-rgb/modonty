import {
  EMAIL_COLORS,
  EMAIL_CONTACT_ADDRESS,
  EMAIL_LEGAL_FALLBACK_HTML,
  EMAIL_SITE_URL,
} from "../email-theme";
import { getLegalFooterHtml } from "../get-legal-footer-html";

const { blue, gray, lightGray, border } = EMAIL_COLORS;

/**
 * THE email footer for the whole repo: contact line · site links · the legal registry.
 *
 * `async` because it reads the registry from `Settings.org*` ITSELF — the same source
 * /trust and the invoice use. That is the whole point: no caller can forget to pass it
 * (before MAILREV, 9 of 10 templates did exactly that).
 */
export async function emailFooter(): Promise<string> {
  const legalHtml = (await getLegalFooterHtml()) ?? EMAIL_LEGAL_FALLBACK_HTML;
  const host = EMAIL_SITE_URL.replace(/^https?:\/\//, "");

  return `<tr>
            <td style="background-color:${lightGray};padding:20px 32px;border-top:1px solid ${border};text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:${gray};">لأي استفسار راسلنا على <a href="mailto:${EMAIL_CONTACT_ADDRESS}" style="color:${blue};text-decoration:none;">${EMAIL_CONTACT_ADDRESS}</a>.</p>
              <p style="margin:0 0 10px;font-size:12px;color:${gray};">
                <a href="${EMAIL_SITE_URL}" style="color:${blue};text-decoration:none;">${host}</a>
                &nbsp;·&nbsp;
                <a href="${EMAIL_SITE_URL}/privacy" style="color:${blue};text-decoration:none;">سياسة الخصوصية</a>
              </p>
              <p style="margin:0;font-size:11px;color:${gray};line-height:1.7;">${legalHtml}</p>
            </td>
          </tr>`;
}
