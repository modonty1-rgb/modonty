import { CONTACT_EMAIL } from "@/constants";

/** How /story shows the sales team's contacts. The number as dialled lives in `sales-whatsapp-url.ts`. */
export const SALES_WHATSAPP_DISPLAY =
  process.env.NEXT_PUBLIC_SALES_WHATSAPP_DISPLAY || "+966 54 101 8020";
export const SALES_EMAIL = process.env.NEXT_PUBLIC_SALES_EMAIL || CONTACT_EMAIL;
export const SALES_EMAIL_URL = `mailto:${SALES_EMAIL}`;
