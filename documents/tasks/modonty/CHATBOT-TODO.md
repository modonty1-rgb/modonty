# Chatbot — TODO
> Last Updated: 2026-04-11 (post live test)
> Scope: `modonty/components/chatbot/` · `modonty/app/api/chatbot/` · `modonty/app/api/articles/[slug]/chat/`

---

## 🔴 المرحلة 1 — تحسينات الشات بوت (Homepage + Article)

- [x] **CHAT-1** — "اسأل العميل" بعد جواب الذكاء الصناعي
  - جواب من DB: `matchedArticles` معروفة → زر مرتبط بالعميل من أول مقال
  - جواب من الويب: API يجيب `suggestedArticle` (أعلى مشاهدات في الفئة) → زر مرتبط بعميله
  - الزر: "هل تريد سؤال العميل مباشرة؟" → يفتح `ask-client-dialog.tsx` مع الـ `articleId`
  - **الملفات:** `ArticleChatbotContent.tsx` · `api/chatbot/chat/route.ts` · `ask-client-dialog.tsx`

- [x] **CHAT-2** — اقتراح ذكي للفئة من أول سطر
  - المستخدم يكتب قبل اختيار فئة → API يقارن السؤال بأسماء وأوصاف الفئات
  - يعرض: "يبدو أن سؤالك في موضوع [X] — هل هذا صحيح؟" → [تأكيد] أو [اختر موضوعاً آخر]
  - الاختيار اليدوي يبقى — الاقتراح اختصار فقط مو إجبار
  - **الملفات:** `ArticleChatbotContent.tsx` · `api/chatbot/chat/route.ts`

- [x] **CHAT-3** — جواب الويب → بطاقة أقرب مقال في الفئة
  - بعد Serper: API يحضر أعلى مقال مشاهدات في الفئة → يرجعه كـ `suggestedArticle`
  - UI يعرض بطاقة صغيرة أسفل الجواب: "هل تريد قراءة أعمق؟ إليك أقرب مقال"
  - يقود المستخدم للمقال → "اسأل العميل" بشكل طبيعي
  - **الملفات:** `api/chatbot/chat/route.ts` · `ArticleChatbotContent.tsx`

- [x] **CHAT-4** — Trusted sources filter للـ Serper
  - بعد Serper results: تحقق من domains موثوقة (Wikipedia، .gov، .edu، مصادر معروفة)
  - لا مصادر موثوقة → رد: "لم أجد مصادر موثوقة يُعتمد عليها في هذا الموضوع"
  - في مصادر → جاوب + اعرض المصدر بوضوح في نهاية الجواب
  - **الملفات:** `api/chatbot/chat/route.ts` أو `lib/serper.ts`

- [x] **CHAT-5** — Hard Test شامل (بعد إكمال CHAT-1 إلى CHAT-4) — ✅ مكتمل 2026-04-11
  - [x] سؤال في الفئة → في مقال → redirect + بطاقة المقال
  - [x] سؤال في الفئة → مو في مقال → جواب DB صحيح
  - [x] سؤال في الفئة → مو في DB → Serper + مصدر + بطاقة مقال مقترح + "اسأل العميل"
  - [x] سؤال خارج الفئة → out-of-scope message (threshold رُفع 0.42 → 0.52)
  - [x] اقتراح الفئة التلقائي → يقترح الصح
  - [x] Article page chatbot → يشتغل بدون اختيار فئة
  - [x] History → تظهر المحادثات السابقة
  - [x] Bug fix: empty content message → BadRequestError من Cohere (filter قبل الإرسال)
  - [x] Bug fix: hasTrustedContent → أضيف UNTRUSTED_DOMAINS (TikTok, YouTube, إلخ)

---

## 🟡 المرحلة 2 — FAQ من الشات بوت (Admin)

> بعد إكمال المرحلة 1 كاملاً.

- [ ] **CHAT-FAQ1** — Admin: صفحة "أسئلة المستخدمين" — `ChatbotMessage` مجمّعة حسب تكرار السؤال
- [ ] **CHAT-FAQ2** — Admin: زر "حوّل لـ FAQ" → ينشئ `ArticleFAQ` مرتبط بمقال بضغطة زر
- [ ] **CHAT-FAQ3** — Admin: filter حسب الفئة / العميل / المصدر (db / web)
- [ ] **CHAT-FAQ4** — modonty: FAQ المحوَّلة تظهر على صفحة المقال للزوار

---

## ✅ Done

- [x] **CHAT-5** — Hard test 8 cases جميعها ✅. Bugs fixed: scope threshold، empty message filter، trusted domains filter.
- [x] **CHAT-1** — "اسأل العميل" بعد جواب الويب — بطاقة gradient مع زرَّي "اقرأ المقال" + "اسأل العميل" (AskClientDialog مدمج). `ArticleChatbotContent.tsx`
- [x] **CHAT-2** — اقتراح الفئة تلقائياً — Input دائماً مرئي، الـ bot يقترح الفئة بـ Cohere embed → UI تأكيد جميل مع category icon. `api/chatbot/suggest-category/route.ts` (جديد) + `ArticleChatbotContent.tsx`
- [x] **CHAT-3** — جواب الويب → `suggestedArticle` (أعلى مشاهدات في الفئة) في الـ response — `api/chatbot/chat/route.ts`
- [x] **CHAT-4** — Trusted sources filter — `hasTrustedContent()` في `lib/rag/prompts.ts`، كلا الـ routes يرجعان `type: "noSources"` مع اعتذار واضح
- [x] **Prompt Engineering** — `lib/rag/prompts.ts` (ملف جديد) — 4 prompts قوية: category DB/web + article DB/web. كل prompt: persona واضحة، لا هلوسة، مصدر مذكور، عربية فصيحة، ٣ فقرات max
- [x] Category-scoped chatbot — `api/chatbot/chat/route.ts`
- [x] Article-scoped chatbot — `api/articles/[slug]/chat/route.ts`
- [x] RAG pipeline (Cohere + rerank) — `lib/rag/`
- [x] Serper fallback (web search) — `lib/serper.ts`
- [x] Out-of-scope detection — `lib/rag/scope.ts`
- [x] Streaming (NDJSON) — `api/chatbot/chat/route.ts`
- [x] Chat history في DB — `lib/chat/save-chatbot-message.ts`
- [x] History UI — `ChatHistoryList.tsx`
- [x] Category selector UI — `ArticleChatbotContent.tsx`
