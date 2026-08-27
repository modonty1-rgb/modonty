/**
 * Guard for SEOADM-GATE-RULES-2 — every validation rule must carry its ORIGIN.
 *
 * The card's finding: rules invented by us were being presented to the admin as Google
 * requirements. The fix is never "delete the rule" — a product policy is legitimate — it is
 * that the rule must name where it came from, and a rule with NO source must go or drop to a
 * non-blocking warning.
 *
 * Fails when:
 *  1. the 51-char SEO title cap credits Google with a title length limit (Google sets none),
 *     or the cap itself has been weakened (the gate must stay closed)
 *  2. `Missing WebSite node` is pushed as an error regardless of page, contradicting Google's
 *     "The WebSite structured data must be on the home page of the site"
 *  3. the unverified "mandatory from 2026" postal-code claim is still asserted anywhere
 *  4. the Saudi region list rejects the Arabic spelling of a region
 *
 * Run it yourself:  cd admin && ./node_modules/.bin/tsx scripts/_guard-gate-rules-2.ts
 * Exit 0 = green. Untracked on purpose — it is a verification command, not shipped code.
 */
import { readFileSync } from "node:fs";

const ROOT = "C:/Users/w2nad/Desktop/dreamToApp/MODONTY";
const FILES = {
  articleValidation: `${ROOT}/admin/app/(dashboard)/articles/helpers/article-validation.ts`,
  clientServer: `${ROOT}/admin/app/(dashboard)/clients/actions/clients-actions/client-server-schema.ts`,
  clientForm: `${ROOT}/admin/app/(dashboard)/clients/helpers/client-form-schema.ts`,
  pageSchema: `${ROOT}/admin/app/(dashboard)/modonty/setting/helpers/page-schema.ts`,
  seoSection: `${ROOT}/admin/app/(dashboard)/clients/components/form-sections/seo-section.tsx`,
  pageForm: `${ROOT}/admin/app/(dashboard)/modonty/setting/components/page-form.tsx`,
  ar: `${ROOT}/admin/lib/messages/ar.ts`,
  en: `${ROOT}/admin/lib/messages/en.ts`,
  jsonldValidator: `${ROOT}/admin/app/(dashboard)/modonty/setting/helpers/modonty-jsonld-validator.ts`,
  validatorsAdvanced: `${ROOT}/admin/app/(dashboard)/clients/helpers/client-seo-config/validators-advanced.ts`,
};

const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);
const read = (p: string) => readFileSync(p, "utf8");

// ---------- 1. the 51-char title cap: stays blocking, stops blaming Google ----------
// Google, Title links: "While there's no limit on how long a <title> element can be, the title
// link is truncated in Google Search results as needed, typically to fit the device width."
// https://developers.google.com/search/docs/appearance/title-link
const TITLE_CAP_FILES = [
  FILES.articleValidation,
  FILES.clientServer,
  FILES.clientForm,
  FILES.pageSchema,
] as const;

const FALSE_ATTRIBUTION = [
  "العنوان النهائي في جوجل",
  "final title in Google",
  "final Google title",
];

for (const file of [...TITLE_CAP_FILES, FILES.seoSection, FILES.pageForm, FILES.ar, FILES.en]) {
  const src = read(file);
  for (const phrase of FALSE_ATTRIBUTION) {
    if (src.includes(phrase)) {
      fail(`${file.split("/").pop()}: still credits Google with a title length limit ("${phrase}") — Google sets none`);
    }
  }
}

// The gate must NOT have been opened to satisfy the audit.
const capSites = TITLE_CAP_FILES.flatMap((file) => {
  const src = read(file);
  return [...src.matchAll(/\.max\(\s*51\s*,/g)].map(() => file);
});
if (capSites.length < 5) {
  fail(`the 51-char cap must stay blocking in all 5 schema sites — found ${capSites.length}. Rewrite the MESSAGE, never the limit`);
}

// Each site must state where 51 came from.
for (const file of TITLE_CAP_FILES) {
  const src = read(file);
  if (!/MODONTY POLICY, not Google/.test(src)) {
    fail(`${file.split("/").pop()}: the 51-char cap does not name its origin ("MODONTY POLICY, not Google")`);
  }
  if (!/developers\.google\.com\/search\/docs\/appearance\/title-link/.test(src)) {
    fail(`${file.split("/").pop()}: the 51-char cap cites no source URL for the Google claim it corrects`);
  }
}

// ---------- 2. WebSite node: home page only ----------
// Google, Site names: "The WebSite structured data must be on the home page of the site."
// https://developers.google.com/search/docs/appearance/site-names
const validator = read(FILES.jsonldValidator);
if (/if\s*\(\s*!hasWebSite\s*\)\s*errors\.push/.test(validator)) {
  fail("modonty-jsonld-validator.ts still errors on a missing WebSite node for EVERY page — Google requires it on the home page only");
}
if (!/isHomePageGraph/.test(validator)) {
  fail("modonty-jsonld-validator.ts has no home-page detection — it cannot scope the WebSite rule the way Google scopes it");
}
if (!/developers\.google\.com\/search\/docs\/appearance\/site-names/.test(validator)) {
  fail("modonty-jsonld-validator.ts cites no source for the WebSite placement rule");
}

// Runtime: the rule must behave differently on a home graph vs a list graph.
const SITE = "https://www.modonty.com";
const orgNode = { "@type": "Organization", "@id": `${SITE}/#organization`, url: SITE };
const websiteNode = { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE };
const homeGraph = {
  "@graph": [orgNode, websiteNode, { "@type": "CollectionPage", "@id": `${SITE}/#collectionpage`, url: SITE }],
};
const homeGraphNoWebSite = {
  "@graph": [orgNode, { "@type": "CollectionPage", "@id": `${SITE}/#collectionpage`, url: SITE }],
};
const listGraphWithWebSite = {
  "@graph": [orgNode, websiteNode, { "@type": "CollectionPage", "@id": `${SITE}/articles#collectionpage`, url: `${SITE}/articles` }],
};
const listGraphNoWebSite = {
  "@graph": [orgNode, { "@type": "CollectionPage", "@id": `${SITE}/articles#collectionpage`, url: `${SITE}/articles` }],
};

type CustomReport = { errors: string[]; warnings: string[] };

async function checkRuntime() {
  const mod = (await import(
    "../app/(dashboard)/modonty/setting/helpers/modonty-jsonld-validator"
  )) as Record<string, unknown>;
  const run = mod.validateHomeOrListPageBusinessRules as
    | ((j: object) => CustomReport)
    | undefined;
  if (typeof run !== "function") {
    fail("modonty-jsonld-validator.ts does not export `validateHomeOrListPageBusinessRules` — the rule is untestable");
    return;
  }

  const listNo = run(listGraphNoWebSite);
  if (listNo.errors.some((e) => /Missing WebSite/.test(e))) {
    fail("RUNTIME: a LIST page with no WebSite node still raises an error — Google says WebSite belongs on the home page only");
  }

  const homeNo = run(homeGraphNoWebSite);
  if (!homeNo.errors.some((e) => /Missing WebSite/.test(e))) {
    fail("RUNTIME: the HOME page with no WebSite node raises no error — the gate was opened, not scoped");
  }

  const listWith = run(listGraphWithWebSite);
  if (!listWith.warnings.some((w) => /WebSite node on a non-home page/.test(w))) {
    fail("RUNTIME: a LIST page CARRYING a WebSite node is not flagged — that is the actual Google violation");
  }
  if (listWith.errors.some((e) => /WebSite/.test(e))) {
    fail("RUNTIME: a LIST page carrying a WebSite node is BLOCKED — it should warn, so the emitters can be corrected");
  }

  const home = run(homeGraph);
  if (home.errors.some((e) => /WebSite/.test(e)) || home.warnings.some((w) => /WebSite/.test(w))) {
    fail("RUNTIME: a correct HOME graph (Org + WebSite + CollectionPage) is not clean on the WebSite rule");
  }
}

// ---------- 3. the unverified "mandatory from 2026" postal claim ----------
// No official source makes a 9-digit postal code mandatory for this field. The real 2026
// deadline is the Transport General Authority's parcel/courier National-Address mandate,
// which is not an SEO rule and does not govern this input.
for (const file of [FILES.validatorsAdvanced, FILES.ar, FILES.en]) {
  const src = read(file);
  // Skip the comment line that records the removal; only an ASSERTED claim fails.
  const asserted = src
    .split(/\r?\n/)
    .filter((line) => !/^\s*(\/\/|\*)/.test(line))
    .join("\n");
  if (/mandatory from 2026|إلزامي من 2026/.test(asserted)) {
    fail(`${file.split("/").pop()}: still asserts the unsourced "mandatory from 2026" postal-code claim`);
  }
}

const advanced = read(FILES.validatorsAdvanced);
if (!/SAUDI POST \(SPL\) National Address — NOT Google/.test(advanced)) {
  fail("validators-advanced.ts: the postal-code rule does not name its origin (Saudi Post, not Google)");
}

// ---------- 4. Saudi regions: Arabic spelling must be accepted ----------
if (!/normalizeRegionName/.test(advanced)) {
  fail("validators-advanced.ts: no region-name normalisation — Arabic spellings are still rejected");
}
for (const arabic of ["الرياض", "مكة المكرمة", "المدينة المنورة", "المنطقة الشرقية", "القصيم", "عسير", "تبوك", "حائل", "الحدود الشمالية", "جازان", "نجران", "الباحة", "الجوف"]) {
  if (!advanced.includes(arabic)) {
    fail(`validators-advanced.ts: Saudi region "${arabic}" has no Arabic spelling — an Arabic-first partner is scored down for a correct answer`);
  }
}
if (!/MODONTY POLICY \(data quality\), not Google/.test(advanced)) {
  fail("validators-advanced.ts: the region rule does not name its origin");
}

async function checkAddressRules() {
  const mod = (await import(
    "../app/(dashboard)/clients/helpers/client-seo-config/validators-advanced"
  )) as Record<string, unknown>;

  type Result = { status: string; message: string; score: number };
  type Validator = (value: unknown, data: Record<string, unknown>) => Result;

  const region = mod.validateAddressRegion as Validator | undefined;
  const national = mod.validateNationalAddress as Validator | undefined;
  if (typeof region !== "function" || typeof national !== "function") {
    fail("validators-advanced.ts no longer exports validateAddressRegion / validateNationalAddress");
    return;
  }

  // Rule 4 — the Arabic spelling of every region must score as valid, exactly like the English.
  const ARABIC_REGIONS = [
    "الرياض", "مكة المكرمة", "المدينة المنورة", "المنطقة الشرقية", "القصيم",
    "عسير", "تبوك", "حائل", "الحدود الشمالية", "جازان", "نجران", "الباحة", "الجوف",
  ];
  for (const name of ARABIC_REGIONS) {
    const r = region(name, { addressRegion: name, addressCountry: "SA" });
    if (r.status !== "good") {
      fail(`RUNTIME: Saudi region "${name}" scored "${r.status}" — an Arabic-first partner is penalised for a correct answer`);
    }
  }
  // English must not have regressed.
  const en = region("Riyadh", { addressRegion: "Riyadh", addressCountry: "SA" });
  if (en.status !== "good") fail(`RUNTIME: English region "Riyadh" scored "${en.status}" — regression`);
  // A real non-region must still be caught, and only as a warning.
  const bogus = region("Atlantis", { addressRegion: "Atlantis", addressCountry: "SA" });
  if (bogus.status !== "warning") {
    fail(`RUNTIME: a bogus region scored "${bogus.status}" — the check must still catch it, as a warning`);
  }

  // Rule 3 — the postal-code rule stays advisory and no longer asserts the 2026 mandate.
  const five = national("", { addressCountry: "SA", addressPostalCode: "12345" });
  if (five.status === "error") {
    fail("RUNTIME: a 5-digit postal code now BLOCKS — this rule only scores, it must never block a save");
  }
  if (/mandatory from 2026/.test(five.message)) {
    fail("RUNTIME: the 5-digit postal message still asserts the unsourced 2026 mandate");
  }
  if (!/not a Google or SEO requirement/.test(five.message)) {
    fail("RUNTIME: the 5-digit postal message does not disclaim the Google/SEO attribution");
  }
}

Promise.all([checkRuntime(), checkAddressRules()]).then(() => {
  if (failures.length > 0) {
    console.error(`FAIL: ${failures.length} unattributed / falsely-attributed rule(s)`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log("PASS: the 51-char cap still blocks but names itself MODONTY POLICY; WebSite is required on the home page only (per Google); the unsourced 2026 postal claim is gone; Arabic region names are accepted");
  process.exit(0);
});
