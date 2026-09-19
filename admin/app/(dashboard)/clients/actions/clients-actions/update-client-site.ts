"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/admin-guard";

/**
 * **بابٌ ضيّقٌ لثلاثة حقول — لا لكرت العميل.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «اشرح لي الزود… يلزمه أكشن خاصّ».
 *
 * ── لماذا أكشنٌ مستقلٌّ لا `updateClient` ──
 * صفحةُ التعديل ترسل كلَّ شيءٍ في نداءٍ واحد (`use-client-form.ts:179`)، والحقولُ
 * الثلاثة تركب معها (`client-field-mapper.ts:128-130`). فزرُّ «Save Changes» الذي
 * يصحّح هاتفاً هو نفسُه الذي قد يعلّق النشرَ عن موقع العميل. وهما فعلان متباعدان في
 * الخطورة: الأوّلُ يومِيٌّ يُراجَع بالعين، والثاني يقطع تسليمَ مقالاتٍ عن موقعٍ حيّ.
 *
 * ── ولماذا Zod لا نوعُ TypeScript ──
 * النوعُ يختفي وقتَ التشغيل. وأكشنُ الخادم نقطةُ دخولٍ يصلها ما يُرسَل لا ما تعرضه
 * الشاشة — والدليلُ في مستودعنا: `console/.../profile-actions.ts` يقبل البريدَ ويكتبه
 * رغم أنّ الواجهةَ تعرضه للقراءة فقط، لأنّ حارسَه نوعٌ لا مخطَّط. والمخطَّطُ هنا يقصّ
 * كلَّ مفتاحٍ زائدٍ قبل أن يصل القاعدة، فيستحيل أن يلمس هذا الباب اسماً أو بريداً
 * أو كلمةَ مرور.
 */
const schema = z.object({
  /**
   * عنوانُ المقالات على موقع العميل — منه تُخبز كلُّ روابطه القانونيّة.
   *
   * `url()` لا `string()`: نصٌّ حرٌّ هنا يُخبز في `canonical` و`og:url` لكلّ مقالٍ
   * لذلك العميل، فعنوانٌ مكسورٌ يكسرها جميعاً بلا رسالةِ خطأ.
   */
  articlesBaseUrl: z.string().trim().url("عنوان غير صالح — يبدأ بـhttps://").nullable(),
  canPublishToOwnSite: z.boolean(),
  apiKeySuspended: z.boolean(),
});

export type UpdateClientSiteInput = z.infer<typeof schema>;

export async function updateClientSite(
  clientId: string,
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await checkAdmin();
  if (gate.status !== "ok") return { ok: false, error: "غير مصرَّح" };

  // `strip` هو سلوكُ Zod الافتراضيّ: ما ليس في المخطَّط لا يخرج من `parse`.
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "القيم غير صحيحة" };
  }
  const data = parsed.data;

  /**
   * الإذنُ لا يُرفع بلا عنوان: تسليمُ المقالات يُخبز من `articlesBaseUrl`، فرفعُ
   * الإذنِ بلا عنوانٍ يَعِد العميلَ بنشرٍ لا وجهةَ له.
   */
  if (data.canPublishToOwnSite && !data.articlesBaseUrl) {
    return { ok: false, error: "اكتب عنوان المقالات أوّلاً — لا نشرَ بلا وجهة" };
  }

  const client = await db.client.findUnique({ where: { id: clientId }, select: { slug: true } });
  if (!client) return { ok: false, error: "العميل غير موجود" };

  await db.client.update({
    where: { id: clientId },
    data: {
      articlesBaseUrl: data.articlesBaseUrl,
      canPublishToOwnSite: data.canPublishToOwnSite,
      apiKeySuspended: data.apiKeySuspended,
    },
  });

  revalidatePath(`/clients/${clientId}/site`);
  revalidatePath(`/clients/${clientId}/edit`);
  return { ok: true };
}
