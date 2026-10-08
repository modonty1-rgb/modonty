import type { Prisma, SocialChannel } from "@prisma/client";
import type { z } from "zod";

import { riyadhInputsToDate } from "./dates";
import type { publishDetailsSchema } from "./post-schema";

/**
 * بيانات الميديا باير بعد Zod → حقول الكتابة. مشتركة بين «حفظ بدون نشر» و«نشر» كي لا يكتب
 * الزرّان شكلين مختلفين لنفس الصفّ.
 *
 * - المبلغ والعملة والمدة تُكتب فقط مع «مدفوع» — كالواجهة التي لا تظهرها إلا معه.
 * - التاريخ + الوقت (بتوقيت الرياض) → `publishAt` لحظة واحدة.
 * - الروابط: فقط لقنوات المنشور نفسه، والفارغ يُسقط.
 */
export function buildPublishData(
  input: z.output<typeof publishDetailsSchema>,
  postChannels: readonly SocialChannel[],
): Prisma.SocialPostUpdateManyMutationInput {
  const sponsored = input.paidKind === "SPONSORED";
  const links: Partial<Record<SocialChannel, string>> = {};
  for (const ch of postChannels) {
    const url = input.channelLinks[ch]?.trim();
    if (url) links[ch] = url;
  }
  return {
    paidKind: input.paidKind,
    budget: sponsored ? input.budget : null,
    currency: sponsored ? input.currency : null,
    adDurationDays: sponsored ? input.adDurationDays : null,
    publishAt: input.publishDate ? riyadhInputsToDate(input.publishDate, input.publishTime || null) : null,
    channelLinks: Object.keys(links).length > 0 ? links : null,
  };
}
