/**
 * خادم ثابت صغير للوحات — يخدم هذا المجلّد على منفذ محلّي.
 *
 * لماذا وُجد (خالد ٢٩ أغسطس): «حاول أنت تعمل F5». كلود موصول بمتصفّح خالد عبر إضافة
 * Playwright، لكن بروتوكول `file:` محجوب عليها:
 *
 *     navigate file:///…/TASK.html
 *     → Error: Access to "file:" protocol is blocked
 *
 * فكان خالد يفتح اللوحة من القرص، وكلود يعدّلها ولا يستطيع إنعاشها ولا رؤيتها — فيقول
 * «جاهز» وهو لم ينظر. الخدمة على `http://` تفكّ الاثنين معاً: كلود يفتح ويُنعش ويتحقّق
 * بعينه قبل الإعلان، وخالد لا يضغط F5 أبداً.
 *
 *     node documents/tasks/serve-boards.mjs
 *     → http://localhost:4173/TASK.html
 *
 * قراءة فقط: لا كتابة، ولا خروج من هذا المجلّد (حارس المسار أدناه).
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.BOARDS_PORT) || 4173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".md": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const raw = decodeURIComponent((req.url || "/").split("?")[0]);
  const rel = raw === "/" ? "TASK.html" : raw.replace(/^\/+/, "");

  // الحارس: كل مسار يُحلّ ثم يُقارن بالمجلّد. `..` أو مسار مطلق يخرج منه = 403.
  const target = path.resolve(HERE, rel);
  if (!target.startsWith(HERE + path.sep) && target !== HERE) {
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    return res.end("403 — خارج مجلّد اللوحات");
  }

  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    return res.end(`404 — ${rel}`);
  }

  res.writeHead(200, {
    "content-type": TYPES[path.extname(target).toLowerCase()] ?? "application/octet-stream",
    // اللوحة تتغيّر عشرات المرّات في الجلسة الواحدة. كاشٌ هنا يعني أن خالد يقرأ نسخة
    // قديمة ويظنّها الجديدة — وهو بالضبط العطل الذي وُجد هذا الخادم ليمنعه.
    "cache-control": "no-store, must-revalidate",
  });
  fs.createReadStream(target).pipe(res);
});

server.listen(PORT, () => {
  const boards = fs.readdirSync(HERE).filter((f) => f.endsWith(".html")).sort();
  console.log(`لوحات مودونتي على http://localhost:${PORT}`);
  boards.forEach((b) => console.log(`  http://localhost:${PORT}/${b}`));
});
