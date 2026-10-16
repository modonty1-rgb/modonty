# Video factory — مصنع فيديو مدونتي

| | |
|---|---|
| الوظيفة | مقالة منشورة ← فيديو عادي + ٣ شورتس + صورة مصغّرة + ترجمة، آليًا · الاعتماد بشري في الأدمن `/videos` |
| يعمل على | اليوم: جهاز خالد · المرحلة ٠: Contabo `84.46.245.226` · `/opt/video-factory` (لم يُنقل بعد) |
| المرجع | `documents/video-factory/k6/modonty-video-prd.html` (القرارات D1–D18، الفلو التقني، الوحدات M1–M14) |
| العقد مع الأدمن | `documents/video-factory/03-contract.md` · `x-radar-secret` = `RADAR_INGEST_SECRET` |
| التسليم | `documents/video-factory/k6/handover-answers.md` (H1–H17) |

هذا المجلد هو **الأصل** للكود والقواعد (قرار خالد، ١٦ أكتوبر ٢٠٢٦). مهارة Claude `~/.claude/skills/modonty-video` نسخة عمل منه.

## الملفات

| الملف | الوحدة |
|---|---|
| `fetch_article.py` | M1 الجلب: النص · صور المقالة · شعار العميل |
| `write_script.py` | M2+M3 السكربت عبر `claude -p` (اشتراك Max) + فحص المصادر · القواعد من `skill/` |
| `make.py` | M4 الصوت (Gemini `voice_kq9fd6jmhzqc`، مجمّع) + M6 الصنع (Chrome headless + ffmpeg) |
| `overlay.html` · `overlays.py` · `fonts/` | رسومات الإطار (Tajawal · الشعاران · السلاسل) |
| `gemini_voice.py` | استدعاءات Gemini · `recreate` يعيد تصميم الصوت |
| `youtube_auth.py` | ربط يوتيوب لمرة واحدة · `--check` |
| `experiment.py` | تجربة المرحلة ب (مقالات بلا تعديل يدوي) |
| `skill/` | قواعد القناة: `SKILL.md long.md formats.md checklist.md growth.md brand.json` |

## التشغيل لمقالة

```
انسخ هذا المجلد إلى مجلد عمل للمقالة، ثم داخله:
python fetch_article.py <article-url>
python write_script.py
python make.py all
```

## خارج المستودع عمدًا

- `music/` (٥ مقطوعات من مكتبة يوتيوب الصوتية، ~٤١ ميجا): في `~/.claude/skills/modonty-video/engine/music/` — ملفات صوت كبيرة لا تُرفع لـ git.
- الأسرار: `~/.modonty-video/youtube_oauth_client.json` · `youtube_token.json` · مفتاح Gemini من `console/.env.local` أو `GEMINI_API_KEY`.
- مجلدات العمل (`build/` · `out/` · `img/`) تُنشأ لكل مقالة ولا تُرفع.
