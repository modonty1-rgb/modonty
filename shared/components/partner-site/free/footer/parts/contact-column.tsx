import { Mail, MapPin, Phone } from "lucide-react";

import { SocialLinks } from "../../../social-links";
import { WhatsAppButton } from "../../../parts/whatsapp-button";
import type { FooterData } from "../footer-data";

interface ContactColumnProps {
  data: FooterData;
  title?: string;
  /** Show the social icons under the list. */
  social?: boolean;
  /** Console preview: icons render inert. */
  inert?: boolean;
}

/** Phone · email · address · WhatsApp text link (· social icons). Rows stay RTL; digits are LTR. */
export function ContactColumn({ data, title = "تواصل معنا", social = false, inert = false }: ContactColumnProps) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        {data.phone && (
          <li>
            <a href={`tel:${data.phone}`} className="flex items-center gap-2 transition-colors hover:text-foreground">
              <Phone className="h-4 w-4" aria-hidden /> <span dir="ltr">{data.phone}</span>
            </a>
          </li>
        )}
        {data.email && (
          <li>
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 transition-colors hover:text-foreground">
              <Mail className="h-4 w-4" aria-hidden /> {data.email}
            </a>
          </li>
        )}
        {data.address && (
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden /> {data.address}
          </li>
        )}
        <li>
          <WhatsAppButton href={data.whatsappHref} variant="text" />
        </li>
      </ul>
      {social && <SocialLinks urls={data.socialLinks} inert={inert} className="mt-4" />}
    </div>
  );
}
