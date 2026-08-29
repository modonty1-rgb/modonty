import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = fs.readFileSync(path.join(root, "shared", "lib", "icons.ts"), "utf8");
const reportPath = path.join(root, "documents", "design", "modonty-icons-inventory.html");
const proposals = {
  IconChevronDown: "ModontyArrowMark", IconChevronRight: "ModontyArrowMark", IconChevronUp: "ModontyArrowMark",
  IconExternal: "ModontyArrowMark", IconForward: "ModontyArrowMark", IconScrollTop: "ModontyArrowMark",
  IconUsers: "ModontyProfessionalsMark", IconBriefcase: "ModontyProfessionalsMark",
  IconCheckCircle: "ModontySuccessMark", IconLock: "ModontyTrustMark", IconSend: "ModontyShareMark",
  IconVolumeX: "ModontyAudioMark", IconEyeOff: "ModontyViewsMark", IconRegister: "ModontyProfileMark",
};
const lucide = new Set([...registry.matchAll(/export\s+\{[^}]*?\bas\s+(\w+)\s*\}\s+from\s+'lucide-react'/g)].map((m) => m[1]));
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) return ["node_modules", ".next"].includes(entry.name) ? [] : walk(target);
    return /\.(ts|tsx)$/.test(entry.name) ? [target] : [];
  });
}
const consumers = new Map();
for (const file of walk(path.join(root, "modonty"))) {
  const source = fs.readFileSync(file, "utf8");
  for (const name of lucide) {
    if (new RegExp(`\\b${name}\\b`).test(source)) {
      (consumers.get(name) ?? consumers.set(name, new Set()).get(name)).add(path.relative(root, file).replaceAll("\\", "/"));
    }
  }
}
const rows = [...consumers].sort(([a], [b]) => a.localeCompare(b)).map(([icon, files]) => {
  const fileList = [...files].sort();
  const proposed = proposals[icon] ?? "يحتاج قرار";
  return `<tr data-filter-row><td><code>${icon}</code></td><td><code>${proposed}</code></td><td><strong>${fileList.length}</strong></td><td>${fileList.map((f) => `<span class="file-pill">${f}</span>`).join("")}</td></tr>`;
}).join("\n");
const block = `<!-- LUCIDE_AUDIT_START -->
      <section class="decision-card" id="lucide-audit" dir="rtl">
        <div class="decision-head"><div><p class="eyebrow">مسح فعلي للكود</p><h2>أيقونات Lucide المتبقية</h2><p>كل صف مصدره imports الحالية في public site عبر <code>@/lib/icons</code>.</p></div><div class="decision-summary"><div><span>أيقونات مستخدمة</span><strong>${consumers.size}</strong></div></div></div>
        <div class="decision-table-wrap"><table class="decision-table"><thead><tr><th>أيقونة التطبيق</th><th>البديل المقترح</th><th>الملفات</th><th>الملفات المتأثرة</th></tr></thead><tbody>${rows}</tbody></table></div>
      </section>
      <!-- LUCIDE_AUDIT_END -->`;
let report = fs.readFileSync(reportPath, "utf8");
report = /<!-- LUCIDE_AUDIT_START -->[\s\S]*?<!-- LUCIDE_AUDIT_END -->/.test(report)
  ? report.replace(/<!-- LUCIDE_AUDIT_START -->[\s\S]*?<!-- LUCIDE_AUDIT_END -->/, block)
  : report.replace("<!-- CODE_SYNC_END -->", `<!-- CODE_SYNC_END -->\n\n${block}`);
fs.writeFileSync(reportPath, report);
console.log(`Updated Lucide audit: ${consumers.size} icons.`);
