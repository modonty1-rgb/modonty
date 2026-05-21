# Voice Script — Console Sales Pitch

Folder for the Modonty Console intro narration script + audio assets.

## Files

- **`script.md`** — Full script in plain colloquial Arabic. Used by the audio generator.
- **`script-plain.md`** — Auto-generated tashkeel-free copy (only used for the optional outsource-tashkeel workflow — not needed with ElevenLabs).

## Audio generation pipeline

1. **Provider:** ElevenLabs TTS (paid Starter plan — required for library voices via API)
2. **Voice:** Hazem — Polished Arabic Customer Care (`EGYKu1CV0vikeTYK5zoc`)
3. **Model:** `eleven_multilingual_v2`
4. **Settings:** stability 0.5, similarity_boost 0.75, speaker_boost on

To regenerate:

```bash
cd console
node scripts/generate-sales-pitch-audio.mjs
```

This reads `script.md`, splits sections by `## [N. ...]` headers, calls ElevenLabs for each section, writes `section-XX.mp3` files plus `manifest.json` to `console/public/help/audio/sales-pitch/`.

## Style rules (locked)

- ❌ NEVER use "موقعك" (confuses client with their own external website)
- ✅ Use: "صفحتك على مدونتي" · "مقالاتك" · "محتواك" · "صفحة شركتك"
- ❌ NO formal Arabic (الفصحى)
- ✅ Casual Arabic — Saudi/Egyptian mix, like a real salesperson talking
- ❌ NO empty promises (e.g. "Google indexes in hours" — Google takes days/weeks)
- ✅ Realistic claims with phrases like "مع الوقت" / "بشكل تدريجي"

## Sections (9 total · ~5 min)

| # | Section | Approx duration |
|---|---------|-----------------|
| 1 | ترحيب | 15 sec |
| 2 | الكونسول = غرفة التسويق | 30 sec |
| 3 | دورك إنت إيش | 30 sec |
| 4 | ضغطة موافقة = آلة تسويق كاملة | 1 min 15 sec |
| 5 | تنبيهات تليجرام | 45 sec |
| 6 | حملات الواتساب الجاية | 45 sec |
| 7 | يوم في حياتك مع مدونتي | 45 sec |
| 8 | الفوايد الملموسة | 30 sec |
| 9 | خاتمة + CTA | 15 sec |

## Brand pronunciations (handled natively by ElevenLabs Hazem)

- مدونتي · كونسول · تليجرام · واتساب · إنستجرام · يوتيوب · تيك توك · لينكدإن · فيسبوك · إكس · سيو · إيميل · جوجل

## Iteration log

- **v4** (2026-05-14): Switched from Azure Hamed (broken pronunciation) to ElevenLabs Hazem (clean Saudi/Arabic). Rewrote script as honest copywriter — removed empty promises.
- v3: Added full colloquial tashkeel for Azure TTS (later moot — ElevenLabs handles plain Arabic correctly).
- v2: Marketing focus rewrite (email + 6 social + Telegram + WhatsApp).
- v1: Initial 5-section draft.
