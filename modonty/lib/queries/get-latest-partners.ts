import { cacheLife, cacheTag } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import { db } from "@/lib/db";
import { getActivePartnerWhere } from "./get-active-partner-where";

export interface LatestPartner {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  industry: string | null;
  joinedAt: Date;
  /** علامةُ «موثّق» — نفسُ شرط `PartnerCard` في المقال. */
  isVerified: boolean;
}

/**
 * **أحدثُ الشركاء — دليلٌ بالاسم لا بالعدد** (خالد ٢٤ سبتمبر ٢٠٢٦).
 *
 * كرتُ «شركاء موثوقون» في الرئيسية كان يعرض ثلاثة أرقام، والأرقامُ انتقلت إلى الفوتر. الاسمُ
 * والشعارُ الحقيقيّ يفتحه الزائرُ ويتأكّد — والرقمُ لا. والكرتُ يتغيّر مع كلّ شريكٍ جديد.
 * «انضمّ» = تاريخُ إنشاء صفّ العميل.
 */
export async function getLatestPartners(take = 3): Promise<LatestPartner[]> {
  "use cache";
  cacheTag("clients", "settings");
  cacheLife("hours");

  const rows = await db.client.findMany({
    where: await getActivePartnerWhere(),
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      isVerified: true,
      industry: { select: { name: true } },
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    logo: mediaSrc(r.logoMedia),
    industry: r.industry?.name ?? null,
    joinedAt: r.createdAt,
    isVerified: r.isVerified,
  }));
}
