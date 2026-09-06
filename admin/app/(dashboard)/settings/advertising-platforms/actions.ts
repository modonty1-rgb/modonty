"use server";

import { Prisma } from "@prisma/client";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE, ensureSettingsId } from "@/lib/settings/settings-singleton";

/**
 * الحقل يقبل ما يكتبه هو نفسه — `null` كما `""`.
 *
 * كان `z.string().trim()...transform(v => v || null)`: يكتب `null` في القاعدة ثم يرفض قراءته
 * (`Expected string, received null`). فكلّ مستندٍ حُفظ مرّة صار غير قابلٍ للتحليل، وسقط
 * `storedConfigSchema` بأكمله — ومعه **مفاتيح ميتا**، فظهرت الشاشة فارغة بينما القاعدة تحمل
 * `appSecret` فعلاً. مقيس: القاعدة `bde6d0…` والخانة `""`.
 *
 * والعطل لم يكن في الحفظ إطلاقاً — الحفظ يعمل، والقراءة هي التي كانت تُسقط كلّ شيء.
 */
const text = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value == null ? "" : value),
  z.string().max(160).transform((value) => value || null),
);
const platformSchema = z.object({ accountId: text, managerId: text });
const accountsSchema = z.object({
  meta: z.object({
    modonty: platformSchema,
    jbrseo: platformSchema,
  }),
  shared: z.object({
    tiktok: platformSchema,
    snapchat: platformSchema,
    google: platformSchema,
  }),
});
/**
 * ميتا: المفتاحان مشتركان، والتوكن **لكل علامة**.
 *
 * التطبيق واحد (`modonty`, App ID `2634180453617692`) فـ`appId` و`appSecret` يُكتبان مرّة.
 * أمّا التوكن فيصدر عن **مستخدمٍ نظاميّ داخل محفظة أعمالٍ بعينها**، ولكل علامة محفظتها
 * ومستخدمها:
 *
 *   مدونتي  — System User 61583458896568 · Business 545582405315442 · act_790007510859024
 *   جبر سيو — System User 61592645941942 · Business 1593662981776462 · act_1260508182300304
 *
 * فخانةٌ واحدة مشتركة تعني أن حفظ توكن جبر يدهس توكن مدونتي — وهو ما حذّر منه مستند التسليم
 * حرفياً. والتوكن الواحد لا يكفي الحسابين إلا لو كان **نفس** المستخدم النظاميّ يملك
 * `View performance` عليهما، وليس هذا وضعنا.
 */
const metaTokensSchema = z.object({
  modonty: z.string().optional(),
  jbrseo: z.string().optional(),
});

const credentialsSchema = z.object({
  meta: z.object({
    appId: z.string().optional(),
    appSecret: z.string().optional(),
    /**
     * التوكن المشترك القديم — يبقى مقروءاً كي لا تسقط المستندات السابقة، ولا يُستعمل.
     *
     * ولا يُرحَّل تلقائياً إلى إحدى العلامتين: لا يوجد في المستند ما يقول لأيّهما صدر، ونسخُه
     * إلى الاثنين يجعل حساباً يُستعلَم بتوكنٍ لا يملك إذناً عليه.
     */
    accessToken: z.string().optional(),
    tokens: metaTokensSchema.optional(),
  }).optional(),
  tiktok: z.object({ appId: z.string().optional(), appSecret: z.string().optional(), accessToken: z.string().optional(), refreshToken: z.string().optional() }).optional(),
  snapchat: z.object({ clientId: z.string().optional(), clientSecret: z.string().optional(), accessToken: z.string().optional(), refreshToken: z.string().optional() }).optional(),
  google: z.object({ clientId: z.string().optional(), clientSecret: z.string().optional(), developerToken: z.string().optional(), refreshToken: z.string().optional() }).optional(),
});
const storedConfigSchema = z.object({
  accounts: accountsSchema,
  /** Credentials are server-only. They must never be selected into a client component. */
  credentials: credentialsSchema.default({}),
});

function crypt(value: string) {
  const key = createHash("sha256").update(process.env.AUTH_SECRET ?? "advertising-platforms").digest();
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${body.toString("base64url")}`;
}

function decrypt(value: string | undefined) {
  if (!value) return "";
  if (!value.startsWith("v1.")) return value;
  try {
    const [, ivValue, tagValue, bodyValue] = value.split(".");
    const key = createHash("sha256").update(process.env.AUTH_SECRET ?? "advertising-platforms").digest();
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(bodyValue, "base64url")), decipher.final()]).toString("utf8");
  } catch { return ""; }
}

export type AdvertisingPlatformAccounts = z.infer<typeof accountsSchema>;

const EMPTY_ADVERTISING_PLATFORM_ACCOUNTS: AdvertisingPlatformAccounts = {
  meta: {
    modonty: { accountId: null, managerId: null },
    jbrseo: { accountId: null, managerId: null },
  },
  shared: {
    tiktok: { accountId: null, managerId: null },
    snapchat: { accountId: null, managerId: null },
    google: { accountId: null, managerId: null },
  },
};

/**
 * مسارُ قراءةٍ واحد لكل من يقرأ المستند — الحسابات والمفاتيح والحالة.
 *
 * كانت ثلاث دوالّ تكرّر `safeParse` نفسه، فحين سقط سقطت ثلاثتها معاً بأعراضٍ مختلفة (شاشة
 * فارغة · «يحتاج إعدادًا» دائم · محوُ الحسابات عند حفظ المفاتيح) وبدت ثلاثة أعطال.
 *
 * ويقرأ الجزأين مستقلَّين: مستندٌ تالفةٌ حساباتُه لا يجوز أن يُخفي مفاتيحه، والعكس.
 */
async function readStoredConfig() {
  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { adPlatformAccounts: true },
  });
  const raw = settings?.adPlatformAccounts as { accounts?: unknown; credentials?: unknown } | null;

  const full = storedConfigSchema.safeParse(raw);
  if (full.success) return full.data;

  // الشكل الأوّليّ (حسابات بلا غلاف) يبقى مقروءاً حتى يحوّله أوّل حفظ.
  const accounts =
    accountsSchema.safeParse(raw?.accounts).data ??
    accountsSchema.safeParse(raw).data ??
    EMPTY_ADVERTISING_PLATFORM_ACCOUNTS;
  const credentials = credentialsSchema.safeParse(raw?.credentials).data ?? {};
  return { accounts, credentials };
}

export async function getAdvertisingPlatformAccounts(): Promise<AdvertisingPlatformAccounts> {
  return (await readStoredConfig()).accounts;
}

/** Returns readiness only — no secret ever crosses this server boundary. */
export async function getAdvertisingPlatformCredentialStatus() {
  const { credentials } = await readStoredConfig();
  const metaApp = Boolean(credentials.meta?.appId && credentials.meta?.appSecret);
  return {
    // الجاهزية صارت لكل علامة: المفتاحان مشتركان، والتوكن ليس كذلك.
    meta: {
      modonty: metaApp && Boolean(credentials.meta?.tokens?.modonty),
      jbrseo: metaApp && Boolean(credentials.meta?.tokens?.jbrseo),
    },
    tiktok: Boolean(credentials.tiktok?.appId && credentials.tiktok?.appSecret && credentials.tiktok?.accessToken && credentials.tiktok?.refreshToken),
    snapchat: Boolean(credentials.snapchat?.clientId && credentials.snapchat?.clientSecret && credentials.snapchat?.accessToken && credentials.snapchat?.refreshToken),
    google: Boolean(credentials.google?.clientId && credentials.google?.clientSecret && credentials.google?.developerToken && credentials.google?.refreshToken),
  };
}

/** This screen is restricted to admins; values are deliberately editable here at the owner's request. */
export async function getAdvertisingPlatformCredentialsForAdmin() {
  const auth = await requireAdmin();
  const empty = { appId: "", appSecret: "", tokens: { modonty: "", jbrseo: "" } };
  if ("error" in auth) return { meta: empty };
  const meta = (await readStoredConfig()).credentials.meta;
  return {
    meta: {
      appId: decrypt(meta?.appId),
      appSecret: decrypt(meta?.appSecret),
      tokens: {
        modonty: decrypt(meta?.tokens?.modonty),
        jbrseo: decrypt(meta?.tokens?.jbrseo),
      },
    },
  };
}

export async function testMetaConnection(input: unknown) {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false as const, error: auth.error };
  const parsed = z.object({ accountId: z.string().trim().min(1), accessToken: z.string().trim().min(1) }).safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "أضف معرّف الحساب ورمز الوصول أولًا." };
  try {
    const response = await fetch(`https://graph.facebook.com/act_${encodeURIComponent(parsed.data.accountId)}?fields=id,name,account_status,currency&access_token=${encodeURIComponent(parsed.data.accessToken)}`, { cache: "no-store" });
    const result = await response.json() as { id?: string; name?: string; currency?: string; error?: { message?: string } };
    if (!response.ok || result.error) return { ok: false as const, error: result.error?.message ?? "لم تُقبل بيانات ميتا." };
    return { ok: true as const, account: { id: result.id ?? parsed.data.accountId, name: result.name ?? "", currency: result.currency ?? "" } };
  } catch { return { ok: false as const, error: "تعذّر الوصول إلى Meta Graph API الآن." }; }
}

export async function saveAdvertisingPlatformAccounts(input: unknown) {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false as const, error: auth.error };

  const parsed = accountsSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "راجِع معرّفات الحسابات." };

  try {
    const id = await ensureSettingsId();
    const current = await db.settings.findUnique({
      where: { id },
      select: { adPlatformAccounts: true },
    });
    // المفاتيح تُنقل كما هي: هذه الدالّة تحفظ الحسابات وحدها، ودهسُها بـ`{}` عند أيّ عطل
    // قراءةٍ يمحو مفاتيح ميتا بلا أن يطلبها أحد.
    const { credentials } = await readStoredConfig();
    await db.settings.update({
      where: { id },
      data: {
        adPlatformAccounts: {
          accounts: parsed.data,
          credentials,
        } as Prisma.InputJsonValue,
      },
    });
    revalidatePath("/settings/advertising-platforms");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "تعذّر حفظ الإعدادات الآن." };
  }
}

export async function saveAdvertisingPlatformCredentials(input: unknown) {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false as const, error: auth.error };
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "راجِع بيانات الربط التقنية." };
  const protect = (record: Record<string, string | undefined> | undefined) => Object.fromEntries(
    Object.entries(record ?? {})
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => [key, crypt(value!)]),
  );
  try {
    const id = await ensureSettingsId();
    // الحسابات تُنقل كما هي — لا `EMPTY`: حفظُ مفتاحٍ كان يمحو معرّفات الحسابات كلّها كلّما
    // فشلت القراءة، وهي كانت تفشل دائماً.
    const { accounts } = await readStoredConfig();
    const credentials = parsed.data;
    await db.settings.update({
      where: { id },
      data: {
        adPlatformAccounts: {
          accounts,
          credentials: {
            // ميتا تمرّ بـ`protect` كبقيّتها. كانت وحدها تُكتب نصّاً صريحاً — مقيس: القاعدة
            // تحمل `appSecret` مقروءاً بالعين. والتشفير يسري على ما يُكتب بعد اليوم، وما
            // كُتب صريحاً يُشفَّر عند أوّل حفظ لأن `decrypt` تمرّر غير المشفَّر كما هو.
            meta: {
              ...protect({ appId: credentials.meta?.appId, appSecret: credentials.meta?.appSecret }),
              tokens: protect(credentials.meta?.tokens),
            },
            tiktok: protect(credentials.tiktok),
            snapchat: protect(credentials.snapchat),
            google: protect(credentials.google),
          },
        } as Prisma.InputJsonValue,
      },
    });
    revalidatePath("/settings/advertising-platforms");
    return { ok: true as const };
  } catch { return { ok: false as const, error: "تعذّر حفظ مفاتيح المنصات." }; }
}
