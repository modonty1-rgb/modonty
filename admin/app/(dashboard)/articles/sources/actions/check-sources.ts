"use server";

import { z } from "zod";
import { checkAdmin } from "@/lib/admin-guard";

/**
 * فحص النطاقات خارجيّاً — عمرُ النطاق من RDAP، والخطرُ من Safe Browsing.
 *
 * ── لماذا العمر أوّلاً ──
 * قِيس ١٦ سبتمبر ٢٠٢٦ على مواقع السبام الّتي تربط إلينا: `bhs-links-r275.xyz` عمره
 * ٣٥ يوماً · `linkseoservice.shop` ٥٨ · `seogrowthresults.shop` ٥٩. ومقابلها
 * `who.int` ١٠٬٣٣٠ يوماً. فالعمر وحده فصل بينها فصلاً تامّاً — وهو مجّانيّ بلا مفتاح.
 *
 * ── ولماذا لا يكفي Safe Browsing ──
 * اختُبر حيّاً بنفس النطاقات فرجعت **نظيفة كلّها**، بينما أمسك رابط الاختبار الخبيث.
 * فهو يكشف البرمجيّات الخبيثة والتصيّد، لا رداءة المصدر. طبقةُ أمانٍ لا طبقة جودة —
 * ولذلك يُشغَّل مع العمر لا بدلاً منه.
 *
 * ── الحصص ──
 * RDAP بلا مفتاح ولا حصّة معلنة، فيُنادى على دفعاتٍ صغيرة بمهلةٍ قصيرة كي لا تتعلّق
 * الصفحة على نطاقٍ لا يستجيب. وSafe Browsing يقبل ٥٠٠ رابطاً في النداء الواحد،
 * فنطاقاتنا كلّها تمرّ في نداءٍ واحد.
 */

const Body = z.object({
  domains: z.array(z.string().trim().min(3).max(253)).min(1).max(200),
});

export interface DomainCheck {
  domain: string;
  /** تاريخ التسجيل بصيغة yyyy-mm-dd — أو null إن لم يرجع RDAP شيئاً. */
  registered: string | null;
  /** عمر النطاق باليوم. */
  ageDays: number | null;
  /** هل صنّفته جوجل خطراً؟ */
  threat: string | null;
  /** قوّة النطاق ٠–١٠ من فهرس Common Crawl — أو null إن لم يُعرف. */
  pageRank: number | null;
  /** كم نطاقاً يربط إليه — العدد الّذي بُنيت عليه قوّته. */
  refDomains: number | null;
  /** هل هو في فهرس Common Crawl؟ null = لم يُسأل (لا مفتاح). */
  indexed: boolean | null;
  /** تعذّر الفحص — يُعرض كما هو لا يُخفى. */
  error: string | null;
}

const RDAP_TIMEOUT_MS = 8000;
const BATCH = 8;

/**
 * لاحقاتٌ من جزأين: `com.sa` ليست نطاقاً يُسجَّل، بل `stc.com.sa` هو المسجَّل.
 * القائمة تغطّي ما يظهر في مصادرنا فعلاً — لا كل لاحقات العالم.
 */
const TWO_PART = /\.(com|net|org|gov|edu|co|ac|mil|sch)\.[a-z]{2}$/i;

/**
 * النطاق المسجَّل من اسمٍ قد يكون فرعيّاً — RDAP يعرف `nih.gov` ولا يعرف
 * `pubmed.ncbi.nlm.nih.gov`، فكان النداء يرجع ٤٠٠ أو ٤٠٤ على كل نطاقٍ فرعيّ
 * (قِيس ١٦ سبتمبر ٢٠٢٦: ٤٩ فشلاً من ٧٢، أكثرها من هذا السبب).
 */
function registrableDomain(host: string): string {
  const parts = host.split(".");
  if (parts.length <= 2) return host;
  return TWO_PART.test(host) ? parts.slice(-3).join(".") : parts.slice(-2).join(".");
}

/** سجلّاتٌ لا تنشر RDAP — الغياب فيها ليس عطلاً ولا يُعرض كخطأ. */
const NO_RDAP_TLD = /\.(sa|ae|eg|qa|kw|bh|om)$/i;

async function fetchAge(input: string): Promise<Pick<DomainCheck, "registered" | "ageDays" | "error">> {
  const domain = registrableDomain(input);
  if (NO_RDAP_TLD.test(domain)) {
    return { registered: null, ageDays: null, error: "سجلّ النطاق لا ينشر البيانات" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RDAP_TIMEOUT_MS);
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      /**
       * `User-Agent` إلزاميّ — قِيس ١٦ سبتمبر ٢٠٢٦: rdap.org يردّ ٤٠٣ على النداء
       * بلا ترويسة هويّة، و٢٠٠ معها. و`fetch` في Next لا يرسل واحدةً افتراضاً،
       * فكان كل فحصٍ يرجع «RDAP 403» بينما ينجح نفس النداء من الطرفيّة.
       */
      headers: { Accept: "application/rdap+json", "User-Agent": "modonty-admin/1.0 (source vetting)" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) return { registered: null, ageDays: null, error: `RDAP ${res.status}` };

    const json = (await res.json()) as { events?: Array<{ eventAction?: string; eventDate?: string }> };
    const event = json.events?.find((e) => e.eventAction === "registration");
    if (!event?.eventDate) return { registered: null, ageDays: null, error: "لا تاريخ تسجيل" };

    const when = new Date(event.eventDate);
    if (Number.isNaN(when.getTime())) return { registered: null, ageDays: null, error: "تاريخ غير صالح" };

    return {
      registered: event.eventDate.slice(0, 10),
      ageDays: Math.round((Date.now() - when.getTime()) / 86_400_000),
      error: null,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return { registered: null, ageDays: null, error: aborted ? "انتهت المهلة" : "تعذّر الاتصال" };
  } finally {
    clearTimeout(timer);
  }
}

/** يرجع خريطة نطاق ← نوع التهديد، للنطاقات الّتي صنّفتها جوجل خطراً. */
async function fetchThreats(domains: string[]): Promise<Map<string, string>> {
  const key = process.env.GOOGLE_SAFE_BROWSING_KEY;
  const found = new Map<string, string>();
  if (!key) return found;

  try {
    const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: { clientId: "modonty-admin", clientVersion: "1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: domains.map((d) => ({ url: `https://${d}/` })),
        },
      }),
    });
    if (!res.ok) return found;

    const json = (await res.json()) as { matches?: Array<{ threatType?: string; threat?: { url?: string } }> };
    for (const match of json.matches ?? []) {
      const url = match.threat?.url;
      if (!url) continue;
      try {
        found.set(new URL(url).hostname.replace(/^www\./, ""), match.threatType ?? "THREAT");
      } catch {
        /* رابطٌ لا يُحلّل — يُتجاهل، والباقي يُقرأ */
      }
    }
  } catch {
    /* تعذّر النداء — تُرجَع خريطةٌ فارغة، والصفحة تعرض العمر وحده */
  }
  return found;
}

/**
 * قوّة النطاق من OpenPageRank — بديلُنا المجّانيّ عن Spam Score.
 *
 * ولماذا هو بديلٌ وليس بالمثل: «Spam Score» مقياسٌ يملكه موز ولا يبيعه إلا بواجهته
 * المدفوعة، فلا سبيل إليه مجّاناً. وOpenPageRank يقيس الضدّ — قوّة النطاق ٠–١٠
 * محسوبةً من فهرس Common Crawl المفتوح، ومعها عدد النطاقات الرابطة إليه.
 *
 * والعلاقة عمليّة لا نظريّة: مواقع بيع الروابط الّتي قِيست علينا (`.shop` و`.xyz`
 * أعمارها شهران) لا تملك نطاقاتٍ تربط إليها، فقوّتها صفرٌ أو قريبة منه. فالرقم
 * المنخفض ليس حكماً بالسبام، لكنّ الرقم المرتفع يُخرج الموقع من دائرة الشكّ.
 *
 * الحصّة: ٣٠ ألف نطاق شهريّاً و٦٠ نداءً في الدقيقة على الخطّة المجّانيّة،
 * و١٠٠ نطاق في النداء الواحد. ونطاقاتنا ١٢٩ — أي نداءان.
 */
const OPR_URL = "https://openpagerank.keywordseverywhere.com/v1/domains/bulk";
const OPR_BATCH = 100;

interface OprEntry {
  pageRank: number | null;
  refDomains: number | null;
  /** هل النطاق في فهرس Common Crawl أصلاً؟ */
  indexed: boolean;
}

async function fetchPageRanks(domains: string[]): Promise<Map<string, OprEntry>> {
  const key = process.env.OPEN_PAGE_RANK_KEY;
  const found = new Map<string, OprEntry>();
  if (!key) return found;

  for (let i = 0; i < domains.length; i += OPR_BATCH) {
    const slice = domains.slice(i, i + OPR_BATCH);
    try {
      const res = await fetch(OPR_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ domains: slice, include_history: false }),
      });
      if (!res.ok) continue;

      const json = (await res.json()) as {
        results?: Array<{ domain?: string; found?: boolean; open_page_rank?: number; referring_domains?: number }>;
      };
      for (const row of json.results ?? []) {
        if (!row.domain) continue;
        /**
         * `found: false` ليس حكماً على الموقع — قِيس ١٦ سبتمبر ٢٠٢٦ أنّ `modonty.com`
         * نفسه ليس في الفهرس. فالغياب يُعرض «غير مفهرس» لا صفراً، وإلا أدنّا أنفسنا.
         */
        const indexed = row.found !== false;
        found.set(row.domain.toLowerCase().replace(/^www\./, ""), {
          indexed,
          pageRank: indexed && typeof row.open_page_rank === "number" ? row.open_page_rank : null,
          refDomains: indexed && typeof row.referring_domains === "number" ? row.referring_domains : null,
        });
      }
    } catch {
      /* تعذّر النداء — يُترك العمود فارغاً، وبقيّة الفحص تمرّ */
    }
  }
  return found;
}

export async function checkSources(input: unknown): Promise<
  | { ok: true; checks: DomainCheck[]; safeBrowsingOn: boolean; pageRankOn: boolean }
  | { ok: false; error: string }
> {
  const gate = await checkAdmin();
  if (gate.status !== "ok") return { ok: false, error: "غير مصرّح" };

  const parsed = Body.safeParse(input);
  if (!parsed.success) return { ok: false, error: "طلبٌ غير صالح" };

  const { domains } = parsed.data;
  /** يُسأل عن الفرعيّ وعن أصله معاً، فأيّهما وُجد في الفهرس كفى. */
  const oprTargets = [...new Set(domains.flatMap((d) => [d, registrableDomain(d)]))];
  const [threats, ranks] = await Promise.all([fetchThreats(domains), fetchPageRanks(oprTargets)]);

  const checks: DomainCheck[] = [];
  for (let i = 0; i < domains.length; i += BATCH) {
    const slice = domains.slice(i, i + BATCH);
    const ages = await Promise.all(slice.map(fetchAge));
    slice.forEach((domain, n) => {
      /**
       * قوّة النطاق تخصّ النطاق المسجَّل لا الفرعيّ: `pubmed.ncbi.nlm.nih.gov` ليس
       * في فهرس الروابط بذاته، وقوّته هي قوّة `nih.gov`. فإن غاب الفرعيّ يُقرأ الأصل.
       */
      const opr = ranks.get(domain) ?? ranks.get(registrableDomain(domain)) ?? null;
      checks.push({
        domain,
        ...ages[n],
        threat: threats.get(domain) ?? null,
        pageRank: opr?.pageRank ?? null,
        refDomains: opr?.refDomains ?? null,
        indexed: opr ? opr.indexed : null,
      });
    });
  }

  return {
    ok: true,
    checks,
    safeBrowsingOn: Boolean(process.env.GOOGLE_SAFE_BROWSING_KEY),
    pageRankOn: Boolean(process.env.OPEN_PAGE_RANK_KEY),
  };
}
