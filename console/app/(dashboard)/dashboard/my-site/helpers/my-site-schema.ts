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
  /**
   * OPTIONAL, and absent means «لا تلمس هذا الحقل».
   *
   * It used to be required, so every save wrote it — and an empty box became `null`. On
   * MongoDB a plain unique index counts nulls as equal values, so the second partner to save
   * with no subdomain collided with the first and got «هذا الاسم مستخدم» for a field he never
   * touched. Harmless while saving was one deliberate button; a live defect the moment every
   * colour click saves.
   */
  subdomain: z
    .string()
    .transform(normalizeSubdomain)
    .refine((label) => label.length === 0 || validateSubdomain(label) === null, "الاسم غير صالح")
    .transform((label) => (label.length === 0 ? null : label))
    .optional(),
});

export type MySiteInput = z.input<typeof mySiteInputSchema>;
