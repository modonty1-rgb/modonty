"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { logAction } from "@/lib/audit/log-action";
import { deleteBunnyUrl, bunnyAspectUrl, BUNNY_ASPECT_SUFFIX } from "@modonty/shared/lib/bunny";
import { deleteStreamVideo } from "@modonty/shared/lib/bunny-stream";

import { getClientDeleteBlockers } from "./get-client-delete-blockers";
import { mayDeleteBunnyFiles } from "./may-delete-bunny-files";
import { requireDeleteAdmin } from "./require-delete-admin";
import { settleRedirects } from "./settle-redirects";
import type { DeleteResult } from "./delete-result";

/** `redirectToId`: عميل نشط بديل — رابط المحذوف يحوّل له تحويلاً دائماً بدل 410. */
export async function deleteClient(id: string, redirectToId?: string | null): Promise<DeleteResult> {
  try {
    const denied = await requireDeleteAdmin();
    if (denied) return { success: false, error: denied };

    const client = await db.client.findUnique({
      where: { id },
      select: { name: true, slug: true, subscriptionStatus: true },
    });
    if (!client) return { success: false, error: "العميل غير موجود — يمكن انحذف قبل." };

    const why = (await getClientDeleteBlockers([id])).get(id) ?? [];
    if (why.length) return { success: false, error: `ما ينحذف «${client.name}»: عنده ${why.join(" · ")}.` };

    // البديل لازم صفحته شغّالة، وإلا صار التحويل لصفحة 410.
    const target = redirectToId
      ? await db.client.findFirst({ where: { id: redirectToId, subscriptionStatus: "ACTIVE" }, select: { id: true, name: true, slug: true } })
      : null;
    if (redirectToId && (!target || target.id === id)) {
      return { success: false, error: "العميل البديل لازم يكون عميلاً آخر صفحته شغّالة (نشط)." };
    }

    // ملفّاته على بني تُقرأ قبل الحذف: صفوف الوسائط تنحذف معه (Cascade) وبعدها ما يبقى رابط نمسحه.
    const files = await db.media.findMany({
      where: { clientId: id },
      select: { bunnyUrl: true, bunnyVideoId: true, type: true },
    });

    // العميل يشير لشعاره وغلافه وصورة الجوّال والفيديو (NoAction)، والوسائط نفسها تنحذف معه
    // (Cascade) — فالحذف المباشر يرفضه Prisma: «would violate the required relation
    // 'ClientLogoMedia'» (حصل على الإنتاج ١٦ أكتوبر ٢٠٢٦). نفكّ الإشارات أولاً.
    await db.client.update({
      where: { id },
      data: { logoMediaId: null, heroImageMediaId: null, mobileHeroImageMediaId: null, introVideoMediaId: null },
    });

    // تقويمه الفاضي (المانع يضمن أنه بلا منشورات) — علاقته NoAction فما ينحذف معه تلقائياً.
    await db.socialCalendar.deleteMany({ where: { clientId: id } });

    // طلبه بصفر (المانع يضمن ما فيه طلب بمبلغ) — `clientId` بلا علاقة فما ينحذف معه، وبقاؤه يتيماً
    // يعدّ اشتراكاً لعميل غير موجود. محاولات الدفع وحركاته تنحذف معه (Cascade).
    await db.checkoutOrder.deleteMany({ where: { clientId: id, totalMinor: 0 } });

    await db.client.delete({ where: { id } });
    await settleRedirects("clients", client.slug, target?.slug);

    // بني — أفضل جهد، بعد نجاح الحذف وحده، ولا يُفشله (نفس عقد `lib/media/delete-media.ts`).
    for (const f of mayDeleteBunnyFiles() ? files : []) {
      try {
        if (f.bunnyUrl) {
          await deleteBunnyUrl("clients", f.bunnyUrl);
          if (f.type === "POST") {
            for (const suffix of Object.values(BUNNY_ASPECT_SUFFIX)) {
              await deleteBunnyUrl("clients", bunnyAspectUrl(f.bunnyUrl, suffix));
            }
          }
        }
        if (f.bunnyVideoId) await deleteStreamVideo(f.bunnyVideoId);
      } catch {
        console.warn("Bunny cleanup failed for a deleted client's file, continuing");
      }
    }

    await logAction("client.delete", {
      entity: "Client",
      entityId: id,
      summary: client.name,
      metadata: { slug: client.slug, files: files.length, redirectTo: target?.slug ?? null },
    });

    revalidatePath("/clients");
    revalidatePath("/deletion");
    // Rebuild the listing blob BEFORE busting modonty’s cache. It ran after, so the flush
    // went out first and the next visitor rebuilt the listing from the blob that still
    // contained the deleted row — the stale page served under a fresh cache. Same order the
    // create and update paths already follow.
    //
    // The answer is read too: the generator returns `{ success, error }` and never throws, so
    // `await` alone always looked successful. A failed rebuild holds the flush.
    let listingOk = true;
    try {
      const { regenerateClientsListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const r = await regenerateClientsListingCache();
      listingOk = r.success;
      if (!r.success) console.error("Clients listing cache failed:", r.error);
    } catch (e) {
      listingOk = false;
      console.error("Clients listing cache failed:", e);
    }
    if (listingOk) await revalidateModontyTag("clients");

    const live = client.subscriptionStatus === "ACTIVE";
    return {
      success: true,
      message:
        (target
          ? `انحذف «${client.name}». رابطه يحوّل تحويلاً دائماً لصفحة «${target.name}» خلال ٥ دقايق — جوجل ينقل قيمته لها.`
          : live
            ? `انحذف «${client.name}». صفحته ترجع لجوجل «410 محذوف» خلال ٥ دقايق وتنشال من البحث.`
            : `انحذف «${client.name}». صفحته كانت مقفلة أصلاً، فما له أثر جديد على جوجل.`) +
        (listingOk ? "" : " تنبيه: قائمة العملاء في الموقع ما تجدّدت — جدّدها من صيانة السيو."),
    };
  } catch (error) {
    return { success: false, error: `ما انحذف العميل — خطأ من القاعدة: ${error instanceof Error ? error.message : String(error)}` };
  }
}
