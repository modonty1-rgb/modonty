"use server";

import { getClientSubscriptions } from "@/lib/subscription/get-client-subscriptions";
import { getClients } from "./get-articles-clients";

/**
 * **مَن نكتب له مقالاً جديداً** — اشتراكُه ساري بحسب طلبه، لا بحسب مفتاح الكرت.
 *
 * خالد (٢٣ سبتمبر ٢٠٢٦): «الاشتراكات المنتهية ما نشيلها من مدونتي، نخلّيهم موجودين،
 * ولكن ما نكتب لهم أرتكل». فمفتاحُ الكرت (`subscriptionStatus: ACTIVE`) يبقى يقرّر الظهور
 * على الموقع (`getClients`)، وهذه تزيد عليه شرطَ المال: مدّةُ الطلب الساري لم تنقضِ.
 *
 * لشاشة «مقال جديد» وحدها. القائمةُ والتعديلُ يبقيان على `getClients`: للمنتهي مقالاتٌ
 * قديمة تُفلتَر وتُعدَّل، وإسقاطُه منهما يكسر حقلَ العميل على مقالاته.
 */
export async function getWritableClients() {
  const clients = await getClients();
  const subs = await getClientSubscriptions({ id: { in: clients.map((c) => c.id) } });
  return clients.filter((c) => subs.get(c.id)?.status === "ACTIVE");
}
