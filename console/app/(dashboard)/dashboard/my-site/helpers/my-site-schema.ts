import { z } from "zod";
import { PARTNER_SITE_PALETTE_HEXES, validateSubdomain, normalizeSubdomain } from "@modonty/shared/lib/partner-site";
import { HEADER_TEMPLATES } from "@modonty/shared/components/partner-site/free/header";
import { FOOTER_TEMPLATES } from "@modonty/shared/components/partner-site/free/footer";

const headerKeys = HEADER_TEMPLATES.map((t) => t.key) as [string, ...string[]];
const footerKeys = FOOTER_TEMPLATES.map((t) => t.key) as [string, ...string[]];

/**
 * What «إعدادات الموقع» is allowed to save. Every value is a CHOICE from a list the code
 * owns (registry keys · palette hex) or passes the shared subdomain rules — never free
 * text, so a bad payload cannot put an unknown component or an unreadable colour live.
 */
export const mySiteInputSchema = z.object({
  headerTemplate: z.enum(headerKeys),
  footerTemplate: z.enum(footerKeys),
  primaryColor: z
    .string()
    .refine((hex) => PARTNER_SITE_PALETTE_HEXES.includes(hex), "لون من خارج اللوحة")
    .nullable(),
  subdomain: z
    .string()
    .transform(normalizeSubdomain)
    .refine((label) => label.length === 0 || validateSubdomain(label) === null, "الاسم غير صالح")
    .transform((label) => (label.length === 0 ? null : label)),
});

export type MySiteInput = z.input<typeof mySiteInputSchema>;
