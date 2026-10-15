import { db } from "@/lib/db";
import { getRadarFields } from "@/lib/idea-bank/get-radar-fields";

export type IdeaField = {
  value: string;
  type: string;
  name: string;
  open: number;
  /** آخر رصد — null = لم يصله الرادار بعد (لا «صفر أفكار»). */
  scan: { at: Date; ideas: number; error: string | null } | null;
};

const TYPE_ORDER: Record<string, number> = { sector: 0, category: 1, industry: 2, competitor: 3, general: 4 };

/**
 * كل مجالات الرادار (من القاعدة) بعدد ما لم يُحسم من أفكار كلٍّ وبآخر رصدٍ له — مجالٌ جديد بلا أفكار
 * يظهر، ويُعرف هل رُصد أم لم يصله الدور.
 */
export async function getIdeaFields(): Promise<IdeaField[]> {
  const [fields, grouped, scans] = await Promise.all([
    getRadarFields(),
    db.ideaBankItem.groupBy({
      by: ["fieldType", "fieldKey"],
      where: { fieldType: { not: null }, status: { in: ["NEW", "WATCH"] } },
      _count: { _all: true },
    }),
    db.ideaBankFieldScan.findMany({ select: { fieldType: true, fieldKey: true, lastScanAt: true, lastIdeas: true, lastError: true } }),
  ]);
  const open = new Map(grouped.map((g) => [`${g.fieldType}:${g.fieldKey}`, g._count._all]));
  const scanOf = new Map(scans.map((s) => [`${s.fieldType}:${s.fieldKey}`, { at: s.lastScanAt, ideas: s.lastIdeas, error: s.lastError }]));
  const all = [
    ...fields.map((f) => ({ value: `${f.type}:${f.key}`, type: f.type as string, name: f.name })),
    { value: "general:general", type: "general", name: "ترندات عامة" },
  ];
  return all
    .map((f) => ({ ...f, open: open.get(f.value) ?? 0, scan: scanOf.get(f.value) ?? null }))
    .sort((a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9) || b.open - a.open);
}
