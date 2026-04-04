# Media Page — Improvements Plan

> Audit date: 2026-04-04
> Source: Full code audit of `admin/app/(dashboard)/media/`

---

## UI/UX Design

- [x] **Standardize page header** — title + description with flex layout ✅ Done
- [x] **Redesign stats section** — 4 clean color-coded cards (violet/blue/emerald/amber) ✅ Done
- [x] **Improve grid card design** — usage badge (In Use/Unused), type badge, cleaner overlay ✅ Done
- [x] **Improve list view** — usage badge in type column ✅ Done
- [x] **Redesign upload page** — 3-column grid: preview+SEO left (col-span-2), actions right (sticky) ✅ Done
- [x] **Redesign edit form** — 3-column grid: fields left (col-span-2), preview+SEO+save right (sticky), collapsible sections ✅ Done
- [x] **Fix toolbar spacing** — stacks vertically on mobile, responsive widths, consistent h-9 ✅ Done
- [x] **Improve empty state** — dashed border, icon circle, CTA upload button ✅ Done
- [x] **Color-coded cards** — violet (files), blue (storage), emerald (usage), amber (this month) ✅ Done
- [x] **Consistent typography** — already text-xl across all media pages ✅ Done

---

## Functionality — High Priority

- [x] **Add search input** — backend supports search by filename/alt text but no UI field exists ✅ Done
- [x] **Add pagination** — server-side pagination (20/page) with prev/next controls ✅ Done
- [x] **Show usage indicator** — isUsed derived from _count.featuredArticles, passed to cards ✅ Done
- [x] **Active filter badge** — shows count of active filters on collapsed Filters button ✅ Done

---

## Functionality — Medium Priority

- [x] **Fix error messages** — clear messages with filename + reason, no raw JSON ✅ Done
- [x] **File replacement metadata prompt** — AlertDialog after replace prompts admin to update details ✅ Done
- [x] **Add date range filter** — native date inputs in filters (From/To) with URL persistence ✅ Done
- [x] **Sort persistence in URL** — sort persists in URL params across page reloads ✅ Done
- [x] **Add image dimension info in grid** — already shows width×height in card footer ✅ Already exists

---

## Functionality — Low Priority

- [ ] **Bulk metadata edit** — can bulk delete but can't bulk update alt text or media type
- [ ] **Mobile upload layout** — upload zone + SEO form side-by-side breaks on mobile, need stack layout
- [ ] **Media detail view page** — clicking a file should open a detail page with full metadata, usage, preview
- [ ] **Drag & drop reorder** — no way to organize media order within a client
- [ ] **Cloudinary sync check** — no way to detect files in Cloudinary that don't exist in DB (orphaned)

---

## Not Needed Now (Future Backlog)

- [ ] Auto-tagging with AI image analysis
- [ ] Duplicate image detection
- [ ] Collections/grouping system
- [ ] Media performance analytics
- [ ] Scheduled archival of old unused media
