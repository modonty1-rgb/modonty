---
name: modonty-video
description: >-
  Modonty's fixed video brand and production standard — turns one Modonty
  article into a branded YouTube Short (or the weekly long video) with the same
  look, structure and mandatory elements every time, plus the subscriber and
  reach playbook. Use for any Modonty video work: "اعمل فيديو من المقالة",
  "شورت لمدونتي", "فكرة فيديو اليوم", "ستايل فيديوهات مدونتي", "براندنج
  الفيديو", choosing a format for an article, writing a Short script, checking a
  video before publishing, or planning growth for the @modonty channel.
---

# modonty-video

One article in, **one regular video and three Shorts cut from it** out, and every one is
recognisably Modonty within the first second. The regular video is the anchor (search, subscribers,
embedded in the article); the Shorts are the reach and point back to it. The brand frame never
changes; the format and the content inside it do. That is the whole rule: **same frame, different
show**. How the anchor is built and cut is in `long.md` — read it first for any new article.

The files next to this one are the source of truth. Read the one a step points to; do not work
from memory of them.

| file | holds |
|---|---|
| `long.md` | the regular video: chapters = series, its frame, and the rule for cutting Shorts from it |
| `engine/` | the approved renderer: `fetch_article.py`, `make.py`, `overlay.html`, voice, fonts, example script |
| `brand.json` | colours, fonts, sizes, safe area, timings, assets, sonic logo |
| `formats.md` | the five series, each with its beat sheet and when an article fits it |
| `checklist.md` | the 18 mandatory elements, the pass/fail gate before upload |
| `growth.md` | how Shorts turn into subscribers, and what YouTube actually ranks on |

The `yt-*` skills do the generic YouTube work (`yt-shorts`, `yt-package`, `yt-seo`, `yt-retention`,
`yt-plan`, `yt-comment`). This skill decides what is Modonty about it and overrides them where they
conflict.

## The procedure

### 1. Read the article, take only what it says

Fetch the article. List its facts, numbers, steps, signs and myths, each with the sentence it
came from. **Every claim in the video must trace to that list.** Most Modonty articles are written
for clinics and doctors; a health claim that is not in the approved article is not allowed, however
well known it is. Note the client's name and the doctor's name for the credit line.

### 2. Pick the format from what the article contains

Open `formats.md`. Match by content, not by preference:
signs or symptoms → «٣ علامات» · a common belief the article corrects → «صح ولا خطأ؟» · one
striking number → «رقم يصدمك» · practical steps → «سوّها كذا» · a doctor clip exists → «اسأل
الدكتور». Then apply the rotation rule: never the same series two days running. An article can
feed more than one Short over the weeks, each in a different series.

### 3. Write the script to the timing grammar

Target **25–40 seconds**. A Short people finish beats a longer one they leave; completion and
"viewed vs swiped away" are what the Shorts feed ranks on (see `growth.md`).

| slot | seconds | what happens |
|---|---|---|
| Hook | 0 – 1.5 | spoken line and on-screen line together, **different words**, picture already moving. No logo intro, no greeting, no channel name |
| Promise | 1.5 – 4 | says what is coming and how many: «ثلاث علامات، الثالثة أغلب الناس يتجاهلونها» |
| Body | 4 – T−6 | 2 to 4 beats, 5–8 s each, the picture changes at least every 3 s |
| Call | T−6 – T−1.5 | **one** ask only (see `growth.md` for which) |
| End | last 1.5 s | end card + sonic logo, and the last spoken line leads back into the first |

Voice: Saudi dialect, the way a well-read Saudi friend explains it. Write it for the ear of the
voice engine: tashkeel on the words a TTS misreads, shadda on doubled letters, no hard contractions —
the rules are in `brand.json → audio.script_for_voice`. Short sentences; captions break cleanly too. Write five hooks, score them
with `yt-script/hookscore.py` only once it has an Arabic version (the shipped one scores Arabic
near zero — use judgement until then), keep the best.

### 4. Build to the brand frame

Everything in `brand.json`. The non-negotiables, so they are not missed:

- Navy `#0E065A` dominates. Blue `#3030FF` for emphasis boxes. Teal `#00D8D8` is a single thin
  touch (progress line, underline). Never a fourth colour.
- Tajawal for all Arabic text. Captions 2–3 words per line, Tajawal 800, white with navy stroke.
- Co-brand lockup top-right on every frame: Modonty icon, a thin divider, then the client's logo as a
  rounded tile (from the article's JSON-LD `logo`). The end card carries both large with a teal ×.
- The article's own images, never generic AI imagery. Card with rounded corners over a blurred,
  darkened copy of the same image.
- Series tag pill under the logo on every body frame, so a returning viewer knows the show.
- Credit line in the body: client or doctor name with the Modonty trust shield.
- Same end card and same sonic logo every time. Background music changes per video, from the
  YouTube Audio Library.

Technical rule learned the hard way: **never put a colour override in the middle of an Arabic
caption line** (`{\c...}` in ASS). libass splits the line into runs and orders them left-to-right,
which scrambles the words. Emphasis goes on its own line or in a box behind the whole line.

### 4b. Render with the engine — the approved template (16 Oct 2026)

`engine/` is the production renderer Khalid approved. Never rebuild the look by hand; run it.

```bash
mkdir work/<slug> && cp -r ~/.claude/skills/modonty-video/engine/. work/<slug>/ && cd work/<slug>
python fetch_article.py <article-url>   # article.txt · img/N.webp · assets/client-logo.png · article.json
# write script.json from article.txt (shape: engine/example-script.json — chapters → beats, shorts → cuts)
python make.py all                      # out/modonty-video.mp4 · out/short-*.mp4 · out/thumbnail.png
```

- **Voice:** Gemini designed Saudi voice `voice_kq9fd6jmhzqc` (details in `brand.json → audio.voice`).
  Each beat is voiced once and cached by text hash; edit one beat and only that beat is re-voiced.
- **Captions:** Gemini returns no word timings, so captions align to the pauses in the audio
  (`silencedetect`) phrase by phrase, words spread by length inside. Break lines at punctuation.
- **Graphics:** `overlay.html` rendered to transparent PNGs by headless Chrome — this is what makes
  Arabic shaping exact. ffmpeg composes background, image card, overlay, captions, progress line.
- **Beat kinds** in `script.json`: hook · img · reveal · list · chapter · quiz · number · cta · end.
- A full run (2–4 min regular video + two Shorts) takes about 20 minutes on the laptop.
- **Few images:** some articles have one image (the CBC article had one). Then lean on the opaque
  beats (chapter, quiz, number) to keep the picture changing every few seconds.

### 5. Package

Run `yt-package` on title + thumbnail text, `yt-seo` for the description. Title carries the series
name: «٣ علامات | …». Description: first two lines answer the question, then the article link with
`?utm_source=youtube&utm_medium=shorts&utm_campaign=<series>`, then the client credit.

### 6. Gate

Go through `checklist.md`. Any **must** item failing means it does not upload. Upload is always
**private**; a person publishes. Tick YouTube's "altered or synthetic content" box when the voice
is synthetic.

### 7. After publishing — the growth actions

Each one is in `growth.md`: set the Related Video to the week's long video, pin the comment
question, send the file to the client to repost, post to Modonty's WhatsApp and Telegram channels,
reply to the best comment with a Short.

## What to hand back

The format chosen and why (one line) · the script with timings and on-screen text per beat ·
title, thumbnail text, description · the checklist with every item marked · the one growth action
that matters most for this Short.
