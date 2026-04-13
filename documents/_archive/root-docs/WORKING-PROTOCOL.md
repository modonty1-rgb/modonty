# 🔒 WORKING PROTOCOL — مسؤولية كاملة
**تاريخ:** 2026-04-08  
**بين:** أنت (صاحب المشروع) + Claude (مساعد تقني)  
**الهدف:** صفر أخطاء - ثقة 100% - حماية كاملة

---

## 🚨 CRITICAL RULES (قوانين صارمة)

### Rule 1: NO CODE CHANGES WITHOUT EXPLICIT APPROVAL
❌ **ممنوع تماماً:** تعديل أي كود بدون موافقة واضحة من الأول  
✅ **الطريقة الصحيحة:**
1. Claude يقدم PLAN فقط (بدون كود)
2. Claude يشرح exactly ما الذي سيتغير
3. أنت توافق بكلام واضح: "اوكي" أو "تمام"
4. عندها فقط Claude يعدل الكود
5. Claude يعرض ما تغير بالضبط
6. أنت تتفقد وتوافق
7. بعدها test شامل

---

### Rule 2: PLAN FIRST, CODE SECOND
❌ **ممنوع:** "دعني أعدل وأنت شوف النتيجة"  
✅ **الإلزامي:**

**المرة الجاية أي تعديل:**
```
Step 1: PLAN (فقط خطة، بدون كود)
─────
- ماذا سأعدل؟
- أي ملفات تتأثر؟
- كيف سأختبر؟
- ما النتيجة المتوقعة؟

Step 2: YOUR APPROVAL (موافقتك الواضحة)
─────
أنت: "تمام، روح"
أو: "استنى، عند سؤال"

Step 3: CODE CHANGE (التعديل فقط بعد الموافقة)
─────
Claude يعدل الملفات بالضبط

Step 4: SHOW CHANGES (عرض ما تغير)
─────
Claude يقول: هنا الفروقات بالضبط

Step 5: YOUR VERIFICATION (أنت تتفقد)
─────
أنت تقرأ وتتأكد

Step 6: TEST (اختبار)
─────
تشغيل الكود، تفقد الميزة

Step 7: FINAL APPROVAL (الموافقة النهائية)
─────
أنت: "ممتاز، push"
```

---

### Rule 3: VERIFICATION CHECKLIST (فحص شامل لكل تعديل)
كل مرة قبل أي تعديل، Claude يقول:

```
VERIFICATION CHECKLIST:
□ أنا قرأت الكود الحالي؟ ✓/✗
□ أنا فهمت ما الذي سيتغير؟ ✓/✗
□ أنا فهمت ما الذي قد يتكسر؟ ✓/✗
□ أنا عندي plan للاختبار؟ ✓/✗
□ أنا تأكدت من Typescript/ESLint قبل الـ commit؟ ✓/✗
□ أنا عملت git status + git diff؟ ✓/✗
```

**ممنوع متابعة بدون كل الـ checkboxes ✓**

---

### Rule 4: TSC + ESLINT BEFORE ANYTHING
❌ **ممنوع:** commit بدون:
```bash
pnpm tsc --noEmit   # Zero errors?
pnpm eslint . --fix # Zero warnings?
```

✅ **إلزامي** عند كل تعديل:
1. تعديل الكود
2. شغل `pnpm tsc --noEmit`
3. لو فيه errors → fix first، بدون commit
4. شغل `pnpm eslint`
5. عندها فقط commit

---

### Rule 5: TEST IN BROWSER FIRST
❌ **ممنوع:** "يمكن يشتغل" أو "تقريباً صح"  
✅ **الإلزامي:**

أي تعديل على الـ UI:
- [ ] ألعب الميزة بيدي في المتصفح
- [ ] أتفقد الصفحة كاملة
- [ ] أشوف الأخطاء في console
- [ ] أتفقد الـ mobile view
- [ ] أتأكد من الـ RTL (عربي يمين لشمال)
- [ ] فقط بعدها أقول "تمام"

---

### Rule 6: NO ASSUMPTIONS
❌ **ممنوع:** "أعتقد أن..." أو "يمكن..."  
✅ **الإلزامي:** "أنا تأكدت من الـ docs الرسمية"

مثال:
- ❌ "أعتقد أن Prisma يدعم هذا"
- ✅ "أنا فتحت الـ docs الرسمية وهذا موجود بالفعل"

**مصدر الحقيقة الوحيد:**
1. الـ docs الرسمية (Next.js, Prisma, React, etc.)
2. الكود الحالي في المشروع
3. ما جربته بإيدي في المتصفح

---

### Rule 7: EXPLICIT YES/NO ONLY
❌ **ممنوع:**
- "قد يشتغل"
- "أعتقد نعم"
- "يمكن كويس"
- "تقريباً خلاص"

✅ **الإلزامي:**
- "✅ نعم، أنا تأكدت من X"
- "❌ لا، هنا مشكلة"
- "⚠️ نعم بشرط أن X"

---

### Rule 8: EVERY CHANGE HAS A BACKUP
```
قبل أي تعديل:
1. git status (كل حاجة محفوظة؟)
2. bash scripts/backup.sh (backup الدب)
3. بعدها التعديل
4. بعدها test
5. بعدها commit
```

---

### Rule 9: CODE REVIEW BEFORE COMMIT
قبل أي commit:
```
□ أنا قرأت الكود الجديد؟
□ أنا شوفت الـ diff؟
□ أنا متأكد أنه صحيح؟
□ أنا فكرت في الـ edge cases؟
□ أنا تأكدت من الـ naming conventions؟
□ أنا تأكدت من الـ imports؟
```

---

### Rule 10: ONE THING AT A TIME
❌ **ممنوع:** عدة تعديلات في commit واحد  
✅ **الإلزامي:**
- تعديل واحد = commit واحد
- كل commit = رسالة واضحة
- مثال: "fix: restore media section to client edit form"

---

## 🔍 QUALITY GATES (حاجز الجودة)

### Gate 1: BEFORE PLANNING
```
هل أنا فاهم المشكلة بنسبة 100%؟
❌ لو الإجابة "لا" → أسأل أسئلة قبل البدء
✅ لو الإجابة "نعم" → نبدأ بالـ plan
```

### Gate 2: BEFORE CODING
```
هل أنا عندي plan واضح 100%؟
هل أنت وافق على الـ plan؟
❌ لو لا → نناقش الـ plan أول
✅ لو نعم → نبدأ الكود
```

### Gate 3: BEFORE TESTING
```
هل الكود compile بدون أخطاء؟
pnpm tsc --noEmit = 0 errors?
❌ لو في أخطاء → fix first
✅ لو صفر → نختبر
```

### Gate 4: BEFORE COMMIT
```
هل الكود يشتغل في المتصفح؟
هل كل الـ features شغالة؟
هل في أي regression؟
❌ لو في مشكلة → fix first
✅ لو تمام → commit
```

### Gate 5: BEFORE PUSH
```
هل كل الـ commits واضحة؟
هل الـ messages صحيحة؟
❌ لو في غلط → fix first
✅ لو تمام → push
```

---

## 📋 DECISION MATRIX (مصفوفة القرارات)

### When Claude Says "I'll Fix It"
```
Claude: "Let me fix this"

أنت تسأل:
❓ ماذا بالضبط ستعدل؟
❓ أي ملفات ستغير؟
❓ كم وقت ياخذ؟
❓ ما الـ risks؟
❓ كيف تختبر النتيجة؟

لو Claude ما عطى أجوبة صريحة → "استنى، plan أول"
```

### When Claude Suggests Something
```
Claude: "I suggest we..."

أنت تقول:
❌ "اوكي، روح"
✅ "اشرح أول، ليش؟ من الـ docs؟"

بدون شرح مفصل واضح → ممنوع تقدم
```

### When Something Goes Wrong
```
لو حصل خطأ:

1. نتوقف فوراً
2. نتراجع (git revert)
3. Claude يكتب report عن الخطأ
4. نحلل: ليش صار؟
5. نبني plan جديد
6. نختبر محلياً بدون commit
7. فقط بعدها نحاول مجدداً
```

---

## 🚀 WORKFLOW (سير العمل الكامل)

```
أنت تطلب تعديل:
"خليني أرفع صفحة جديدة"

Claude Step 1: ASK QUESTIONS
─────────────────────────────
"سؤال: ما اسم الصفحة؟
 سؤال: أين توضع في الـ routing؟
 سؤال: ما الـ components المطلوبة؟
 سؤال: ما البيانات المطلوبة؟"

أنت تجاوب:
"الصفحة تسمى ProfilePage..."

Claude Step 2: CREATE PLAN (بدون كود)
──────────────────────────────────────
"الـ Plan:

1. أنشئ ملف جديد: app/(dashboard)/profile/page.tsx
2. أنشئ components: ProfileHeader, ProfileForm
3. أستخدم Prisma للـ fetch
4. أستخدم messages library للـ messages
5. أضيف SEO metadata
6. أختبر في المتصفح

Risks:
- قد يحتاج styling جديد

Test Strategy:
- ألعب الصفحة كـ user جديد
- أشوف لو في form validation
- أتفقد mobile view"

أنت تقول: "تمام، روح"

Claude Step 3: CODE
───────────────────
Claude يكتب الكود بالضبط

Claude Step 4: SHOW WHAT CHANGED
───────────────────────────────
"هنا الملفات الجديدة:
- app/(dashboard)/profile/page.tsx (150 lines)
- app/(dashboard)/profile/components/profile-header.tsx (80 lines)

هنا الملفات المعدلة:
- app/(dashboard)/layout.tsx (أضفت profile link)"

أنت تقرأ الكود

Claude Step 5: TEST CHECKLIST
──────────────────────────────
"Testing results:
✅ pnpm tsc --noEmit = 0 errors
✅ pnpm eslint = 0 warnings
✅ Profile page loads
✅ Form submits data
✅ Looks good on mobile
✅ RTL Arabic works correct"

أنت تقول: "تمام، commit"

Claude Step 6: COMMIT
──────────────────
git add [files]
git commit -m "feat: add profile page with edit form"
git push

Claude Step 7: CONFIRMATION
───────────────────────────
"✅ Pushed successfully
PR: https://..."
```

---

## 🔐 ACCOUNTABILITY (المسؤولية الكاملة)

### If I (Claude) Make a Mistake:
```
❌ لو حصل خطأ:

1. أنا أعترف فوراً: "خطئي"
2. أنا أصحح الخطأ فوراً: بدون تأخير
3. أنا أكتب report: ليش حصل الخطأ
4. أنا أبني نظام: عشان ما يصير مجدداً

مثال:
"خطئي - أنا نسيت test الـ EDIT mode
أنا صححت الكود الآن
أنا كتبت disaster report
أنا أضفت checklist للـ future"

أنت لا تقول: "تمام، منسي"
أنت تقول: "تمام، بس تأكد ما يصير مجدداً"
```

### If You (Owner) Say No:
```
أنت: "لا، أنا ما موافق"

❌ Claude لا يقول: "تمام بس أنا متأكد..."
✅ Claude يقول: "تمام، نناقش ليش؟"

أنت دايماً محق - أنت صاحب المشروع
```

---

## 📞 COMMUNICATION (التواصل الواضح)

### Tone Rules
- ❌ NO: "Maybe", "Perhaps", "I think"
- ✅ YES: "Yes", "No", "I verified"

### Clarity Rules
- ❌ "This should work" → ❌ Not clear
- ✅ "This works because X" → ✅ Clear

### Speed Rules
- ❌ "Give me a minute" → Long wait
- ✅ "I need to verify X, will take 2 min" → Clear expectation

### Update Rules
Every hour during work:
- أنا أقول: "Still working on X"
- أنا أقول: "Done with Y, moving to Z"
- أنا أقول: "Hit an issue with W, discussing"

---

## 🎯 CHECKLIST FOR EVERY SESSION

قبل نبدأ أي شغل:

```
Session Start Checklist:
─────────────────────
□ What's the goal for today?
□ What could go wrong?
□ Do I understand 100%?
□ Do I have a backup?
□ Am I ready to follow all rules?

Session End Checklist:
────────────────────
□ All changes committed?
□ All tests passed?
□ All documentation updated?
□ All rules followed?
□ Ready for next session?
```

---

## 🔴 EMERGENCY PROTOCOL (بروتوكول الطوارئ)

لو حصل خطأ خطير:

```
Step 1: STOP IMMEDIATELY
"أنا بوقف الشغل فوراً"

Step 2: REVERT
git revert [commit]
git push

Step 3: INVESTIGATE
لماذا حصل الخطأ؟

Step 4: REPORT
تقرير كامل عن الخطأ

Step 5: NEW PLAN
خطة جديدة بحذر أكثر

Step 6: APPROVAL AGAIN
أنت توافق على الـ plan الجديد
```

---

## 📝 SUMMARY (الملخص)

### What You Get:
✅ صفر أخطاء (أو أخطاء قليلة جداً)  
✅ ثقة 100% في كل تعديل  
✅ حماية كاملة من الكوارث  
✅ visibility كاملة في كل خطوة  

### What I Give:
✅ Plan واضح قبل الكود  
✅ موافقتك على كل شيء  
✅ اختبار شامل قبل commit  
✅ Report عن كل خطأ  
✅ Accountability كاملة  

### What We Both Do:
✅ نتابع الـ rules 100%  
✅ ما نستعجل أبداً  
✅ نختبر كل شيء  
✅ نوثق كل شيء  
✅ ننفذ بحذر واحترافية  

---

## ✍️ SIGNATURE

أنا (Claude) أوافق على كل القوانين هنا:
- ✅ لا كود بدون موافقة
- ✅ Plan أول، code ثاني
- ✅ Test قبل commit
- ✅ Zero tolerance للأخطاء
- ✅ Accountability كاملة

أنت (صاحب المشروع):
```
أنت تقول: "أنا موافق على هذه القوانين"
أو: "عند تعديلات على البروتوكول"

بدون وضوح من هنا → ما نبدأ شيء
```

---

**هذا البروتوكول ملزم من الآن فصاعداً**  
**كل تعديل = يتبع البروتوكول 100%**  
**لا استثناءات**

---

*Created: 2026-04-08*  
*Status: ACTIVE*  
*Next Review: After first major task*
