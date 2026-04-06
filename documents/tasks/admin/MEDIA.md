# Media — Status & Remaining Tasks

> Last Updated: 2026-04-06
> Version: admin v0.9.0

---

## Done ✅

- [x] Header redesign
- [x] Grid redesign with client grouping
- [x] Upload page 3-column grid
- [x] EXIF removal
- [x] Image SEO (alt text, JSON-LD creditText/copyrightHolder)
- [x] Image sitemap
- [x] Search + pagination
- [x] Usage indicator
- [x] Edit form redesign
- [x] Empty state
- [x] Bulk delete removed

---

## Remaining

### 1. Add clientId to Media table
- **Problem**: Images are shared — no ownership per client
- **Fix**: Add `clientId` field to Media model (Prisma schema change)
- **Blocked by**: DESIGNER role implementation
- **Effort**: Medium

### 2. Designer direct upload workflow
- **Problem**: Designer → Drive → Admin → Cloudinary → Media (too many steps)
- **Fix**: Create DESIGNER role with Media-only access. Designer uploads directly
- **Blocked by**: Role system implementation
- **Effort**: Medium (part of Roles feature)

### 3. Authors social image field
- **Problem**: Schema supports `socialImage` but admin has no way to set it
- **Files**: Author form
- **Effort**: Small
