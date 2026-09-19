import { db } from "@/lib/db";

/**
 * **جردُ وثائقِ العملاء المبعثرة — قبل جمعها في جدولٍ واحد.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «فكرة الترحيل هذه كمان في نفس الصفحة».
 *
 * الوثائقُ اليوم في موضعين لا رابطَ بينهما، وكلاهما **نصٌّ عارٍ** لا صفّ:
 *   `Client.verificationImageUrl`      عمودٌ مفرد — نرفعه نحن (صفرُ تطابقٍ في `console/`)
 *   `Client.ymylData.licenseImageUrl`  مدفونٌ في JSON — يرفعه العميل من الكونسول
 *
 * فلا نعرف عددَها ولا تاريخَها ولا مَن رفعها، ولا نراها في شاشةٍ واحدة. والملفّاتُ
 * نفسُها على Bunny ولا تتحرّك: الترحيلُ ينسخ **الروابط** إلى صفوفٍ في `client_documents`.
 *
 * ── ولماذا يُقاس ما ليس صورةً ──
 * مقيسٌ على `modonty_dev`: أحدُ الثلاثة يحمل `https://www.cspdf.net/pdfDetail?...` —
 * رابطٌ لموقعٍ خارجيٍّ لا ملفّ. الحقلُ الحرُّ يقبل ما ليس وثيقةً، والجردُ يفصله حتّى
 * لا يُرحَّل صامتاً ويُحسب وثيقةً موثّقة.
 */

/** نطاقاتُ التخزين التي نملكها — ما عداها رابطٌ خارجيٌّ لا نضمن بقاءه. */
const OWNED_HOSTS = ["b-cdn.net"];

export type DocumentCandidate = {
  clientId: string;
  clientName: string;
  label: string;
  url: string;
  source: "CLIENT" | "STAFF";
  /** خارجيٌّ = ليس على مخزننا؛ يُرحَّل موسوماً لا مرفوضاً، فالقرارُ لخالد لا للسكربت. */
  external: boolean;
};

export type DocumentsPlan = {
  /** أصفارُ العدّ تعني «لا شيءَ يُرحَّل» — وهي حالةٌ صحيحةٌ لا خطأ. */
  fromVerification: number;
  fromYmyl: number;
  external: number;
  alreadyMigrated: number;
  candidates: DocumentCandidate[];
};

export async function planDocuments(): Promise<DocumentsPlan> {
  const clients = await db.client.findMany({
    select: { id: true, name: true, verificationImageUrl: true, ymylData: true, isYmyl: true },
  });

  // ما رُحِّل سابقاً يُعرف بالرابط نفسِه: إعادةُ التشغيل لا تُنشئ نسخةً ثانية.
  const existing = await db.clientDocument.findMany({ select: { clientId: true, url: true } });
  const seen = new Set(existing.map((d) => `${d.clientId}::${d.url}`));

  const candidates: DocumentCandidate[] = [];
  let fromVerification = 0;
  let fromYmyl = 0;
  let alreadyMigrated = 0;

  const push = (c: { id: string; name: string }, url: string, label: string, source: "CLIENT" | "STAFF") => {
    const clean = url.trim();
    if (!clean) return false;
    if (seen.has(`${c.id}::${clean}`)) {
      alreadyMigrated++;
      return false;
    }
    candidates.push({
      clientId: c.id,
      clientName: c.name,
      label,
      url: clean,
      source,
      external: !OWNED_HOSTS.some((h) => clean.includes(h)),
    });
    return true;
  };

  for (const c of clients) {
    if (c.verificationImageUrl && push(c, c.verificationImageUrl, "صورة التوثيق", "STAFF")) {
      fromVerification++;
    }
    const y = (c.ymylData ?? null) as Record<string, unknown> | null;
    const lic = typeof y?.licenseImageUrl === "string" ? y.licenseImageUrl : "";
    if (lic && push(c, lic, "ترخيص مهنيّ", "CLIENT")) {
      fromYmyl++;
    }
  }

  return {
    fromVerification,
    fromYmyl,
    external: candidates.filter((x) => x.external).length,
    alreadyMigrated,
    candidates,
  };
}
