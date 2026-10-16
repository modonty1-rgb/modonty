# عقد الواجهة البرمجية — السيرفر ↔ الأدمن

**الحالة: مقفول — أكّده أحمد ١٦ أكتوبر ٢٠٢٦** (الأجوبة بنصّها في [04-questions.md](04-questions.md)).
أي تغيير بعد اليوم: كل طرف يبلّغ الثاني **قبل** التنفيذ.

| ثابت | القيمة |
|---|---|
| `asset` | `long` · `short-1` · `short-2` · `short-3` — ونفس المفاتيح في `copy` |
| `items.status` | `pending · approved · published · rejected · failed · skipped` |
| `done` | كل البنود `published` أو `skipped` |
| revision جديدة | `rejected` و`approved` غير المنشور ← `pending`؛ `published` يبقى |
| تخزين الملفات | Bunny Storage `modonty-reels-media` (`modonty-reels-media.b-cdn.net`) · `video-factory/<slug>/rev-<n>/…` — يرفعها السيرفر بمفتاح المنطقة |
| 404 `article-not-found` | السيرفر يسجّله وينبّه تليجرام (ما فيه سجل في الأدمن) |

## الأمان والأخطاء

| الحالة | الرد |
|---|---|
| بلا هيدر `x-radar-secret` أو قيمة غلط | `401 { error: "Unauthorized" }` |
| جسم غير صالح | `400 { error: "bad-request", issues: [≤5] }` |
| رابط لا ينحلّ لمقالة منشورة | `404 { error: "article-not-found" }` (F5) |
| revision أقل من الحالية | `409 { error: "stale-revision", current }` (F4) |
| PATCH: السجل غير موجود / البند غير موجود | `404 { error: "job-not-found" }` / `404 { error: "item-not-found" }` |
| PATCH على بند غير `approved` أو `failed` | `409 { error: "not-approved", status }` — ما ينكتب «منشور» على شي ما انعتمد |
| رد `attention` | `{ ok: true, id, url }` |

| `copy.<asset>.youtube.tags[]` | ≤30 وسم، كل وسم ≤100 حرف · يكتبها السكربت (عبارات بحث) ← `package.py` ← تُحفظ وتُعدَّل في الأدمن ← ترجع في `GET /queue?state=approved` ← `snippet.tags` في الرفع (أضافه أحمد، أكّده سند على dev، ١٦ أكتوبر) |

أُضيفت الأربعة الأخيرة وقت البناء (١٦ أكتوبر) وأُبلغ أحمد. وحالة «يحتاج تدخل» ما يمسحها نتيجة نشر — يمسحها ingest جديد أو انتهاء كل البنود.

## ١) `POST /api/videos/ingest`

```json
{
  "articleUrl": "https://www.modonty.com/articles/<slug>",
  "revision": 1,
  "engineVersion": "2026-10-16",
  "voiceId": "voice_kq9fd6jmhzqc",
  "assets": {
    "long":   { "url": "https://…/long.mp4", "seconds": 158.3, "thumbnail": "https://…/thumbnail.png", "srt": "https://…/long.srt" },
    "shorts": [ { "key": "short-1", "series": "رقم يصدمك", "url": "https://…/short-1.mp4", "seconds": 25.2 } ]
  },
  "copy": {
    "long":    { "youtube": { "title": "…", "description": "…", "chapters": "00:00 …" } },
    "short-1": { "youtube": { "title": "…", "description": "…" }, "tiktok": { "caption": "…", "hashtags": ["…"] }, "instagram": { "caption": "…" } }
  },
  "scriptUrl": "https://…/script.json",
  "qa": { "passed": true, "failures": [] },
  "usage": {
    "claude": { "inputTokens": 0, "outputTokens": 0, "seconds": 0 },
    "gemini": { "ttsRequests": 0, "retries429": 0 },
    "stepSeconds": { "fetch": 0, "script": 0, "voice": 0, "render": 0 }
  }
}
```
الرد: `{ "id": "<VideoJob id>", "url": "https://admin.modonty.com/videos/<id>" }`

القواعد: سجل واحد لكل `articleId`. revision جديدة ← البنود `rejected` و`approved` غير المنشور ترجع `pending`، و`published` تبقى. نفس revision ← تحديث آمن. الحالة ← `ready_for_review`.

## ٢) `GET /api/videos/queue?state=approved`

يرجّع youtube فقط (الريلز ينشرها الأدمن، وتيك توك وإنستغرام يدوي):
```json
{ "items": [ { "jobId": "…", "articleUrl": "…", "revision": 1, "asset": "long|short-1|…", "platform": "youtube",
               "file": "<cdn url>", "thumbnail": "<url|null>", "srt": "<url|null>", "copy": { "…النص بعد تعديل الأدمن…": "" } } ] }
```

## ٣) `GET /api/videos/queue?state=rejected`

```json
{ "items": [ { "jobId": "…", "articleUrl": "…", "revision": 1, "asset": "short-2", "platform": "tiktok", "note": "…" } ] }
```

## ٤) `PATCH /api/videos/:id/platform`

```json
{ "asset": "short-1", "platform": "youtube", "status": "published|failed", "externalId": "<ytVideoId>", "url": "https://youtu.be/…", "error": null }
```

## ٥) `POST /api/videos/attention` (بلا :id)

```json
{ "articleUrl": "…", "revision": 1, "step": "fetch|script|voice|render|qa|upload|publish", "message": "…", "attempts": 2 }
```
ينشئ السجل لو ما وُجد (بلا ملفات) أو يحدّثه ← `needs_attention`.

## السجل `VideoJob` — مؤكَّد من أحمد

| الحقل | النوع | ملاحظة |
|---|---|---|
| `articleId` | ObjectId · **unique** | من الرابط |
| `clientId` | ObjectId | من المقالة |
| `articleUrl` | String | كما أرسله السيرفر |
| `status` | `ready_for_review · needs_attention · done` | |
| `revision` · `engineVersion` · `voiceId` · `scriptUrl` | Int · String · String · String | |
| `long` | `{ url, seconds, thumbnail, srt }` اختياري | فارغ في سجل attention قبل أي ingest |
| `shorts` | `[{ key, series, url, seconds }]` | |
| `copy` | لكل `asset` ← `{ youtube, tiktok, instagram }` | يعدّله الأدمن قبل الاعتماد |
| `qa` | `{ passed, failures[] }` | |
| `usage` | `{ claude{inputTokens,outputTokens,seconds}, gemini{ttsRequests,retries429}, stepSeconds{fetch,script,voice,render} }` | |
| `items` | `[{ asset, platform, status, approvedBy, approvedAt, note, externalId, url, postedManuallyAt, error, updatedAt }]` | `status`: `pending · approved · published · rejected · failed · skipped`. long×youtube، وكل شورت × youtube·modonty_reels·tiktok·instagram |
| `errors` | `[{ step, message, attempts, revision, at }]` | |
| `history` | `[{ revision, event, at }]` | |
| `createdAt` · `updatedAt` | DateTime | |

## نقطة مفتوحة على جهتنا

Bunny `POST /library/{libraryId}/videos/fetch` موثّق، لكن التوثيق ما يقول إن الرد يرجّع GUID — يُقاس قبل بناء اعتماد الريلز (المرحلة ٤).
