import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

export interface CalendarClient {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

/** هويّة العميل في رأس كل صفحة من صفحاته. معرّف غير صالح → null (الصفحة تردّ notFound). */
export async function getCalendarClient(clientId: string): Promise<CalendarClient | null> {
  if (!/^[a-f\d]{24}$/i.test(clientId)) return null;
  const c = await db.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, slug: true, logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } } },
  });
  if (!c) return null;
  return { id: c.id, name: c.name, slug: c.slug, logoUrl: mediaSrc(c.logoMedia) };
}
