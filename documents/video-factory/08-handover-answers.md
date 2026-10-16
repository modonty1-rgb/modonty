> نسخة التسليم النهائي من أحمد (١٦ أكتوبر ٢٠٢٦، بعد تثبيت المرحلة ٠ على كونتابو). الأصل: `documents/video-factory/k6/handover-answers.md`.

# Video factory — handover answers (Ahmad → Khalid + MODONTY session)

Answers to `MODONTY/documents/video-factory/07-handover.md`, same numbers. Names and locations only, no secrets.
**ready** = exists and was run · **partial** = exists, part not run · **open** = known gap, not built.
Last update: 16 Oct 2026, after phase 0 was installed on the VPS (Khalid's direct «نعم» in the Ahmad session).
Single code original: `MODONTY/automation/video-factory/` (D19). The skill's `engine/` is NOT edited after handover.

## H1 — Server access · ready
- Host `84.46.245.226` (Contabo Cloud VPS 10, Ubuntu 24.04.4, 4 vCPU, 7.8 GB RAM), user `root`, SSH key only
  (password login disabled 13 Oct 2026). Private key on Khalid's laptop `C:\Users\w2nad\.ssh\modonty-vps\contabo_vps`;
  public key stored in the Contabo panel as `claude-modonty-vps`. Emergency: VNC from the Contabo panel.
- `ssh -i ~/.ssh/modonty-vps/contabo_vps root@84.46.245.226` · source: `MODONTY/documents/context/credentials/infrastructure.md`.

## H2 — `/opt/video-factory` map · ready
| path | what |
|---|---|
| `src/` | copy of `automation/video-factory` (code, `skill/`, `fonts/`, `Dockerfile`, `deploy/`) — the image is built from here |
| `.env` (600) | secrets + switches, names in `src/deploy/env.example` (H7) |
| `secrets/` (700) | `youtube_oauth_client.json`, `youtube_token.json` (600) — mounted into the container at `/root/.modonty-video` |
| `factory.sqlite` | job queue (H5) |
| `work/<id>/` | one folder per article: inputs, `build/`, `out/`, `qa.json`, `copy.json`, `ingest.result.json` (`<id>` = sha1(slug)[:12], same as the Bunny folder) |
| `publish/` | `publish_state.json` of the YouTube publisher |
| `logs/` | `watch.log`, `work.log`, `publish.log` |
Image `vf-factory` (1.49 GB, `python:3.12-slim` + ffmpeg + chromium + Pillow + the code). Cron file `/etc/cron.d/video-factory`.

## H3 — Source of truth and deploy · ready
- Original: `MODONTY/automation/video-factory/`. Not committed — git is Khalid's decision.
- Deploy an edit: pack the folder and copy it to `/opt/video-factory/src/`, then rebuild:
```
# on Khalid's laptop (Git Bash), from MODONTY/automation/video-factory:
tar --force-local --exclude=__pycache__ -czf /tmp/vf-src.tgz .
scp -i ~/.ssh/modonty-vps/contabo_vps /tmp/vf-src.tgz root@84.46.245.226:/opt/video-factory/vf-src.tgz
# on the server:
tar -xzf /opt/video-factory/vf-src.tgz -C /opt/video-factory/src && bash /opt/video-factory/src/deploy/install.sh
```
`install.sh` is idempotent: it rebuilds the image and rewrites the cron file; data, `.env` and `secrets/` stay.

## H4 — Modules · ready unless marked
Every step runs inside the container, in `work/<id>/` (a copy of the code). One command on the server:
`R="docker run --rm --cpus 2 --memory 3g --env-file /opt/video-factory/.env -v /opt/video-factory:/data -v /opt/video-factory/secrets:/root/.modonty-video vf-factory"`
| M | file | in → out | status | known failures / notes |
|---|---|---|---|---|
| M1 fetch | `fetch_article.py <url>` | page → `article.txt article.json img/N.webp assets/client-logo.png` | ready (4 articles, Windows + Linux 3 s) | images sit before `<h1>`: slice up to «اقرأ أيضاً» |
| M2+M3 script | `write_script.py` | M1 + `skill/` rules → `script.json script.check.json usage.json` | ready on the API (MODONTY session: CBC ok in 95 s) | Claude **API** with `ANTHROPIC_API_KEY` (D21/D23) — the factory key is not created yet, so `--work` prints «waiting for keys»; retries 4× on 429/5xx/529 |
| M4 voice | `make.py` (`prevoice`) | beat texts → `build/voice-gemini/<md5>.wav` + timings | ready | Gemini Tier 1: 10 RPM / 100 RPD → ~6 sentences per request, 6.5 s gap, backoff, cache |
| M5 voice check | `experiment.py → voice_check()` | audio → transcript → word match | partial (0.77 / 0.94 / 0.95) | signal only, not a gate |
| M6 render | `make.py all` | → `out/modonty-video.mp4 out/short-*.mp4 out/thumbnail.png build/long_captions.srt` | ready (Windows; Linux 1519 s for CBC at 2 CPUs) | scenes joined in chunks of 6 (`JOIN_CHUNK`): one 33-input xfade was OOM-killed at 3 GB on Linux; no colour override mid-line in Arabic captions (libass) |
| M7 QA | `factory.py → qa()` | `out/` → `qa.json` | ready (basic) | checks files, long 120–360 s, 3 shorts 20–45 s, thumbnail. Visual checks (logo, safe area) not automated — open |
| M8 package | `package.py` | → `copy.json` (YouTube title/description/chapters/tags, TikTok, Instagram) | ready | readable Arabic article link (MODONTY session); tags from the script's `tags` |
| M9 ingest | `ingest.py --admin <url> --prefix <folder> --revision n` · `--attention …` | Bunny `modonty-reels-media/<prefix>/<id>/rev-<n>/` + `POST /api/videos/ingest` | ready on dev (handoff A) | **off on the server** (`INGEST_ENABLED=0`) until the admin side is in production |
| M10 Telegram | `factory.py → alert()` | text → `sendMessage` | code ready, **off** (`TELEGRAM_ENABLED=0`) | destination: separate session with Khalid; would use `TELEGRAM_BOT_TOKEN` + `TELEGRAM_VIDEO_CHAT_ID`. `TELEGRAM_ADMIN_CHAT_ID` in `.env.shared` is Khalid's private chat, not a group |
| M11 approval | admin `/videos` | — | MODONTY session | — |
| M12 YouTube | `publish_youtube.py --admin <url> [--job id] [--go-public]` · `youtube_auth.py [--check]` | approved queue → YouTube | ready (handoff B: youtu.be/WOpMBP_JL98) · **off on the server** (`PUBLISH_ENABLED=0`) | always sends the full `status` (videos.update deletes omitted fields), `containsSyntheticMedia`, `hasPaidProductPlacement`, tags; custom thumbnail works since the channel's phone verification |
| M13 reels | admin | — | MODONTY session | — |
| M14 embed | — | — | open (phase 3) | — |

M12 order: upload private → re-read `queue?state=approved` → still there: public, then `PATCH published` → gone: stay private.
On `409 not-approved`: `status=published` = done; anything else = do not publish.

## H5 — `factory.sqlite` · ready
`jobs(id, url, status, step, attempts, error, step_seconds, admin_id, created_at, updated_at)` + `meta(k, v)`.
status: `queued → running → ready_local` (ingest off) `| ingested` (ingest on) · `needs_attention` (a step failed twice) · `skipped`.
```
$R --status                         # last 40 jobs
$R --add <article-url>              # queue one article (backfill by hand)
$R --retry <id> [--from fetch|script|render|package|qa|ingest]
$R --skip <id>
docker run --rm -v /opt/video-factory:/data --entrypoint python vf-factory -c "import sqlite3;print(sqlite3.connect('/data/factory.sqlite').execute('select * from jobs where id=?',('<id>',)).fetchall())"
```
First `--watch` marks the feed's existing articles `skipped` (no flood); `WATCH_BACKFILL=1` before the first watch queues them instead.

## H6 — Scheduling · ready
`/etc/cron.d/video-factory` (Asia/Riyadh): watch `5 * * * *` · work `*/15 * * * *` (one article per run, `nice -n 10`) ·
publish `*/5 * * * *`. Each line wrapped in `flock -n /tmp/vf-<name>.lock`. Container limits: `--cpus 2 --memory 3g`.
- **Stop everything:** `rm /etc/cron.d/video-factory` (or comment its lines). **Start again:** `bash /opt/video-factory/src/deploy/install.sh`.
- Daily cap `MAX_PER_DAY=6` (Gemini 100 requests/day ≈ 10 per article).

## H7 — Secrets and settings (names only) · ready
`/opt/video-factory/.env` (600):
| name | source | renewed by |
|---|---|---|
| `GEMINI_API_KEY` | AI Studio project **modonty**, Tier 1 (copied from `MODONTY/console/.env.local` line 9) | Khalid |
| `ANTHROPIC_API_KEY` | **empty** — new factory-only key (D23) from the Anthropic console | Khalid |
| `RADAR_ADMIN_URL`, `RADAR_INGEST_SECRET` | copied from `/opt/content-radar/.env` lines 6–7 (same as admin on Vercel) | as today |
| `BUNNY_STORAGE_HOSTNAME`, `BUNNY_REELS_STORAGE_ZONE_NAME`, `BUNNY_REELS_STORAGE_PASSWORD`, `BUNNY_REELS_PULL_ZONE_HOSTNAME` | `MODONTY/.env.shared` lines 279, 294, 295, 297 | as today |
| `BUNNY_PREFIX=video-factory` · `INGEST_ENABLED=0` · `PUBLISH_ENABLED=0` · `TELEGRAM_ENABLED=0` · `WATCH_BACKFILL=0` · `MAX_PER_DAY=6` | switches | the team |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_VIDEO_CHAT_ID` | empty — Telegram session pending | Khalid |
`/opt/video-factory/secrets/`: `youtube_oauth_client.json` (OAuth client **modonty-video-factory**, Desktop, project modonty) ·
`youtube_token.json` (scopes youtube.upload + youtube.force-ssl). Laptop copies: `~/.modonty-video/`.

## H8 — Periodic renewals · ready
- Gemini voice `voice_kq9fd6jmhzqc`: 1-year TTL from last use → `python gemini_voice.py recreate`, put the new id in `make.py` `VOICE_ID`.
- YouTube token: no expiry while the app is In production and used; re-run `youtube_auth.py` on the laptop if revoked, copy the new token to `secrets/`.
- Anthropic / Gemini keys: rotate in their consoles, edit `.env`, no rebuild needed.

## H9 — Limits and capacity · ready
- YouTube Data API: 100 uploads/day (own bucket). Gemini TTS Tier 1: 10 RPM, 100 RPD → ~10 articles/day by voice.
- Render on the VPS (2 CPUs): ~25 min per article (CBC: 1519 s for the regular video + 3 Shorts). With work every 15 min and
  one article per run → ~40–50 articles/day by CPU; the binding limits are Gemini (≈10) and `MAX_PER_DAY` (6).
- Claude per article (phase B, Opus 5.5): 126–204 s, 14–19k output tokens, ~$0.61–0.74 at API prices (now real API cost, D21).

## H10 — Where to change things · ready
`skill/brand.json` (colours, sizes, voice rules) · `overlay.html` (frame) · `skill/formats.md` (series) · `skill/long.md`
(regular video + cut rule) · `write_script.py` (prompt, validation) · `make.py` (`VOICE_ID`, `JOIN_CHUNK`, timings) ·
`package.py` (titles, descriptions, tags) · `factory.py` (schedule logic, QA thresholds) · `deploy/` (image, cron).

## H11 — Redo / skip / delete · ready
`$R --retry <id> --from script` (rewrite script, voice cache keeps unchanged sentences) · `--from render` · `$R --skip <id>`.
Delete an article's files: remove `/opt/video-factory/work/<id>/` and its row (`--skip` keeps the row so watch never re-adds it).
On Bunny: delete `modonty-reels-media/<prefix>/<id>/` in the Bunny panel.

## H12 — Monitoring · partial
- `tail -f /opt/video-factory/logs/work.log` · `$R --status` · `docker ps --filter ancestor=vf-factory` (a running job).
- Stalled factory = `work.log` silent for > 30 min while jobs are `queued`, or a `running` row older than 2 h (container killed).
- Telegram alerts (`needs_attention`, «video ready»): built, off until the Telegram session.

## H13 — Costs · ready
Bunny corporate (fixed) · Contabo (existing; +1.5 GB image, ~40 MB per article in `work/`) · YouTube free ·
Claude API ~$0.6–0.75 per article (factory key, D23) · Gemini Tier 1 per request (billing on project modonty; AI Studio shows a
banner asking to switch the billing account to prepay — Khalid).

## H14 — Rebuild from zero · ready
On a fresh Ubuntu server with Docker:
1. `mkdir -p /opt/video-factory/src` and copy the code (H3 commands).
2. Create `/opt/video-factory/.env` from `src/deploy/env.example` (chmod 600) — values from the sources in H7.
3. `mkdir -m 700 /opt/video-factory/secrets` and copy `youtube_oauth_client.json` + `youtube_token.json` (chmod 600) from the laptop `~/.modonty-video/`.
4. `bash /opt/video-factory/src/deploy/install.sh` (builds `vf-factory`, writes `/etc/cron.d/video-factory`).
5. Verify: `$R --watch` · `$R --status` · `$R --work` · `docker run --rm --env-file /opt/video-factory/.env -v /opt/video-factory/secrets:/root/.modonty-video --entrypoint python vf-factory /engine/youtube_auth.py --check`.
Installed on the host by phase 0: only `/opt/video-factory`, image `vf-factory` (+ base `python:3.12-slim`), `/etc/cron.d/video-factory`. No packages.

## H15 — Run on Khalid's laptop · ready
```
mkdir work\<slug> ; copy MODONTY\automation\video-factory\* into it ; cd work\<slug>
python fetch_article.py <article-url>
python write_script.py        # needs ANTHROPIC_API_KEY
python make.py all
python package.py
```
Needs Python 3.12 + Pillow, ffmpeg (full build with libass/harfbuzz/fribidi), Google Chrome; keys from env or the repo env files (`config.py`).

## H16 — Known traps · ready
1. libass colour override mid-line in Arabic → scrambled words. Plain lines only.
2. Gemini TTS 10 RPM / 100 RPD → grouped voicing, gap, backoff, cache.
3. Gemini gives no word timings → captions align to pauses.
4. Images sit before `<h1>`; one-image articles repeat the same picture (open: vary crops).
5. Never hard-code an image index (thumbnail bug, fixed).
6. One big xfade graph OOMs on Linux → chunked join.
7. `videos.update` deletes omitted fields → always send the full `status`; `privacyStatus` defaults to public if omitted.
8. Voices were chosen by ear (Gemini designed voice) — do not switch without Khalid listening.
9. OAuth app must stay In production (Testing expires tokens in 7 days).
10. Container runs as root → Chrome needs `--no-sandbox` (handled in `config.py`).

## H17 — Documents · ready
Reference: `documents/video-factory/k6/modonty-video-prd.html` (D1–D23). Also there: this file, `brief-admin-videos.md`,
`modonty-video-style.html`, `modonty-youtube-plan.html` (history). Samples on the laptop: `k6/sample-v2/out/`, `k6/experiment-b2/`.

## H18 — Music and the skill · ready (decisions open)
Music: 5 tracks from the YouTube Audio Library («Attribution not required»), downloaded 16 Oct 2026 from Studio of channel
`UCdI9M2wNbK853RQaT5QB_Vg`, in `~/.claude/skills/modonty-video/engine/music/` (~41 MB, not in git, not on the server):
Taking Flight (Blue Deer Studio, 1:46) · Turn In The Sun (Simon Herody, 3:27) · Way Back Home (Simon Herody, 3:41) ·
Pulsar (The Grey Room / Density & Time, 4:08) · Laniakea (The Grey Room / Density & Time, 4:00).
- Licence outside YouTube (TikTok, Instagram, reels) **not verified**. **`make.py` does not mix music yet** — open.
Skill: `SKILL.md` triggers on Modonty video requests; rule files identical to `automation/video-factory/skill/`. After handover
the MODONTY session deletes the skill's `engine/` (keeps `music/` until it moves) — decision recorded.

## Open items (not built / not verified)
1. `ANTHROPIC_API_KEY` for the factory (Khalid) — until then `--work` waits.
2. Admin side to production (after the joint test) → then `INGEST_ENABLED=1`, `RADAR_ADMIN_URL` already set; `PUBLISH_ENABLED=1` when ready.
3. Telegram destination (separate session) → `TELEGRAM_*` + `TELEGRAM_ENABLED=1`.
4. Music mix in `make.py`; licence check outside YouTube.
5. One-image articles: vary the picture (crops / more opaque beats).
6. Regular video shorter than the 4–6 min target (161–211 s measured).
7. Automated visual QA (logos, safe area) — today by eye.
8. Leftover on the VPS: `/root/vf-linux-test/` (code copy + test videos, **no secrets** — the env file was shredded). Deleting it was
   blocked by this session's permissions; remove with `rm -r /root/vf-linux-test`.
