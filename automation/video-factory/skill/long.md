# The regular video — and how Shorts are cut from it

**The model:** one article → one regular video (4–6 min, 1920×1080) → three Shorts cut from it.
The regular video is the anchor: it lives in YouTube and Google search for years, converts
subscribers, and gets embedded in its article. The Shorts are the reach: they find people who have
never heard of Modonty and send them to the anchor through Related Video.

## The anchor's chapters are the five series

Build the video out of series-shaped chapters. Each one is a self-contained Short waiting to be cut.

| order | chapter | series | length |
|---|---|---|---|
| 0 | Hook — the promise of the whole video, no intro, no logo | — | 8–12 s |
| 1 | The belief people hold, corrected | «صح ولا خطأ؟» | 30–40 s |
| 2 | Why it happens | — (context, not cut) | 30–45 s |
| 3 | The number | «رقم يصدمك» | 25–35 s |
| 4 | The signs | «٣ علامات» | 30–40 s |
| 5 | What else it does | — (context) | 30–45 s |
| 6 | What to do | «سوّها كذا» | 30–40 s |
| 7 | When to see a specialist + client credit | «اسأل الدكتور» if a clip exists | 20–30 s |
| 8 | Close — one line, subscribe, next video | — | 8–12 s |

Use only the chapters the article supports. Never pad a chapter with outside facts to fill the shape.

## Regular video frame (1920×1080)

Everything in `brand.json → layout_long`. In short:

- **No intro.** The first 10 s deliver what the title promised. YouTube's own guidance for long
  videos reached from Shorts.
- Blurred, darkened article image fills the frame. Image card on the **left**, text panel on the
  **right** (RTL reading starts right): chapter tag, then the beat's key line, large.
- **Chapter card** between chapters: navy, chapter number in teal, series name, 2–3 s. Same blue
  wipe transition as the Shorts.
- Logo top-right, teal progress line top edge, credit line with the trust shield bottom-right.
- Burned captions bottom-centre, 4–6 words per line, plus an SRT uploaded as the caption track.
- **End card beat** at least 8 s (YouTube end screens run 5–20 s): Modonty content on the right half,
  the left half left clear for the subscribe and next-video elements added in Studio.
- Chapters in the description (`yt-chapters` format: 00:00 first, 3+, 10 s minimum each) using the
  chapter titles.
- Thumbnail: fixed template — navy left half with 3 words max in Tajawal 900, article image right,
  logo corner. Same layout every video so the channel page reads as one show.

## The cut rule — anchor → Shorts

A chapter becomes a Short only if all are true:

1. It is one of the series chapters and makes sense without the rest of the video.
2. After cutting it runs 25–40 s.
3. It gets a **new hook line**, voiced separately — the chapter's own opening assumes context.
4. It ends with the call «الفيديو الكامل من هنا» and its Related Video points at the anchor.
5. It is re-laid-out vertically to the Short frame, not cropped from 16:9.

Three Shorts per anchor. Publish the anchor first; the Shorts follow on the next days, so the
Related Video link exists when they go out.

## Rhythm

Three anchors a week (Sun, Tue, Thu), one Short every day cut from that week's anchors. After six
weeks, compare subscribers per 1,000 views between anchors and Shorts, and views by series; shift
production toward what wins (`growth.md`).
