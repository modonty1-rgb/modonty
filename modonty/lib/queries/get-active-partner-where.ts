import type { Prisma } from "@prisma/client";
import { SubscriptionStatus } from "@prisma/client";

import { getCoreClientId } from "@/lib/settings/get-core-client-id";

/**
 * **مَن هو «الشريك» — شرطٌ واحد** (خالد ٢٤ سبتمبر ٢٠٢٦: «بغضّ النظر نزل مقال ولا ما نزل — فهو شريك»).
 *
 * كلُّ عميلٍ ظاهرٍ على الموقع (`ACTIVE`) عدا مدونتي نفسها (`coreClientId`) — وهو ما تعرضه قائمةُ
 * `/clients`. يقرؤه عدّادُ الشركاء (`get-platform-counts.ts`) وقائمةُ «انضمّوا حديثاً»
 * (`get-latest-partners.ts`)، فلا يقول الكرتُ رقماً والقائمةُ غيره.
 */
export async function getActivePartnerWhere(): Promise<Prisma.ClientWhereInput> {
  const coreClientId = await getCoreClientId();
  return {
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    ...(coreClientId ? { id: { not: coreClientId } } : {}),
  };
}
