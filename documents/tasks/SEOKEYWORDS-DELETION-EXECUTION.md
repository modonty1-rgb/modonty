# 🗑️ seoKeywords Deletion — Execution Checklist

**Status:** 🟡 Ready to execute · awaiting Khalid's "go ahead"
**Last Updated:** 2026-05-21 (Senior re-review — 4 missed spots added)
**Reasoning:** Verified zero SEO/AI value (4 independent sources) · zero modonty/console usage
**Estimated work time:** ~50 minutes including verification
**Risk level:** 🟢 LOW (employees off-shift, ~600 public users isolated from this change)

> **Use this file as a working checklist.** Tick each `[ ]` as you complete it.
> When a phase finishes, run the **TSC checkpoint** before moving to the next phase.

---

## 🧠 Senior Re-Review — Missed Items Added

The first draft missed these 4 spots — added in this revision:

- ✅ Added — `seo-step.tsx:64` — remove orphan `keywordInput` useState (only used by deleted block)
- ✅ Added — `seo-step.tsx:297` — update SectionHeader description (drop "الكلمات المفتاحية" mention)
- ✅ Added — `seo-step.tsx:349` — remove `<div className="border-t" />` separator (orphan after Keywords block deleted)
- ✅ Added — `ai-article-dialog.tsx:118` — update error message text (drop "SEO Keywords tab" reference)
- ✅ Added — `ai-article-dialog.tsx:242` — remove sentence "If keywords exist in the SEO Keywords tab, they will be auto-filled here"

**Total additions:** 5 spots across 2 files (all small UI text/state cleanups, zero new risk).

---

## ☑️ Phase 0 — Pre-Execution Safety

- [ ] **0.1** Backup DB: `bash scripts/backup.sh`
- [ ] **0.2** Confirm `admin/.env.local` is missing or commented → uses `modonty_dev` from `.env.shared`
- [ ] **0.3** Kill all node processes: `taskkill //F //IM node.exe` (Windows) — per Prisma rule
- [ ] **0.4** Record current commit hash for rollback (run `git log -1 --oneline` and note here): `__________`
- [ ] **0.5** No employees in admin? (confirmed by Khalid 2026-05-21 — off-shift)

---

## ☑️ Phase 1 — Prisma Schema + Generate

### File 1/16: `dataLayer/prisma/schema/schema.prisma`

- [ ] **1.1** Open `dataLayer/prisma/schema/schema.prisma`
- [ ] **1.2** Locate lines 866-867:
  ```prisma
    // SEO keywords the article is based on (reference)
    seoKeywords String[] @default([])
  ```
- [ ] **1.3** Delete both lines (comment + field)
- [ ] **1.4** Verify the surrounding `semanticKeywords Json?` field (line 861) is **NOT** touched
- [ ] **1.5** Save file

### Generate Prisma client

- [ ] **1.6** Run from repo root: `pnpm prisma:generate` (or via filter)
- [ ] **1.7** Confirm output: zero errors, types regenerated
- [ ] **1.8** Spot-check: open `node_modules/.prisma/client/index.d.ts` → search for `seoKeywords` → should be **zero matches**

### Restart dev servers

- [ ] **1.9** Start admin dev: `cd admin && pnpm dev` (background)
- [ ] **1.10** Wait for "Ready in..." message

### ✅ TSC Checkpoint 1
- [ ] **1.11** `cd admin && pnpm tsc --noEmit` → must show **zero errors** OR show expected errors in the files we're about to edit (acceptable)

---

## ☑️ Phase 2 — Delete Orphan Files

### File 2/16: `admin/.../components/sections/keywords-section.tsx`

- [ ] **2.1** Confirm orphan: `grep -r "from.*keywords-section" admin/` should show only `keywords-step.tsx`
- [ ] **2.2** Delete: `rm admin/app/(dashboard)/articles/components/sections/keywords-section.tsx`

### File 3/16: `admin/.../components/steps/keywords-step.tsx`

- [ ] **3.1** Confirm orphan: `grep -r "KeywordsStep\|keywords-step" admin/` should show only its own file
- [ ] **3.2** Delete: `rm admin/app/(dashboard)/articles/components/steps/keywords-step.tsx`

### ✅ TSC Checkpoint 2
- [ ] **3.3** `cd admin && pnpm tsc --noEmit` → must show zero new errors

---

## ☑️ Phase 3 — Server Actions, Schema, Types, State, Helpers (10 files)

### File 4/16: `admin/.../mutations/create-article.ts`

- [ ] **4.1** Open file, navigate to line ~155
- [ ] **4.2** Delete the line: `seoKeywords: data.seoKeywords ?? [],`
- [ ] **4.3** Verify surrounding `semanticKeywords` lines (~151-153) **untouched**

### File 5/16: `admin/.../mutations/update-article.ts`

- [ ] **5.1** Open file, navigate to line ~226
- [ ] **5.2** Delete the line: `seoKeywords: data.seoKeywords ?? [],`
- [ ] **5.3** Verify surrounding `semanticKeywords` lines (~222-224) **untouched**

### File 6/16: `admin/.../article-server-schema.ts`

- [ ] **6.1** Open file, navigate to line 28
- [ ] **6.2** Delete the line: `seoKeywords: z.array(z.string()).optional(),`

### File 7/16: `admin/lib/types/form-types.ts`

- [ ] **7.1** Open file, navigate to line 115
- [ ] **7.2** Delete the line: `seoKeywords?: string[];`

### File 8/16: `admin/.../article-form-context.tsx`

- [ ] **8.1** Open file, navigate to line 208 (initial formData state)
- [ ] **8.2** Delete the line: `seoKeywords: [],`

### File 9/16: `admin/.../transform-article-to-form-data.ts`

- [ ] **9.1** Open file, navigate to line 111
- [ ] **9.2** Delete the line: `seoKeywords: article.seoKeywords ?? [],`

### File 10/16: `admin/.../step-validation-helpers/step-configs.ts`

- [ ] **10.1** Open file, navigate to lines 38-43 (the SEO step config)
- [ ] **10.2** Edit description (line 40):
  - BEFORE: `description: "SEO title, description, keywords, and semantic keywords",`
  - AFTER: `description: "SEO title, description, and semantic keywords",`
- [ ] **10.3** Edit optionalFields (line 42):
  - BEFORE: `optionalFields: ["metaRobots", "seoKeywords", "semanticKeywords"],`
  - AFTER: `optionalFields: ["metaRobots", "semanticKeywords"],`

### File 11/16: `admin/.../step-validation-helpers/field-labels.ts`

- [ ] **11.1** Open file, navigate to line 29
- [ ] **11.2** Delete the entry: `seoKeywords: "كلمات مفتاحية",`

### File 12/16: `admin/.../helpers/generate-test-data.ts`

- [ ] **12.1** Open file, navigate to lines 141-151
- [ ] **12.2** Delete the entire `seoKeywords` array block (comment + array + slice):
  ```ts
    // SEO keywords
    const seoKeywords = [
      'كلمة مفتاحية رئيسية',
      'تحسين محركات البحث',
      ...
    ].slice(0, Math.floor(Math.random() * 4) + 5);
  ```
- [ ] **12.3** Navigate to line 249 (return object)
- [ ] **12.4** Delete the line: `seoKeywords,`

### ✅ TSC Checkpoint 3
- [ ] **12.5** `cd admin && pnpm tsc --noEmit` → must show zero errors

---

## ☑️ Phase 4 — UI Components (3 files — most careful work)

### File 13/16: `admin/.../components/steps/seo-step.tsx` ⚠️ HEAVIEST FILE

**Spot 1 — Line 64 (orphan state after UI removal):**
- [ ] **13.1** Delete the line: `const [keywordInput, setKeywordInput] = useState('');`

**Spot 2 — Line 93 (state read):**
- [ ] **13.2** Delete the line: `const keywords = formData.seoKeywords ?? [];`

**Spot 3 — Lines 96-112 (callbacks):**
- [ ] **13.3** Delete the entire `addKeyword` useCallback (lines 96-102)
- [ ] **13.4** Delete the entire `removeKeyword` useCallback (lines 104-112)

**Spot 4 — Lines 297 (SectionHeader description):**
- [ ] **13.5** Update SectionHeader description:
  - BEFORE: `description="الكلمات المفتاحية ومصادر E-E-A-T الموثوقة"`
  - AFTER: `description="مصادر E-E-A-T الموثوقة"`
- [ ] **13.6** Also consider updating the section title if it says "كلمات ومصادر" → change to "مصادر E-E-A-T" (or similar)

**Spot 5 — Lines 300-347 (Keywords UI block):**
- [ ] **13.7** Delete the entire block starting `{/* Keywords */}` (line 300) through the closing `</div>` of the Keywords section (line 347)

**Spot 6 — Line 349 (orphan separator):**
- [ ] **13.8** Delete the line: `<div className="border-t" />` (now redundant since Keywords no longer separates from Citations)

**Spot 7 — Verify imports:**
- [ ] **13.9** Check unused imports — but **DO NOT remove `Plus` or `X`** (still used in Citations block at lines 372-385+)
- [ ] **13.10** Let TSC tell us if anything is genuinely unused

---

### File 14/16: `admin/.../[id]/technical/page.tsx`

**Spot 1 — Lines 178-185 (display block):**
- [ ] **14.1** Open file, navigate to line 178
- [ ] **14.2** Delete the entire conditional block:
  ```tsx
              {a.seoKeywords && a.seoKeywords.length > 0 && (
                <div>
                  <Label>SEO Keywords</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {a.seoKeywords.map((k: string) => (
                      <Badge key={k} variant="outline">{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
  ```
- [ ] **14.3** Verify surrounding `semanticKeywords` display block (lines 188+) **untouched**

---

### File 15/16: `admin/.../components/ai-article-dialog.tsx` ⚠️ 6 SPOTS

**Spot 1 — Lines 71-75 (useEffect pre-fill):**
- [ ] **15.1** Delete the entire useEffect:
  ```ts
    useEffect(() => {
      if (open) {
        setKeywords((formData.seoKeywords ?? []).join(', '));
      }
    }, [open]);
  ```

**Spot 2 — Line 115 (handleGenerate fallback):**
- [ ] **15.2** Find:
  ```ts
      const fromForm = (formData.seoKeywords ?? []).join(', ').trim();
      const keywordsToUse = keywords.trim() || fromForm;
  ```
- [ ] **15.3** Replace with:
  ```ts
      const keywordsToUse = keywords.trim();
  ```

**Spot 3 — Line 118 (error message text — NEW):**
- [ ] **15.4** Find: `setError('Please enter keywords in the "SEO Keywords" tab or here');`
- [ ] **15.5** Replace with: `setError('Please enter keywords');`

**Spot 4 — Line 168 (handleConfirm — writing to formData):**
- [ ] **15.6** Delete the line: `seoKeywords: generatedData.keywords ?? [],` (inside `updateFields({...})`)

**Spot 5 — Line 230-233 (onOpenAutoFocus):**
- [ ] **15.7** Delete the entire `onOpenAutoFocus` prop:
  ```tsx
          onOpenAutoFocus={() => {
            const fromForm = (formData.seoKeywords ?? []).join(', ');
            setKeywords(fromForm);
          }}
  ```

**Spot 6 — Line 242 (DialogDescription text — NEW):**
- [ ] **15.8** Find and delete this sentence: `If keywords exist in the "SEO Keywords" tab, they will be auto-filled here.`
- [ ] **15.9** Keep the first sentence intact: `Enter keywords and choose article length to generate professional content ready to publish.`

**Spot 7 — Lines 394-403 (Keywords preview block):**
- [ ] **15.10** Delete the entire block:
  ```tsx
                  <div className="space-y-2">
                    <Label>Keywords</Label>
                    <div className="flex flex-wrap gap-2">
                      {generatedData.keywords?.map((keyword: string, index: number) => (
                        <Badge key={index} variant="outline">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
  ```

**Spot 8 — Line 439 (button disabled condition):**
- [ ] **15.11** Find: `(!keywords.trim() && !(formData.seoKeywords ?? []).join(', ').trim()) || isGenerating`
- [ ] **15.12** Replace with: `!keywords.trim() || isGenerating`

### ✅ TSC Checkpoint 4
- [ ] **15.13** `cd admin && pnpm tsc --noEmit` → must show **zero errors**

---

## ☑️ Phase 5 — Final Verification Scan

- [ ] **16.1** Re-grep source code only (excluding `.md` files):
  ```
  grep -rn "seoKeywords" admin/app admin/lib admin/components admin/scripts dataLayer/prisma 2>&1 | grep -v "\.md:"
  ```
  Expected: **zero matches**

- [ ] **16.2** Re-grep for orphan refs:
  ```
  grep -rn "KeywordsStep\|KeywordsSection\|keywords-section\|keywords-step" admin/ 2>&1 | grep -v "\.md:"
  ```
  Expected: **zero matches**

- [ ] **16.3** Final TSC on **all 3 apps** (must all be zero):
  - [ ] `cd admin && pnpm tsc --noEmit` → zero
  - [ ] `cd modonty && pnpm tsc --noEmit` → zero
  - [ ] `cd console && pnpm tsc --noEmit` → zero

---

## ☑️ Phase 6 — Live Test (Playwright)

- [ ] **17.1** Open `http://localhost:3000` (admin dev — port may be 3000 or 3001)
- [ ] **17.2** Login as admin (autofilled credentials)
- [ ] **17.3** Navigate to article edit: `/articles/69f78c38732bb6673fcc2914/edit`
- [ ] **17.4** Click SEO tab → verify **NO "SEO Keywords" UI section** visible
- [ ] **17.5** Section "كلمات ومصادر" now shows ONLY Citations + Extract button (no Keywords above)
- [ ] **17.6** Edit SEO Title → click "تحديث" save button
- [ ] **17.7** Verify success: toast appears, no Prisma error, no console error
- [ ] **17.8** Verify in DB: article saved (use Prisma Studio or quick query)
- [ ] **17.9** Open AI Dialog (lookup button — usually in Content tab)
- [ ] **17.10** Type test keywords like "تجريب seoKeywords removal" → click Generate
- [ ] **17.11** Wait for generation → confirm preview opens
- [ ] **17.12** Click Confirm → form should populate (title, content, excerpt, FAQs)
- [ ] **17.13** Verify NO error about missing seoKeywords field
- [ ] **17.14** Navigate to `/articles/[id]/technical`
- [ ] **17.15** Verify NO "SEO Keywords" display block

---

## ☑️ Phase 7 — Pre-Push Hygiene

- [ ] **18.1** Capture verification screenshots (SEO tab + technical page + AI dialog)
- [ ] **18.2** Run final backup: `bash scripts/backup.sh`
- [ ] **18.3** Bump `admin/package.json` version: 0.57.4 → **0.58.0**
- [ ] **18.4** Add changelog entry in `admin/scripts/add-changelog.ts`:
  - Type: `fix` or `chore`
  - Version: `0.58.0 (admin)`
  - Summary: "Removed seoKeywords field (zero SEO/AI value — verified) — cleaner UI"
- [ ] **18.5** Run changelog sync: `cd admin && pnpm tsx scripts/add-changelog.ts`
- [ ] **18.6** Update `documents/context/SESSION-LOG.md` with this session
- [ ] **18.7** Verify `.claude/settings.json` has NO API keys before commit
- [ ] **18.8** Verify `git status` — only expected files modified

---

## ☑️ Phase 8 — Commit + Push (REQUIRES KHALID'S EXPLICIT "PUSH")

- [ ] **19.1** Stage only changed files (no `git add -A`):
  ```
  git add dataLayer/prisma/schema/schema.prisma
  git add admin/package.json admin/scripts/add-changelog.ts
  git add admin/app/(dashboard)/articles/ admin/lib/types/form-types.ts
  git add documents/
  ```
- [ ] **19.2** Verify what's staged: `git status`
- [ ] **19.3** Compose commit message
- [ ] **19.4** ⛔ **STOP** — wait for Khalid's explicit "push" word
- [ ] **19.5** Once Khalid says push: `git commit` then `git push origin main`
- [ ] **19.6** Monitor Vercel deployment for both admin + modonty (should both succeed independently)

---

## 📋 Files Touched Summary

| # | File | Action | Lines |
|---|---|---|---|
| 1 | `dataLayer/prisma/schema/schema.prisma` | Edit | 866-867 |
| 2 | `admin/.../sections/keywords-section.tsx` | DELETE | full file |
| 3 | `admin/.../steps/keywords-step.tsx` | DELETE | full file |
| 4 | `admin/.../mutations/create-article.ts` | Edit | 155 |
| 5 | `admin/.../mutations/update-article.ts` | Edit | 226 |
| 6 | `admin/.../article-server-schema.ts` | Edit | 28 |
| 7 | `admin/lib/types/form-types.ts` | Edit | 115 |
| 8 | `admin/.../article-form-context.tsx` | Edit | 208 |
| 9 | `admin/.../transform-article-to-form-data.ts` | Edit | 111 |
| 10 | `admin/.../step-validation-helpers/step-configs.ts` | Edit | 38-43 |
| 11 | `admin/.../step-validation-helpers/field-labels.ts` | Edit | 29 |
| 12 | `admin/.../helpers/generate-test-data.ts` | Edit | 141-151, 249 |
| 13 | `admin/.../components/steps/seo-step.tsx` | Edit | 64, 93, 96-112, 297, 300-349 |
| 14 | `admin/.../[id]/technical/page.tsx` | Edit | 178-185 |
| 15 | `admin/.../components/ai-article-dialog.tsx` | Edit | 71-75, 115, 118, 168, 230-233, 242, 394-403, 439 |
| 16 | `admin/package.json` | Bump version | n/a |
| 17 | `admin/scripts/add-changelog.ts` | Add entry | n/a |
| 18 | `documents/context/SESSION-LOG.md` | Add session | n/a |

**Total source code changes:** 15 files (2 deleted, 13 edited)
**Total Prisma schema changes:** 1 (Article model)
**Total functions modified:** 8 (`createArticle`, `updateArticle`, `transformArticleToFormData`, `generateTestData`, `SEOStep`, `TechnicalArticlePage`, `AiArticleDialog`, `articleServerSchema`)

---

## 🚨 Rollback Triggers

- **TSC fails after Phase 4** → `git checkout .` (local-only, no production impact)
- **Playwright test fails at Phase 6** → `git checkout .` and investigate
- **Vercel build fails after push** → Vercel keeps previous version live · `git revert <commit>` then push
- **Post-push issue discovered in admin (unlikely)** → `git revert <commit>` immediately

---

## ✅ Sign-off

- [ ] Phase 0 complete (safety prep)
- [ ] Phase 1 complete (Prisma + generate)
- [ ] Phase 2 complete (orphan deletes)
- [ ] Phase 3 complete (server/types/state)
- [ ] Phase 4 complete (UI)
- [ ] Phase 5 complete (verification scan)
- [ ] Phase 6 complete (Playwright live test)
- [ ] Phase 7 complete (pre-push hygiene)
- [ ] Phase 8 complete (commit + push)

**Final result expected:** Zero `seoKeywords` references in source code · TSC zero on all 3 apps · admin SEO tab cleaner · AI dialog works · zero impact on modonty.com · zero impact on console · zero impact on ~600 public users.
