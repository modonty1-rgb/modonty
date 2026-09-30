// Findings log for the subscriber-journey QA (Khalid, 29 Sep 2026: «أي ملاحظة تطلع لك سجّلها في ملف
// HTML عشان نعالج كل حاجة» — interactions AND any UI/UX note on the way). Data in findings.json,
// the page findings.html is rebuilt from it on every change. Run from the MODONTY repo root.
//   node note.mjs add --title "…" --area تفاعل|UI|UX|بيانات|أداء --sev high|med|low --page /articles/x --detail "…" --evidence "…"
//   node note.mjs fix <id> --how "…"      ·   node note.mjs reopen <id>   ·   node note.mjs list
import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "documents", "qa", "subscriber-journey");
const dataFile = path.join(dir, "findings.json");
const htmlFile = path.join(dir, "findings.html");
fs.mkdirSync(dir, { recursive: true });
const data = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, "utf8")) : { items: [] };
const arg = (n, d = "") => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const [cmd, idArg] = process.argv.slice(2);
// Riyadh time — the board is read in Saudi; UTC showed «17:04» at 20:04 local.
const now = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date());

if (cmd === "add") {
  const id = (data.items.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;
  data.items.push({ id, at: now, title: arg("title"), area: arg("area", "UX"), sev: arg("sev", "med"), page: arg("page"), detail: arg("detail"), evidence: arg("evidence"), status: "open" });
  console.log(`added #${id}`);
} else if (cmd === "fix" || cmd === "reopen") {
  const it = data.items.find((x) => x.id === Number(idArg));
  if (!it) throw new Error(`no finding #${idArg}`);
  it.status = cmd === "fix" ? "fixed" : "open";
  if (cmd === "fix") { it.fixedAt = now; it.how = arg("how"); }
  console.log(`#${it.id} → ${it.status}`);
} else if (cmd === "list") {
  for (const x of data.items) console.log(`#${x.id} [${x.status}] [${x.sev}] [${x.area}] ${x.title}${x.page ? "  " + x.page : ""}`);
} else if (cmd) {
  console.log("usage: note.mjs add|fix|reopen|list");
}
fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + "\n");

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const SEV = { high: ["عالية", "sev-h"], med: ["متوسطة", "sev-m"], low: ["منخفضة", "sev-l"] };
const rank = { high: 0, med: 1, low: 2 };
const open = data.items.filter((x) => x.status === "open").sort((a, b) => rank[a.sev] - rank[b.sev] || a.id - b.id);
const fixed = data.items.filter((x) => x.status === "fixed").sort((a, b) => b.id - a.id);
const card = (x) => `<article class="card ${x.status}"><header><span class="id">#${x.id}</span><span class="sev ${SEV[x.sev]?.[1] ?? ""}">${SEV[x.sev]?.[0] ?? x.sev}</span><span class="area">${esc(x.area)}</span>${x.page ? `<code dir="ltr">${esc(x.page)}</code>` : ""}<time>${esc(x.at)}</time></header><h3>${esc(x.title)}</h3>${x.detail ? `<p>${esc(x.detail)}</p>` : ""}${x.evidence ? `<pre dir="ltr">${esc(x.evidence)}</pre>` : ""}${x.status === "fixed" ? `<p class="how">عولجت ${esc(x.fixedAt)}${x.how ? ` — ${esc(x.how)}` : ""}</p>` : ""}</article>`;
fs.writeFileSync(htmlFile, `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ملاحظات رحلة المشترك</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet"><style>
:root{--bg:#f5f6fb;--card:#fff;--ink:#22243d;--muted:#686a80;--line:#e2e4ef;--h:#b42318;--m:#b54708;--l:#475467;--ok:#067647}
@media (prefers-color-scheme:dark){:root{--bg:#0f1024;--card:#181a33;--ink:#e6e7f2;--muted:#a3a5bb;--line:#2e3150;--h:#f97066;--m:#fdb022;--l:#98a2b3;--ok:#47cd89}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.8 'Tajawal',Tahoma,sans-serif}.wrap{max-width:1000px;margin:auto;padding:24px 16px}
h1{font-size:24px;margin:0}.sub{color:var(--muted);margin:4px 0 20px}.stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px}.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 16px}.stat b{font-size:22px;display:block}
h2{font-size:18px;margin:26px 0 10px}.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:10px}.card.fixed{opacity:.75}
header{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:12px;color:var(--muted)}.id{font-weight:700;color:var(--ink)}.sev{font-weight:700;padding:1px 8px;border-radius:20px;border:1px solid currentColor}.sev-h{color:var(--h)}.sev-m{color:var(--m)}.sev-l{color:var(--l)}.area{border:1px solid var(--line);border-radius:20px;padding:1px 8px}time{margin-inline-start:auto}
h3{font-size:16px;margin:8px 0 4px}p{margin:4px 0}pre{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px 10px;overflow:auto;font-size:12px;white-space:pre-wrap}.how{color:var(--ok);font-size:13px}code{font-size:12px}.empty{color:var(--muted)}
</style></head><body><main class="wrap"><h1>ملاحظات رحلة المشترك — مدونتي</h1><p class="sub">فحص حيّ على dev · حدّث الصفحة لترى الجديد · آخر تحديث ${esc(now)}</p>
<div class="stats"><div class="stat"><b>${open.length}</b>مفتوحة</div><div class="stat"><b>${open.filter((x) => x.sev === "high").length}</b>عالية الخطورة</div><div class="stat"><b>${fixed.length}</b>عولجت</div></div>
<h2>مفتوحة</h2>${open.length ? open.map(card).join("") : '<p class="empty">لا شيء مفتوح.</p>'}
<h2>عولجت</h2>${fixed.length ? fixed.map(card).join("") : '<p class="empty">لا شيء بعد.</p>'}
</main></body></html>
`);
console.log(`board: ${path.relative(process.cwd(), htmlFile)} · open=${open.length} fixed=${fixed.length}`);
