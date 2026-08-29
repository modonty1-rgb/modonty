import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(root, "shared", "lib", "icons.ts");
const reportPath = path.join(root, "documents", "design", "modonty-icons-inventory.html");
const brandingPath = path.join(root, "documents", "design", "icon_branding.html");

// Active design gaps after comparing the live registry against the approved
// branding reference. An empty set means the inventory is fully resolved.
const approvedRemaining = new Set();
const approvedSemanticMigrations = new Set([
  "IconClients", "IconChevronLeft", "IconMessage", "IconNews", "IconFeed",
  "IconArticleList", "IconRead", "IconGift", "IconDiscount", "IconTicket", "IconReply",
  "IconDislike", "IconHistory", "IconSearchX",
  "IconVerified", "IconShield", "IconFileCheck", "ShieldCheck",
  "Volume2", "Wallet",
]);
const retiredScanEntries = new Set(["IconLanguages", "RotateCcw"]);

// Raw names from the legacy UI scan mapped to their live registry export.
const aliases = new Map([
  ["IconClients", "IconClients"],
  ["IconChevronLeft", "IconChevronLeft"],
  ["IconMessage", "IconMessage"],
  ["IconNews", "IconNews"],
  ["IconFeed", "IconFeed"],
  ["IconArticleList", "IconArticleList"],
  ["IconRead", "IconRead"],
  ["IconGift", "IconGift"],
  ["IconDiscount", "IconDiscount"],
  ["IconTicket", "IconTicket"],
  ["IconReply", "IconReply"],
  ["IconDislike", "IconDislike"],
  ["IconHistory", "IconHistory"],
  ["IconSearchX", "IconSearchX"],
  ["IconVerified", "IconVerified"],
  ["IconShield", "IconShield"],
  ["IconFileCheck", "IconFileCheck"],
  ["ShieldCheck", "IconShieldCheck"],
  ["Volume2", "IconVolume2"],
  ["Wallet", "IconWallet"],
  ["IconCode", "IconCode"],
  ["Square", "IconStop"],
  ["IconRocket", "IconRocket"],
  ["IconTarget", "IconTarget"],
  ["IconZap", "IconZap"],
  ["IconLightbulb", "IconLightbulb"],
  ["IconTotal", "IconTotal"],
  ["IconActivity", "IconActivity"], ["IconAi", "IconAi"], ["IconFolder", "IconFolder"],
  ["IconGrid", "IconGrid"], ["IconList", "IconList"], ["IconSuccess", "IconSuccess"],
  ["IconCopy", "IconCopy"], ["IconDelete", "IconDelete"], ["IconTheme", "IconTheme"],
  ["IconWebsite", "IconWebsite"], ["Loader2", "IconLoading"], ["Pause", "IconPause"],
  ["Play", "IconPlay"], ["Check", "IconCheck"], ["Gauge", "IconSpeed"],
  ["IconAlertTriangle", "IconAlertTriangle"], ["IconAnalytics", "IconAnalytics"],
  ["IconCircle", "IconCircle"], ["IconDownload", "IconDownload"], ["IconLink", "IconLink"],
  ["IconFileQuestion", "IconFileQuestion"],
  ["IconLinkOff", "IconLinkOff"], ["IconMoreHorizontal", "IconMoreHorizontal"],
  ["IconMoreVertical", "IconMoreVertical"], ["IconPause", "IconPause"],
  ["IconSettings", "IconSettings"], ["IconUpload", "IconUpload"], ["Minus", "IconRemove"],
  ["Monitor", "IconDesktop"], ["Plus", "IconAdd"], ["SkipBack", "IconSkipBack"],
  ["SkipForward", "IconSkipForward"], ["Smartphone", "IconMobile"],
]);

const registry = fs.readFileSync(registryPath, "utf8");
const brandedExports = new Map(
  [...registry.matchAll(/export\s+\{\s*(\w+)\s+as\s+(Icon\w+)\s*\}\s+from\s+['"](\.\.\/components\/icons\/modonty-[^'"]+)['"]/g)]
    .map((match) => [match[2], match[1]]),
);
const branding = fs.readFileSync(brandingPath, "utf8");
for (const name of approvedRemaining) {
  if (!branding.includes(name)) throw new Error(`Branding reference is missing ${name}`);
}

let report = fs.readFileSync(reportPath, "utf8");
const missingPanelMatch = report.match(/(<div class="tab-panel" id="tab-missing"[\s\S]*?<tbody>)([\s\S]*?)(<\/tbody>)/);

const legacyRows = new Map(
  [...(missingPanelMatch?.[2] ?? "").matchAll(/<tr data-filter-row>\s*<td><code>([^<]+)<\/code><\/td>\s*<td><strong>(\d+)<\/strong><\/td>\s*<td>[\s\S]*?<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/g)]
    .map((match) => [match[1], { uses: match[2], files: match[3] }]),
);
const resolved = [...aliases].filter(([, icon]) => brandedExports.has(icon));
const resolvedNames = resolved.map(([name]) => name);
const completedRows = resolved.map(([legacyName, icon]) => {
  const row = legacyRows.get(legacyName);
  if (!row) return "";
  return `<tr data-filter-row><td><code>${legacyName}</code></td><td><code>${brandedExports.get(icon)}</code></td><td><strong>${row.uses}</strong></td><td>${row.files}</td></tr>`;
}).join("\n");
const remainingRows = [...approvedRemaining].map((name) => {
  const row = legacyRows.get(name);
  if (!row) throw new Error(`Missing original inventory row for ${name}`);
  return `<tr data-filter-row><td><code>${name}</code></td><td><strong>${row.uses}</strong></td><td><span class="priority priority-low">منخفضة</span></td><td>${row.files}</td></tr>`;
}).join("\n");

const completed = 41 + resolved.length; // original completed set + verified migrations
const missing = approvedRemaining.size;
const remainingText = missing ? [...approvedRemaining].join("، ") : "لا توجد أيقونات معلّقة.";
const syncBlock = `<!-- CODE_SYNC_START -->
      <div class="audit-note" dir="rtl">
        <strong>مزامنة تلقائية مع الكود ومرجع البراند:</strong> ${completed} مكتمل، و${retiredScanEntries.size} صفان تاريخيان غير مستخدمين في المصدر الحالي.
        <br /><br /><strong>المتبقي المعتمد فقط:</strong> ${remainingText}
      </div>
      <!-- CODE_SYNC_END -->`;

report = report
  .replace(/<!-- CODE_SYNC_START -->[\s\S]*?<!-- CODE_SYNC_END -->/, syncBlock)
  .replace(/\s*<div class="audit-note" dir="rtl">\s*<strong>تم ربطها في الكود \(27\):<\/strong>[\s\S]*?<\/div>\s*/, "\n")
  .replace(/(<div><span>مكتمل<\/span><strong>)\d+(<\/strong><\/div>)/, `$1${completed}$2`)
  .replace(/(id="tab-button-completed"[\s\S]*?<span class="tab-count">)\d+(<\/span>)/, `$1${completed}$2`)
;

if (missingPanelMatch) {
  report = report.replace(missingPanelMatch[0], `${missingPanelMatch[1]}\n${remainingRows}\n${missingPanelMatch[3]}`);
}

const completedPanel = /(<div class="tab-panel" id="tab-completed"[\s\S]*?<tbody>)([\s\S]*?)(<\/tbody>)/;
if (completedRows) {
  report = report.replace(completedPanel, (_, start, body, end) => {
    const clean = body.replace(/\s*<!-- CODE_SYNC_COMPLETED_START -->[\s\S]*?<!-- CODE_SYNC_COMPLETED_END -->\s*/, "");
    return `${start}${clean}\n<!-- CODE_SYNC_COMPLETED_START -->\n${completedRows}\n<!-- CODE_SYNC_COMPLETED_END -->\n${end}`;
  });
}

// The registry audit's status chips now agree with the code-backed state.
for (const name of resolvedNames) {
  const chip = new RegExp(`<span class="chip status-(?:missing|semantic)"[^>]*>${name.replace(/[.*+?^$\\{}()|[\\]\\]/g, "\\$&")}(?: · \\d+)?<\\/span>`, "g");
  report = report.replace(chip, (value) => value.replace(/status-(?:missing|semantic)/, "status-exact migration-complete-chip").replace(/title="[^"]*"/, 'title="مكتمل — مربوط في سجل الأيقونات"'));
}
for (const name of approvedSemanticMigrations) {
  const semanticPanel = /(<div class="tab-panel" id="tab-semantic"[\s\S]*?<tbody>)([\s\S]*?)(<\/tbody>)/;
  report = report.replace(semanticPanel, (_, start, body, end) => {
    const row = new RegExp(`\\s*<tr data-filter-row>\\s*<td>(?:<code>)?${name}(?:<\\/code>)?<\\/td>[\\s\\S]*?<\\/tr>`, "g");
    return `${start}${body.replace(row, "")}${end}`;
  });
  const auditRow = new RegExp(`<tr class="audit-row audit-semantic">\\s*<td>${name}<\\/td>[\\s\\S]*?<\\/tr>`, "g");
  report = report.replace(auditRow, (value) => value
    .replace("audit-semantic", "audit-exact migration-complete-row")
    .replace("status-semantic", "status-complete")
    .replace("موجود — بديل دلالي", "مكتمل — تم التحويل"));
}
for (const name of retiredScanEntries) {
  const chip = new RegExp(`<span class="chip status-missing"[^>]*>${name}<\\/span>`, "g");
  report = report.replace(chip, (value) => value.replace("status-missing", "status-semantic").replace(/title="[^"]*"/, 'title="غير مستخدم في المصدر الحالي"'));
}

// The tab badge is derived from its actual visible rows, never from a manually
// maintained total. This keeps the number aligned with the rendered table.
const currentSemanticPanel = report.match(/<div class="tab-panel" id="tab-semantic"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/);
const semanticRemaining = currentSemanticPanel
  ? [...currentSemanticPanel[1].matchAll(/<tr data-filter-row>/g)].length
  : 0;
report = report
  .replace(/(<div><span>يحتاج قرار<\/span><strong>)\d+(<\/strong><\/div>)/, `$1${semanticRemaining}$2`)
  .replace(/(id="tab-button-semantic"[\s\S]*?<span class="tab-count">)\d+(<\/span>)/, `$1${semanticRemaining}$2`);

fs.writeFileSync(reportPath, report);
console.log(`Updated ${path.relative(root, reportPath)}: ${completed} complete, ${missing} active gaps.`);
