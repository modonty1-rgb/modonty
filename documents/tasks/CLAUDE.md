# CLAUDE — Live Test Observation Log

> **Purpose:** This file is maintained by Claude (the AI agent) during every live test session.
> When simulating a real user (client) navigating the admin or public site, any UX/QA issue
> spotted — whether visual, functional, logical, or a best-practice violation — is automatically
> recorded here, without waiting to be asked.
>
> **Rule:** Observe → Record here → Add to MASTER-TODO for triage and fix.
> This file is the raw log. MASTER-TODO is the prioritized backlog.

---

## Core Rule — Live Test Protocol

During any live test session:
- Act as the real client/user, not as a developer
- If something looks wrong, feels wrong, or violates UX best practices → log it immediately
- Do NOT wait to be asked — automatic observation is mandatory
- Every entry gets a severity: 🔴 HIGH | 🟡 MEDIUM | 🟢 LOW
- After the session, entries move to MASTER-TODO for review

---

## Session: 2026-04-10 — Admin Live Test (Featured Image Test + Media Survey)

### OBS-001 🟡 MEDIUM — Media picker search not reactive
- **Where:** Article editor → Content tab → "Select Featured Image" dialog
- **What:** Typing in the search box does not filter results. The input is React-controlled
  but direct DOM events don't trigger re-render. User types but nothing changes visually.
- **Expected:** Results filter as user types (debounced search)
- **File suspect:** Article editor media picker component (media section)

### OBS-002 🟡 MEDIUM — Media edit form has no "Client" field
- **Where:** `/media/[id]/edit`
- **What:** Once an image is uploaded under a client, there is no way to reassign it to
  a different client via the edit form. The client is shown in the breadcrumb only (read-only).
- **Expected:** A "Client" dropdown in the edit form to allow reassignment
- **Impact:** If an image is uploaded under the wrong client, it cannot be corrected without
  deleting and re-uploading. The article editor media picker filters by client, so a misassigned
  image is permanently inaccessible from the wrong article.

### OBS-003 🔴 HIGH — Article editor Featured Image preview is cropped (object-cover)
- **Where:** Article editor → Content tab → Featured Image preview
- **File:** `admin/components/shared/thumbnail-image-view.tsx:161`
- **What:** Preview uses `object-cover` inside a fixed aspect container → wide images crop
- **Fix:** Change to `object-contain` (1-line fix, already in MASTER-TODO)

### OBS-004 🟡 MEDIUM — Test image uploaded to wrong client automatically
- **Where:** Media Library global upload
- **What:** Uploaded `test-1920x1080.jpg` from the global Media page (no client selected).
  Image was auto-assigned to "عيادات بلسم الطبية" instead of being "unassigned" or "General".
- **Expected:** Either a mandatory client selector during upload, or images without a client
  should appear in ALL client media pickers under a "General" pool
- **Impact:** Uploading an image globally doesn't make it universally accessible per article

### OBS-005 🟢 LOW — Media edit page: Preview image shows without clear aspect ratio context
- **Where:** `/media/[id]/edit` — Preview panel on right side
- **What:** The preview image renders correctly (object-contain working), but there's no
  visual indicator of the image's aspect ratio or whether it's suitable for article use
- **Suggestion:** Show aspect ratio label + suitability hint (e.g. "✓ Suitable for article cover")

### OBS-006 🔴 HIGH — Article editor Featured Image preview: CONFIRMED CROPPED (object-cover)
- **Where:** Article editor → Content tab → Featured Image preview section
- **File:** `admin/components/shared/thumbnail-image-view.tsx:161`
- **What:** Tested with img3.png (1351×351, ~4:1 wide ratio). In the edit preview, the image
  fills a 16:9 container with `object-cover` — heavily cropping the sides. The admin cannot
  see what the final published image will look like.
- **Admin detail view:** Different component — shows image with white frame, appears less cropped
- **Fix:** Line 161: `object-cover` → `object-contain` + `bg-muted` background
- **Status:** ✅ CONFIRMED by live test 2026-04-10

### OBS-007 🟡 MEDIUM — Article detail page in admin: image frame is large with white background
- **Where:** `/articles/[id]` — the read-only article detail/preview page in admin
- **What:** The featured image preview uses a large white-background frame container. The image
  renders inside it but the frame is not proportional to the image. Looks unpolished for an
  "admin preview" of the article.
- **Suggestion:** Use a cleaner preview container that matches how the article looks on modonty.com

---

## Pending — Move to MASTER-TODO

- [ ] OBS-001 → Media picker search doesn't filter
- [ ] OBS-002 → Media edit: add Client reassignment field
- [ ] OBS-004 → Media upload: clarify client assignment flow
- [ ] OBS-005 → Media edit: aspect ratio indicator in preview
> OBS-003 already in MASTER-TODO

