export { baseTemplate } from "./base-template";
export { getLegalFooterHtml } from "./get-legal-footer-html";
export { EMAIL_BRAND_AR, EMAIL_COLORS, EMAIL_CONTACT_ADDRESS, EMAIL_SITE_URL } from "./email-theme";
export { emailHeader } from "./parts/email-header";
export { emailFooter } from "./parts/email-footer";
export { ctaButton } from "./parts/cta-button";
export { divider } from "./parts/divider";
export { heading } from "./parts/heading";
export { paragraph } from "./parts/paragraph";
export { badge } from "./parts/badge";
export { warningBox } from "./parts/warning-box";

/** Every template returns exactly this — the senders in all three apps spread it into `sendEmail`. */
export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}
