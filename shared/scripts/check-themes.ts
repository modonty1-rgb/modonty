/**
 * Check every registered partner-site theme before it reaches a visitor (THEMES.md §3).
 *
 *   cd shared && npx tsx scripts/check-themes.ts
 *
 * Fails (exit 1) when a theme: has a duplicate key or no folder; misses a page; has a block without
 * key/name/isEmpty/Component or two blocks with one key on a page; points its default header/footer
 * at a shape it does not have; offers a setting whose default is not one of its options; leaves a
 * look token empty; or has a version that is not x.y.z. Read-only — touches no database.
 */
import fs from "node:fs";
import path from "node:path";

import { PARTNER_PAGE_KEYS, THEMES, DEFAULT_THEME_KEY } from "../components/partner-site/theme";

const problems: string[] = [];
const root = path.join(__dirname, "..", "components", "partner-site");

const keys = THEMES.map((t) => t.key);
if (new Set(keys).size !== keys.length) problems.push(`duplicate theme keys: ${keys.join(", ")}`);
if (!keys.includes(DEFAULT_THEME_KEY)) problems.push(`the default theme «${DEFAULT_THEME_KEY}» is not registered`);

for (const theme of THEMES) {
  const at = `theme «${theme.key}»`;
  if (!fs.existsSync(path.join(root, theme.key, "theme.ts"))) problems.push(`${at}: no folder ${theme.key}/theme.ts`);
  if (!/^\d+\.\d+\.\d+$/.test(theme.version)) problems.push(`${at}: version «${theme.version}» is not x.y.z`);
  if (!theme.name.trim()) problems.push(`${at}: empty name`);

  for (const [token, value] of Object.entries(theme.tokens)) if (!String(value).trim()) problems.push(`${at}: token ${token} is empty`);

  for (const page of PARTNER_PAGE_KEYS) {
    const blocks = theme.pages[page];
    if (!blocks) { problems.push(`${at}: page «${page}» missing`); continue; }
    const seen = new Set<string>();
    for (const b of blocks) {
      if (!b.key || !b.name || typeof b.isEmpty !== "function" || !b.Component) problems.push(`${at}/${page}: block «${b.key ?? "?"}» incomplete`);
      if (seen.has(b.key)) problems.push(`${at}/${page}: block key «${b.key}» twice`);
      seen.add(b.key);
    }
  }

  if (!theme.headers.some((h) => h.key === theme.defaultHeader)) problems.push(`${at}: defaultHeader «${theme.defaultHeader}» not in headers`);
  if (!theme.footers.some((f) => f.key === theme.defaultFooter)) problems.push(`${at}: defaultFooter «${theme.defaultFooter}» not in footers`);

  for (const s of theme.settings) {
    if (s.type === "choice" && !s.options.some((o) => o.value === s.default)) problems.push(`${at}: setting «${s.key}» default «${s.default}» not in its options`);
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`✓ ${THEMES.length} theme(s) OK: ${THEMES.map((t) => `${t.key}@${t.version} (${PARTNER_PAGE_KEYS.length} pages, ${t.headers.length} headers, ${t.footers.length} footers)`).join(" · ")}`);
