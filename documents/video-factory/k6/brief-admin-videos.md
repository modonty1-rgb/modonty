# Brief for Claude in the MODONTY repo — «الفيديوهات» in admin (VideoJob)

Paste this whole file into a Claude Code session opened in `C:\Users\w2nad\Desktop\dreamToApp\MODONTY`.
Source of truth for every decision: `C:\Users\w2nad\Desktop\k6\modonty-video-prd.html` (read sections 2, 3ب, 4, 5 first).

## Why
A video factory on the Contabo VPS turns each published Modonty article into one regular video + 3 Shorts,
fully automatically. A human only approves, per platform, in the admin. Telegram only alerts "video ready".
YouTube and Modonty reels publish automatically after approval; TikTok and Instagram are posted by hand.

## What to build (admin + shared schema)

1. **Schema — `VideoJob`** (one per article; follow the repo's schema conventions, no db push to production
   without Khalid's word):
   - `articleId`, `clientId`, `status`: `queued | rendering | ready_for_review | needs_attention | done`
   - `assets`: `{ long: {url, seconds}, shorts: [{series, url, seconds}], thumbnail, srt }` (Bunny URLs)
   - `copy`: `{ youtube: {title, description, chapters}, tiktok: {caption, hashtags}, instagram: {caption} }`
   - `platforms`: per platform `{ status: pending|approved|published|rejected, approvedBy, approvedAt, note, ... }`
     - youtube: `videoId`, `shortIds[]` · modonty_reels: `bunnyVideoId` · tiktok / instagram: `postedManuallyAt`
   - `usage`: `{ claude: {inputTokens, outputTokens, seconds}, gemini: {ttsRequests, retries429}, renderSeconds }`
   - `errors: [{ step, message, at }]`, `createdAt`, `updatedAt`

2. **Ingest endpoint for the VPS** — same pattern and secret handling as `/api/idea-bank/*` (`RADAR_INGEST_SECRET`):
   - `POST /api/videos/ingest` → create/update a VideoJob with assets, copy, usage; sets `ready_for_review`
   - `GET  /api/videos/queue?state=approved` → jobs with a platform `approved` but not `published` (the VPS publishes)
   - `PATCH /api/videos/:id/platform` → VPS reports `published` + ids, or an error
   - `POST /api/videos/:id/attention` → VPS reports `needs_attention` with the failing step

3. **Admin page `/videos`** (list + detail), decision-first like the rest of the admin:
   - list: article, client, status, per-platform chips, age
   - detail: play the regular video and each Short; edit title/description/captions; one **Approve** button per
     platform; **Reject with note** (sends it back to the script step); for TikTok/Instagram: **Download file**,
     **Copy caption**, then **Mark posted manually**
   - permission: same roles that manage content today

4. **Modonty reels**: approved Shorts become reels through the existing Bunny direct-upload path (`bunnyVideoId`).

## Out of scope here
The VPS factory itself (fetch → script → voice → render → ingest → publish) — built from the PRD by the k6 session.

## Done when
A test VideoJob posted to `/api/videos/ingest` (dev) shows in `/videos`, approving YouTube flips it into
`/api/videos/queue?state=approved`, and the TikTok row supports download + copy + mark-posted.
