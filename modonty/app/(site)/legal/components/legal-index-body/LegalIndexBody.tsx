import { messages } from "@/lib/i18n/messages";

import { LegalLinkCard } from "../legal-link-card/LegalLinkCard";

const text = messages.legalIndex;

/** The four policies in the order a visitor asks for them — the order lives here, the wording in messages. */
const legalPages = [
  { href: "/legal/privacy-policy", ...text.links.privacyPolicy },
  { href: "/legal/cookie-policy", ...text.links.cookiePolicy },
  { href: "/legal/copyright-policy", ...text.links.copyrightPolicy },
  { href: "/legal/user-agreement", ...text.links.userAgreement },
];

/** The readable half of the index: heading, one intro line, and the four links. */
export function LegalIndexBody() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">{text.title}</h1>
      <p className="text-muted-foreground mb-8">{text.intro}</p>
      <ul className="space-y-4">
        {legalPages.map((page) => (
          <li key={page.href}>
            <LegalLinkCard href={page.href} title={page.title} description={page.description} />
          </li>
        ))}
      </ul>
    </>
  );
}
