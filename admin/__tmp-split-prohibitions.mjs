import fs from "node:fs";

const src = "app/(public)/playbook/prohibitions/page.tsx";
// الملفّ بنهايات CRLF، فبقاء \r يكسر المطابقة على "];"
const L = fs.readFileSync(src, "utf8").replace(/\r/g, "").split("\n");
const start = L.findIndex((l) => l.startsWith("const seoProhibitions"));
const end = L.findIndex((l, i) => i > start && l === "];");
let body = L.slice(start, end + 1).join("\n");

const dept = {
  "العلامة التجارية": "design",
  "الفيديو": "design",
  "منصات النشر": "marketing",
  "التقني": "tech",
  "المحتوى —": "content",
  "On-Page": "content",
  "الروابط الخارجية": "content",
  "Manual Penalty": "tech",
  "تجربة المستخدم": "tech",
};
for (const [needle, key] of Object.entries(dept)) {
  body = body.replace(
    new RegExp(`(category: "[^"]*${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^"]*",)`),
    `$1\n    dept: "${key}",`,
  );
}
body = body.replace("const seoProhibitions: ProhibitionCategory[]", "export const PROHIBITIONS: ProhibitionCategory[]");

const header = `import type { ElementType } from "react";
import { Activity, AlertCircle, Cpu, FileText, Film, Hash, Link2, Share2, Shield } from "lucide-react";

/**
 * الممنوعات — موزّعة على أقسامها لا مجموعة في صفحة واحدة.
 *
 * كانت كلّها في /playbook/prohibitions، فيقرأ المصمّم ممنوعات الفهرسة والمحرّر ممنوعات
 * اللوقو (خالد، ١٢ سبتمبر ٢٠٢٦: «كل واحد وديه على قسمه»). و\`dept\` هو ما يسحب به كل
 * قسم ما يخصّه، وتبقى الصفحة الجامعة فهرسًا يدلّ عليها.
 */
export type Severity = "critical" | "high" | "medium";

export interface Prohibition {
  name: string;
  consequence: string;
  severity: Severity;
}

export interface ProhibitionCategory {
  category: string;
  /** مفتاح القسم: design · marketing · content · tech */
  dept: string;
  icon: ElementType;
  items: Prohibition[];
}

export const SEVERITY: Record<Severity, { label: string; badge: string; dot: string }> = {
  critical: { label: "خطر فوري", badge: "border-red-500/40 text-red-400 bg-red-500/[0.08]", dot: "bg-red-500" },
  high: { label: "يخفض الترتيب", badge: "border-orange-500/40 text-orange-400 bg-orange-500/[0.08]", dot: "bg-orange-500" },
  medium: { label: "يضعف الموقع", badge: "border-yellow-500/40 text-yellow-400 bg-yellow-500/[0.08]", dot: "bg-yellow-500" },
};

`;

fs.mkdirSync("app/(public)/playbook/prohibitions/helpers", { recursive: true });
const out = "app/(public)/playbook/prohibitions/helpers/prohibitions-data.ts";
fs.writeFileSync(out, header + body + "\n");

const w = fs.readFileSync(out, "utf8");
const counts = [...w.matchAll(/dept: "(\w+)"/g)].reduce((a, m) => ((a[m[1]] = (a[m[1]] || 0) + 1), a), {});
console.log("تصنيفات:", (w.match(/category: "/g) || []).length, "| موسومة:", (w.match(/dept: "/g) || []).length);
console.log("التوزيع:", JSON.stringify(counts));
console.log("بنود:", (w.match(/severity:/g) || []).length);
