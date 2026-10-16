# أسئلة لأحمد وأجوبته

أُرسلت ورُدّت ١٦ أكتوبر ٢٠٢٦. الجواب بنصّ أحمد، و«تحقّقنا» = ما قسناه في المستودع.

| # | السؤال | جواب أحمد | تحقّقنا |
|---|---|---|---|
| Q1 | حالات `status` | «الحالات في الأدمن ثلاث بس: ready_for_review · needs_attention · done. خطوات السيرفر تتسجّل على السيرفر في factory.sqlite وما توصل الأدمن. السيرفر يكلّم الأدمن في حالتين بس: ingest وattention. وdone تصير لما كل البنود المعتمدة تنتشر أو تنرفض نهائيًا.» | — |
| Q2 | `usage.gemini` | «`{ ttsRequests, retries429 }`. نلغي ttsSeconds.» | — |
| Q3 | تعريف المقالة | «بالرابط. الأدمن يحوّل الرابط/slug إلى articleId وclientId.» ومثال JSON كامل — في [03-contract.md](03-contract.md) | الـslug فريد **لكل عميل** لا عامّةً (`schema.prisma` `@@unique([clientId, slug])`). الموقع يحلّ `/articles/<slug>` بـ`findFirst { slug, status: PUBLISHED }` (`modonty/app/(site)/articles/[slug]/data/get-article-content-by-slug.ts:18-22`) — نحلّ بنفس القاعدة، فنطابق ما يراه الزائر |
| Q4 | التكرار والمراجعات | «سجل واحد لكل مقالة، والمفتاح الفريد articleId. أي إرسال جديد يحدّث نفس السجل ويزيد revision. البنود المرفوضة ترجع pending، والمنشورة تظل. وبعد الرفض مع ملاحظة يرجع بنفس الـid وrevision+1.» | — |
| Q5 | الملفات وBunny | «السيرفر يرفعها على Bunny Storage قبل ingest، والأدمن يستقبل روابط CDN (مو Stream). المسار: `video-factory/<slug>/rev-<n>/{long.mp4, short-1.mp4, short-2.mp4, short-3.mp4, thumbnail.png, long.srt, script.json}`. اقتراحي المنطقة اللي تخدم modonty-clients.b-cdn.net.» | **نقترح بدلها `modonty-reels-media`** (`modonty-reels-media.b-cdn.net`): `shared/lib/bunny.ts:10` يقول «reels → ALL reels files»، و`modonty-clients` لأصول ملف العميل |
| Q6 | الريلز | «الأدمن يسويها لحظة اعتماد modonty_reels للشورت، بمسار Bunny Stream (يجيب الملف من رابط CDN). صف Media فيه inReels وreelStatus وreelArticleId=articleId وbunnyVideoId. كل شورت يتعتمد لحاله.» | Bunny الرسمي: `POST /library/{libraryId}/videos/fetch` بـ`{ url }` موجود؛ **التوثيق ما يذكر إن الرد يرجّع GUID الفيديو** — يُقاس في مرحلة البناء |
| Q7 | وحدة الاعتماد | «(ملف × منصة). الفيديو العادي: youtube بس. كل شورت: youtube · modonty_reels · tiktok · instagram. الحالة لكل زوج: `{ status: pending\|approved\|published\|rejected\|failed, approvedBy, approvedAt, note, externalId, url, postedManuallyAt }`.» | — |
| Q8 | الطابور والنقاط | «السيرفر ما ينشر إلا youtube.» والأشكال بالحرف — في [03-contract.md](03-contract.md). `attention` **بدون :id** لأن ممكن ما يكون فيه سجل قبل ingest | — |
| Q9 | الرفض | «`GET /api/videos/queue?state=rejected` → items فيها note. السيرفر يعيد السكربت ويرسل ingest بـrevision+1، وهذا يصفّي المرفوضة.» | — |
| Q10 | رابط تليجرام | «نعم، الـid والـurl اللي يرجعهم ingest يكفون.» | — |
| Q11 | بيئة التجربة | «dev أول. السيرفر ما يوصل localhost، فالتجربة الأولى من جهاز خالد: محرّكي ← admin dev على localhost:3001. الإنتاج بعد أمر خالد.» | — |
| Q12 | التوقيت | «مو مستعجل. المرحلة ١. الحين المرحلة ب ثم ٠. المطلوب الحين نثبّت العقد بس، والكود بأمر خالد.» | — |
| Q13 | حقول زيادة | «revision · engineVersion · voiceId · scriptUrl · qa {passed, failures[]} · usage.stepSeconds · assets.long.srt · assets.long.thumbnail · copy لكل ملف · history[] (revision, at, event).» | — |

## أسئلة متابعة (أُرسلت مع أسماء الحقول)

| # | السؤال | الجواب |
|---|---|---|
| F1 | المنطقة `modonty-reels-media` بدل `modonty-clients` — موافق؟ | «موافق. المسار video-factory/<slug>/rev-<n>/…، وفيه الفيديو العادي كمان. بستخدم نفس منطقة التخزين ومفتاحها على السيرفر.» |
| F2 | revision جديدة: البند `approved` اللي ما انتشر — يرجع `pending` أم يبقى؟ | «يرجع pending. الملف تغيّر ولازم أحد يشوفه من جديد. والبنود المنشورة تظل زي ما هي.» |
| F3 | `skipped` = «ما ننشره على هالمنصة» — موافق؟ | «موافق: skipped = ما ننشره على هالمنصة، وdone = كل البنود published أو skipped.» |
| F4 | revision أقل ← 409؛ نفس الرقم ← تحديث بلا زيادة — موافق؟ | «موافق: revision أقل ← 409 مع current، ونفس الرقم ← تحديث آمن بدون ما يزيد.» |
| F5 | رابط لا ينحلّ ← 404 `article-not-found` — موافق؟ | «موافق. وجهتي: أسجّل الخطأ على السيرفر وأنبّه في تليجرام مباشرة، لأن ما فيه سجل في الأدمن أعلّق عليه.» |

**أحمد، ١٦ أكتوبر ٢٠٢٦:** «من جهتي العقد مقفول. الكود بأمر خالد. ولو تغيّر أي شي بعدين، كل واحد يبلّغ الثاني قبل التنفيذ.»
