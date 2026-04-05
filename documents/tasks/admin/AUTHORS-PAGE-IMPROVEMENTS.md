# Authors Page — Improvements Plan

> Audit date: 2026-04-05
> Source: Full code audit of `admin/app/(dashboard)/authors/`

---

## Bugs — Must Fix

- [x] **Image deletion before validation** — moved authorId check before image operations ✅ Done
- [x] **Frontend social links not rendered** — now renders author.linkedIn/twitter/facebook from DB before platform links ✅ Done
- [x] **No Zod validation in update action** — added Zod schema validation ✅ Done
- [x] **Missing frontend revalidation** — added revalidatePath("/articles") + auto JSON-LD regeneration for all author's articles ✅ Done

---

## UI/UX — High Priority

- [x] **Page padding** — added `px-6 py-6` ✅ Done
- [x] **Header typography** — `text-xl` + `text-xs` subtitle ✅ Done
- [x] **HTML checkbox → shadcn Checkbox** — uses Checkbox component now ✅ Done
- [x] **Credentials hint** — added "One credential per line" hint ✅ Done
- [x] **Expertise/MemberOf hints** — added clear comma-separated examples ✅ Done
- [x] **Jargon replaced** — "E-E-A-T Information" → "Expertise & Trust", "Verification Status" → "Verified Expert", "Member Of" → "Organizations" ✅ Done
- [x] **Social links in 3-column grid** — LinkedIn/Twitter/Facebook side by side ✅ Done
- [x] **Removed wrapper Card** — form has its own cards, no double wrapper ✅ Done
- [ ] **No social image form field** — schema supports `socialImage` but admin has no way to set it

---

## UI/UX — Medium Priority

- [ ] **Stats not displayed** — `archivedArticles` and `eetatSignalsCount` computed but never shown in stats cards
- [ ] **No "View Profile" on frontend** — button links to `https://modonty.com` not an actual author page
- [ ] **No character counters on SEO fields** — bio has counter but SEO title/description may not
- [ ] **No help tooltips** — E-E-A-T and SEO concepts not explained for non-technical admin

---

## Dead Code — Cleanup

- [x] **`create-author.ts`** — deleted, removed from exports ✅ Done
- [ ] **Unused schema fields** — `firstName`, `lastName`, `worksFor`, `qualifications`, `education` never used (keep in schema, no form needed)
- [ ] **Unused SEO cache fields** — `nextjsMetadata`, etc. never used (keep in schema for future)
- [x] **`archivedArticles` stat** — removed from action and component ✅ Done
- [x] **`eetatSignalsCount` stat** — removed from action and component ✅ Done
- [x] **Unnecessary useEffect** — removed slug reset useEffect ✅ Done

---

## SEO — Improvements

- [ ] **No frontend author profile page** — no `/authors/modonty` page with standalone Person JSON-LD
- [ ] **Author social links not in frontend** — linkedIn/twitter/facebook fetched from DB but not rendered in article sidebar
- [ ] **No author page in sitemap** — no author URL in `modonty/app/sitemap.ts`

---

## Frontend Impact

- [ ] **Fix social links rendering** — use `author.linkedIn` etc. from DB instead of env vars in `article-author-bio.tsx`
- [ ] **Add frontend revalidation** — `update-author.ts` should revalidate article pages showing author data

---

## Not Needed Now (Future Backlog)

- [ ] Author activity log / last edited timestamp
- [ ] Multiple authors support
- [ ] Author performance analytics (views per author)
- [ ] Author page with full portfolio
