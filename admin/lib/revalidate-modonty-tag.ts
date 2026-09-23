async function getModontyBaseUrl(baseUrl?: string | null): Promise<string | null> {
  // Dev: settings.siteUrl points to PRODUCTION (needed for correct canonical/JSON-LD
  // URLs even locally), so revalidation would hit prod. Locally, bust the local modonty
  // instead so admin edits actually reflect on localhost. Prod is unaffected.
  //
  // Checked BEFORE `baseUrl`: the settings save passes `siteUrl` in, so with the order
  // reversed a dev save went to www.modonty.com with the dev secret — measured 23 Sep 2026,
  // `401` on prod and the local page never rebuilt.
  if (process.env.NODE_ENV === "development") {
    return process.env.MODONTY_LOCAL_URL?.trim() || "http://localhost:3000";
  }
  const u = baseUrl?.trim();
  if (u) return u;
  // DB-first source of truth (matches loadSiteUrl semantics for revalidation target)
  const { getAllSettings } = await import("@/app/(dashboard)/settings/actions/settings-actions");
  const s = await getAllSettings();
  return s.siteUrl?.trim() || null;
}

/**
 * وسم الكتالوج لم يعد يعيش في مدونتي — انتقل مع صفحة البيع إلى حزمة `payment`
 * (PAY-S4، ١٤ سبتمبر ٢٠٢٦). فيُنادى تطبيقُه هو، لا تطبيق المدوّنة.
 *
 * ولو نُودي العنوان القديم لرجع ٤٠٠ «Tag must be one of…» لا يقرؤه أحد، وبقيت صفحة
 * البيع على السعر القديم — وهو أخطر ما يبيت قديماً في هذا المشروع.
 */
/**
 * `staff` ثانيها (١٥ سبتمبر ٢٠٢٦): قسم الفريق على أوفرفيو البيمنت يقرأ الموظّفين
 * المؤشَّر لهم «اعرض للعملاء»، وهو مكاشٌ لأن الصفحة ساكنة. ومدونتي لا تقرأ الموظّفين،
 * فلا يُرسَل إليها.
 */
const PAYMENT_TAGS = new Set<string>(["commercial-catalog", "staff"]);

/**
 * وسومٌ يقرؤها التطبيقان معاً، فتُبطَّل في الاثنين لا في أحدهما.
 *
 * `settings` منها: مدونتي تقرأ منه الشعار والحسابات، والبيمنت يقرأ منه نفسها **زائداً**
 * السجلّ القانوني الذي يُطبع في نموذج العقد (`payment/app/data/get-seller-legal.ts`).
 * وقبل هذا السطر كان يذهب إلى مدونتي وحدها، فيبقى رقم السجلّ القديم في عقدٍ يقرؤه
 * المشتري قبل الدفع — بلا أي أثرٍ يدلّ على ذلك.
 */
const SHARED_TAGS = new Set<string>(["settings"]);

async function getPaymentBaseUrl(): Promise<string | null> {
  if (process.env.NODE_ENV === "development") {
    return process.env.PAYMENT_LOCAL_URL?.trim() || "http://localhost:3003";
  }
  return process.env.PAYMENT_PUBLIC_URL?.trim() || null;
}

export async function revalidateModontyTag(
  // Keep in sync with ALLOWED_TAGS in modonty/app/api/revalidate/tag/route.ts — a tag this
  // union allows but that route rejects comes back as a 400 nobody reads, and the page keeps
  // serving stale data. That is exactly what "pages" did until 25 Aug 2026.
  // "commercial-catalog" is the exception: its route lives in payment/, see PAYMENT_TAGS.
  tag: "articles" | "settings" | "categories" | "clients" | "tags" | "industries" | "faqs" | "authors" | "reels" | "pages" | "ai-prompts" | "commercial-catalog" | "staff",
  baseUrl?: string | null
): Promise<void> {
  try {
    const targets = PAYMENT_TAGS.has(tag)
      ? [await getPaymentBaseUrl()]
      : SHARED_TAGS.has(tag)
        ? [await getModontyBaseUrl(baseUrl), await getPaymentBaseUrl()]
        : [await getModontyBaseUrl(baseUrl)];
    const urls = targets.filter((u): u is string => Boolean(u));
    if (urls.length === 0) return;
    const secret = process.env.REVALIDATE_SECRET;

    if (!secret) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[revalidateModontyTag] No REVALIDATE_SECRET - skipping modonty cache invalidation");
      }
      return;
    }

    // `allSettled` لا `all`: تطبيقٌ ساقط يجب ألّا يمنع إبطال الآخر — وأكشن الحفظ في
    // الأدمن لا يفشل لأن أحد المستهلكَين لم يردّ.
    await Promise.allSettled(
      urls.map(async (url) => {
        const res = await fetch(`${url}/api/revalidate/tag`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag, secret }),
        });
        if (!res.ok) {
          console.error(`[revalidateModontyTag] Failed to revalidate tag "${tag}" on ${url} — status ${res.status}`);
        }
      }),
    );

    /**
     * `/accounts` — a STATIC page built from Settings (the social links, and the sales phone
     * behind its WhatsApp button). Measured 23 Sep 2026: after a social link was saved the
     * `settings` tag reached modonty (200) and the page still served the old list three
     * requests later; only a path revalidation rebuilt it. So a Settings change also rebuilds
     * that one path — on modonty only, where the page lives.
     */
    if (tag === "settings") {
      const modonty = await getModontyBaseUrl(baseUrl);
      if (modonty) {
        const res = await fetch(`${modonty}/api/revalidate?path=${encodeURIComponent("/accounts")}&secret=${encodeURIComponent(secret)}`, {
          method: "POST",
        }).catch(() => null);
        if (res && !res.ok) console.error(`[revalidateModontyTag] Failed to rebuild /accounts on ${modonty} — status ${res.status}`);
      }
    }
  } catch (error) {
    console.error(`[revalidateModontyTag] Network error revalidating tag "${tag}" — modonty may be down:`, error instanceof Error ? error.message : error);
  }
}
