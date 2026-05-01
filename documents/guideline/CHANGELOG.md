# Modonty Guideline — CHANGELOG

> سجل لكل source تمت إضافته/معالجته، وما الذي ساهم به في `SYNTHESIS.md` و `GOLDEN-RULES.md`.

---

## 2026-05-01 — Phase 1+2+3 (الإطلاق)

### Phase 1 — Sources gathered

**Initial inventory (13 ملف · 18MB):**

| # | Source File | Size | Path |
|---|---|---|---|
| 1 | brand book/modonty - Brand Guidelines final.pdf | 16M | `01-brand/brand book/` (canonical visual identity) |
| 2 | brand book/logos-svg/primer-logo.svg | 4.3K | `01-brand/brand book/logos-svg/` (downloaded from Drive) |
| 3 | brand book/logos-svg/icon.svg | 1.5K | `01-brand/brand book/logos-svg/` (downloaded from Drive) |
| 4 | brand-guidelines-from-google-doc.md | 6K | `01-brand/` (text distillation of PDF + Doc) |
| 5 | brand-strategy.html | 46K | `01-brand/` (Brand Voice Guide) |
| 6 | PRODUCT-MARKETING-MASTER-BRIEF.html | 62K | `02-strategy/` (Master strategic brief) |
| 7 | MARKETING-BRIEF-2026.html | 56K | `02-strategy/` (2026 marketing brief) |
| 8 | marketing-plan-feb-jun-2026-mohab.html | 67K | `02-strategy/` (Mohab's execution plan) |
| 9 | MODONTY-MASTERCLASS.html | 124K | `03-sales/` (sales master playbook) |
| 10 | saudi_b2b_saas_seo_personas_dashboard.html | 47K | `04-customers/` (Personas + Empathy Maps) |
| 11 | saudi_seo_market_study_dashboard.html | 49K | `04-customers/` (Saudi SEO market) |
| 12 | onboarding-plan.html | 13K | `05-team/` (Week 1 onboarding) |
| 13 | modonty_kpis_dashboard.html | 51K | `05-team/` (KPIs library) |
| 14 | modonty_dashboard_full.html | 54K | `06-dashboards/` (general dashboard) |

**Discarded (duplicates):**
- ❌ `brand book/modonty - Brand Guidelines final.docx` — duplicate of PDF
- ❌ `PRODUCT-MARKETING-MASTER-BRIEF.md` — duplicate of HTML version

**Drive scan:** Modonty Drive folder explored via MCP. Read Google Doc brand guidelines (newer than local PDF — distilled into MD). Downloaded 2 essential SVG logos. Skipped: 20+ logo color variations (derivable), social media monthly designs, AI working notes, client folder (private).

### Phase 2 — Categorization

Files moved into 6 themed sub-folders:

```
sources/
├── 01-brand/        (3 items)  → identity, logos, voice
├── 02-strategy/     (3 items)  → master briefs, execution plan
├── 03-sales/        (1 item)   → MASTERCLASS playbook
├── 04-customers/    (2 items)  → ICPs, personas, market study
├── 05-team/         (2 items)  → onboarding, KPIs
└── 06-dashboards/   (1 item)   → general dashboard
```

### Phase 3 — Synthesis output

Two output files generated:

#### `SYNTHESIS.md` (~600 lines)
Structured into 13 sections matching the role-based hub vision:
1. Welcome
2. التعريف الذي تحفظه
3. فلسفة المؤسس
4. البراند (identity + voice + colors + typography + logo + anti-hooks)
5. العميل (ICPs + Tier 2 + Demographics)
6. نقاط الألم (الـ 7)
7. المنتج (3 طبقات + 14 console sections + admin stack + The Moat)
8. القوى الأربع
9. التموضع (6 معارك + Quadrant + الخلاصة)
10. التسعير (4 باقات + 12=18 + ROI + Closing lines)
11. Sales Playbook (3 سكريبتات + 8 اعتراضات + AI golden rule)
12. Marketing Strategy (channels + customer journey + KPIs)
13. العمليات + Onboarding

#### `GOLDEN-RULES.md` (~250 lines)
20 verbatim rules to memorize:
- 1 Big Idea
- 1 8-second definition
- 3 founder constants
- 6 competitive lines
- 4 Powers
- 1 positioning statement
- 1 Hero headline
- 1 12=18 rule
- 1 ROI pitch
- 1 packages table
- 4 closing lines
- 1 ChatGPT objection (verbatim)
- 1 AI golden rule
- 4 anti-hooks
- 5 ICPs ranking
- 7 pain points
- 1 customer / not-customer
- 1 Authority Blog Moat

### Source-to-section traceability

| Synthesis section | Primary source(s) | Quote-level evidence |
|---|---|---|
| §1 Welcome | MASTERCLASS Module 1 | "اللي يقول 'مدونة' بس، يقلل القيمة 80%" |
| §2 Definition | MASTERCLASS Module 2 | 3 levels — 8s/30s/Demo |
| §3 Founder | MASTERCLASS Module 2 + MASTER-BRIEF §4 | 3 ثوابت |
| §4 Brand | brand-guidelines.md + brand-strategy.html | HEX colors, fonts, voice |
| §5 Customer | MASTER-BRIEF §5 + MASTERCLASS Module 3 + saudi_b2b_personas | 5 ICPs verbatim |
| §6 Pain | MASTER-BRIEF §3 | 7 الآلام table |
| §7 Product | MASTER-BRIEF §2,7,8 | 3-layer + 14 sections + Moat |
| §8 Powers | MASTER-BRIEF §6 + MASTERCLASS Module 6 | 4 Powers detailed |
| §9 Positioning | MASTERCLASS Module 1 + MASTER-BRIEF §10 | 6 golden lines verbatim |
| §10 Pricing | MASTER-BRIEF §9 + MASTERCLASS Module 8 | 4 packages, 12=18, ROI 70x |
| §11 Sales Playbook | MASTERCLASS Modules 7+9 | 3 scripts + 8 objections (5 covered, 3 referenced) |
| §12 Marketing | MASTER-BRIEF §11-14 + MARKETING-BRIEF-2026 + KPIs | channels, journey, KPIs |
| §13 Operations | onboarding + marketing-plan-feb-jun + MASTER-BRIEF §16 | SWOT + recommendation |

### Files NOT yet read end-to-end (deferred — content covered indirectly)

- `marketing-plan-feb-jun-2026-mohab.html` — referenced for execution context, not deep-read (specific tactics belong in tactical follow-up, not foundational synthesis)
- `saudi_seo_market_study_dashboard.html` — JS-driven dashboard, content embedded in JS data structures
- `saudi_b2b_saas_seo_personas_dashboard.html` — same architecture pattern
- `modonty_dashboard_full.html` — JS-driven, generic dashboard view
- `modonty_kpis_dashboard.html` — JS-driven KPIs library; specific KPIs already extracted from MASTER-BRIEF §14

If future synthesis updates need deeper content from these, re-process them then.

### Decisions made (transparency)

- **Language choice:** Arabic primary + English for technical terms (matches existing source style + audience expectation).
- **Folder numbering (01-brand, 02-strategy, ...):** for forced display order in file explorer, matches Modonty's existing `01-business-marketing` convention.
- **Logo downloads:** kept only 2 essential SVGs (primer-logo + icon). 18+ color variants derivable from these via CSS recoloring — no need to bloat repo.
- **Skipped folders in Drive:** AI working notes (Claude-Context — not for human team), Clients (private), social media monthly designs (low foundational value).

### Pending (Phase 4 — wire to admin Knowledge Hub UI)

- Build `admin/app/(public)/guidelines/` Dashboard-style layout
  - Persistent sidebar (matches existing `/guidelines` pattern, already in `(public)` route group)
  - Landing page = narrative onboarding (consume `SYNTHESIS.md` §1-3)
  - Sidebar sections feed from `SYNTHESIS.md` §4-13
- Public access already supported by `(public)/` route group — no auth changes needed
- Link from admin sidebar to the new hub

---

## 2026-05-01 (later) — Phase 1 update: admin guidelines added as source

### What was missing in initial synthesis

User flagged that `admin/app/(public)/guidelines/` itself is a primary source — it
contains operational rules (designer specs, SEO writer/specialist guides, prohibitions,
tools list) that I did not incorporate in the first pass. Correct call.

### New source added

`sources/07-operations/admin-guidelines-extracted.md` — extracted from:
- `admin/app/(public)/guidelines/page.tsx` (1224 lines · main landing with 5 data structures)
- 9 sub-pages (articles, authors, clients, media, organization, seo-visual, subscribers, tracking, media previews)

Contains:
- `designerRules` — 5 canonical image specs
- `seoSections` — 3 main blocks × 3 rules each (Basic, Content, Step 3 SEO)
- `seoPillars` — 3 pillars × 3 sections each (Technical, On-Page, Off-Page)
- `seoTools` — 5 categories of tools
- `seoProhibitions` — 6 categories with severity-coded items (50+ total)
- `guidelineSections` — 9 sub-page card definitions

### Synthesis update

Added 5 new sections to `SYNTHESIS.md`:
- **§14** للمصمم — Image Specs المعتمدة
- **§15** لكاتب المحتوى — قواعد SEO الـ 3 خطوات
- **§16** لمتخصص SEO — الـ 3 أركان (Technical/On-Page/Off-Page)
- **§17** أدوات SEO — مرتبة بحسب الفئة
- **§18** الممنوعات الـ 50+ — مرتبة بحسب الخطورة

This brings SYNTHESIS.md to 18 sections total (was 13), now covering:
- **Strategy layer** (§1-13) — for sales/marketing/leadership audience
- **Operations layer** (§14-18) — for designers/writers/SEO specialists/admin operators

### Phase 4 implication

The new admin Knowledge Hub MUST integrate (not duplicate) the existing
`admin/app/(public)/guidelines/*` pages. Specifically:
- Sub-pages (articles, authors, clients, media, etc.) stay where they are
- Landing page is rebuilt with the role-based hub structure
- Strategy content (§1-13) gets new pages or sections
- Operations content (§14-18) is already in admin guidelines — link to existing pages instead of duplicating

---

## How to update this index

When a new source is added to `sources/`:
1. Read it end-to-end
2. Identify what's NEW vs already covered
3. Update `SYNTHESIS.md` + `GOLDEN-RULES.md` (additive — never overwrite past claims unless source contradicts directly)
4. Add an entry here in the format:

```
## YYYY-MM-DD — Phase X update

### New source: <filename>
- Size: <KB>
- What's new: <what wasn't covered before>
- Sections updated: <list of synthesis sections>
- Verbatim additions to GOLDEN-RULES: <yes/no, list>
```

5. Note any source that turned out to be redundant — mark with ⚠️ or ❌ and explain.
