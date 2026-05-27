# 🔐 دليل إعطاء الصلاحيات لفريق مدونتي

> **هذا الدليل لك يا خالد** — مرجع كامل لإضافة موظفين، شركاء، agents (مثل Mariam) لكل الأدوات اللي تستخدمها مدونتي.
> **القاعدة الذهبية:** لا تشارك password أبدًا. كل أداة فيها User Management — تدعو الشخص بإيميله.
> **آخر تحديث:** 2026-05-27

---

## 📋 جدول الأدوار في مدونتي

| الدور | مين | إيش يحتاج |
|---|---|---|
| **Owner** | أنت (خالد) | كل شي + يضيف ويحذف |
| **Content Writer** | مايا (مصر) + أي كاتب جديد | كتابة مقالات + Request Indexing |
| **SEO Specialist (Human)** | لو وظّفت إنسان | كل GSC + Bing + GA4 |
| **SEO Specialist (AI Agent)** | Mariam في الـ Chrome extension | نفس صلاحيات SEO Human (تستخدم بريدك) |
| **Developer** | أنا (Claude in VS Code) | كل شي تقني (Vercel, GitHub, DB) |
| **Designer / Marketing** | لو في | GA4 (read only) + Cloudinary |

---

## 🔧 الأدوات اللي تستخدمها مدونتي

| # | الأداة | المسؤول | اشتراك مدفوع؟ |
|---|---|---|---|
| 1 | Google Search Console | جوجل | مجاني |
| 2 | Bing Webmaster Tools | Microsoft | مجاني |
| 3 | Google Analytics 4 (GA4) | جوجل | مجاني |
| 4 | Google Tag Manager (GTM) | جوجل | مجاني |
| 5 | Vercel | Vercel | Pro ($20/شهر) |
| 6 | MongoDB Atlas | MongoDB | M0 مجاني / M10 مدفوع |
| 7 | Cloudinary | Cloudinary | مجاني (حتى حد) |
| 8 | Resend | Resend | مجاني (حتى حد) |
| 9 | GitHub | GitHub | مجاني (private repos) |
| 10 | Anthropic Claude | Anthropic | مدفوع |

---

# 📖 شرح تفصيلي لكل أداة

---

## 1️⃣ Google Search Console (GSC)

**الغرض:** متابعة فهرسة مدونتي في جوجل + Request Indexing + Removals

### خطوات إضافة شخص:

1. ادخل https://search.google.com/search-console
2. اختار property → **modonty.com** (أو sc-domain:modonty.com)
3. اضغط على ⚙️ **Settings** (يسار أسفل)
4. **Users and permissions**
5. اضغط **Add user**
6. اكتب الـ Gmail (لازم Gmail)
7. اختار **Permission level**
8. اضغط **Add**

### مستويات الصلاحية:

| المستوى | ايش يقدر يعمل | مناسب لمين |
|---|---|---|
| **Owner** | كل شي + يضيف/يحذف users | أنت فقط |
| **Full user** ⭐ | كل شي ما عدا User Management | مايا، Mariam، أي SEO |
| **Restricted user** | عرض فقط (read-only) | Designer، Marketing |

### القاعدة:
- **مايا (Content Writer)** → Full user (تقدر تعمل Request Indexing)
- **Mariam (AI Agent)** → استخدم Gmail الـ extension تبعها → Full user
- **أي شريك مؤقت** → Restricted user أحسن

### الحذف:
Settings → Users → اضغط ⋮ بجنب الاسم → Remove access

---

## 2️⃣ Bing Webmaster Tools

**الغرض:** نفس GSC بس لـ Bing + Yahoo + DuckDuckGo (مهم للسعودية)

### خطوات إضافة شخص:

1. ادخل https://www.bing.com/webmasters
2. اختار site → modonty.com
3. ⚙️ **Settings** → **User Management**
4. **Add User**
5. اكتب الـ Microsoft account email (Outlook/Hotmail/Live)
6. اختار **Role**

### مستويات الصلاحية:

| المستوى | ايش يقدر يعمل |
|---|---|
| **Administrator** | كل شي + يضيف users |
| **Read/Write** ⭐ | تعديل + submit URLs (مناسب لمايا) |
| **Read Only** | عرض فقط |

### الحذف:
نفس مكان الإضافة → Remove

### ملاحظة:
لو ما عند مايا Microsoft account → تعمل واحد مجانًا في outlook.com خلال دقيقة.

---

## 3️⃣ Google Analytics 4 (GA4)

**الغرض:** متابعة الزوار + traffic sources + behavior

### خطوات إضافة شخص:

1. ادخل https://analytics.google.com
2. ⚙️ **Admin** (يسار أسفل)
3. تحت Property → **Property access management**
4. اضغط **+** (يمين أعلى) → **Add users**
5. اكتب الـ Gmail
6. اختار **Direct roles and data restrictions**
7. اضغط **Add**

### مستويات الصلاحية:

| المستوى | ايش يقدر يعمل | مناسب لمين |
|---|---|---|
| **Administrator** | كل شي + يضيف users | أنت |
| **Editor** ⭐ | تعديل property + reports | Developer، SEO |
| **Marketer** | يبني audiences + conversions | Marketing |
| **Analyst** | يحفظ reports + dashboards | Content Writer |
| **Viewer** | عرض فقط | شريك مؤقت |

### القاعدة:
- **مايا** → Viewer (تشوف أي مقال يجيب زوار، بدون تعديل)
- **Mariam** → Editor (تحتاج تنشئ events جديدة لو احتاجت)

---

## 4️⃣ Google Tag Manager (GTM)

**الغرض:** إدارة tags (GA4, Hotjar, Facebook Pixel, إلخ)

### خطوات إضافة شخص:

1. ادخل https://tagmanager.google.com
2. اختار account → modonty
3. **Admin** (الـ tab فوق)
4. تحت Container → **User Management**
5. **+** (يمين أعلى) → **Add new users**
6. اكتب الـ Gmail
7. اختار **Container permissions**

### مستويات الصلاحية:

| المستوى | ايش يقدر يعمل |
|---|---|
| **Read** | عرض فقط |
| **Edit** | يعدّل tags بدون نشر |
| **Approve** ⭐ | يوافق على publish |
| **Publish** | ينشر للموقع المباشر |

### القاعدة:
- **Developer (أنا)** → Publish
- **Marketing** → Edit (يجهّز، لازم تأكيد منك)

---

## 5️⃣ Vercel (Hosting + Deployment)

**الغرض:** يستضيف modonty.com + admin + console

### خطوات إضافة شخص:

1. ادخل https://vercel.com
2. اختار team → **modonty**
3. **Settings** → **Members**
4. اضغط **Invite Member**
5. اكتب الإيميل (أي إيميل، مش لازم Gmail)
6. اختار **Role**

### مستويات الصلاحية (Vercel Pro):

| المستوى | ايش يقدر يعمل | مناسب لمين |
|---|---|---|
| **Owner** | كل شي + billing | أنت فقط |
| **Member** ⭐ | يدير projects + deploys | Developer (أنا) |
| **Viewer** | عرض فقط (analytics, logs) | شريك مؤقت |

### ملاحظات مهمة:
- **Vercel ما يدعم Bing/Microsoft accounts** — لازم email عادي
- لو الشخص ما يحتاج deploy، خليه Viewer
- **Billing access** منفصل — حتى Owner تاني لازم تأذنله بشكل خاص

---

## 6️⃣ MongoDB Atlas (Database)

**الغرض:** قاعدة بيانات مدونتي

### ⚠️ تحذير مهم:
**DB access = خطير.** الشخص يقدر يحذف كل المقالات. لا تعطي access إلا لمطور موثوق.

### خطوات إضافة شخص:

1. ادخل https://cloud.mongodb.com
2. اختار organization → modonty
3. **Access Manager** (يسار)
4. **Organization Access** أو **Project Access**
5. **Invite Users**
6. اكتب الإيميل
7. اختار **Organization Role**

### مستويات الصلاحية:

| المستوى | ايش يقدر يعمل |
|---|---|
| **Organization Owner** | كل شي + billing | أنت فقط |
| **Project Owner** | كل شي في project معين | Developer ثقة عالية |
| **Project Data Access Admin** ⭐ | يقرأ ويعدّل البيانات | Developer (أنا) |
| **Project Read Only** | عرض البيانات فقط | Auditor |

### القاعدة:
- **Developer (أنا)** → Project Data Access Admin
- **أي حد ثاني** → Project Read Only (لو حتى يحتاج)

---

## 7️⃣ Cloudinary (Image Hosting)

**الغرض:** تخزين كل الصور + الـ media

### خطوات إضافة شخص:

1. ادخل https://cloudinary.com
2. اختار **dfegnpgwx** (cloud name تبع modonty)
3. ⚙️ Settings → **Users**
4. **Invite User**
5. اكتب الإيميل
6. اختار **Role**

### مستويات الصلاحية:

| المستوى | ايش يقدر يعمل |
|---|---|
| **Master Admin** | كل شي + billing | أنت |
| **Admin** ⭐ | يدير assets + transformations | Developer |
| **Reports** | عرض + downloads | Content Writer |
| **Media Library** | upload + organize | Designer |
| **Restricted Media Library** | upload فقط في folder معين | Junior |

### القاعدة:
- **مايا (Content Writer)** → Media Library (ترفع صور بدون ما تحذف ولا تعدّل)
- **Designer** → Admin

---

## 8️⃣ Resend (Email Sending)

**الغرض:** يرسل emails للمشتركين (Newsletter, Notifications)

### خطوات إضافة شخص:

1. ادخل https://resend.com
2. اختار team → modonty
3. **Settings** → **Team**
4. **Invite Member**
5. اكتب الإيميل
6. اختار **Role**

### مستويات الصلاحية:

| المستوى | ايش يقدر يعمل |
|---|---|
| **Owner** | كل شي + billing | أنت |
| **Admin** | كل شي ما عدا billing | Developer |
| **Developer** | API keys + sending logs | Junior dev |

### ملاحظة:
**API key منفصل** — لو طلبت من حد API key، لا تعطيه master key. أنشئ key جديد محدود الصلاحية.

---

## 9️⃣ GitHub (Code Repository)

**الغرض:** الكود تبع modonty + admin + console

### خطوات إضافة شخص (لـ private repo):

1. ادخل https://github.com/modonty1-rgb/modonty
2. ⚙️ **Settings**
3. تحت Access → **Collaborators and teams**
4. **Add people** أو **Add teams**
5. اكتب الـ GitHub username
6. اختار **Permission level**

### مستويات الصلاحية:

| المستوى | ايش يقدر يعمل | مناسب لمين |
|---|---|---|
| **Owner** | كل شي + يحذف repo | أنت فقط |
| **Admin** | كل شي ما عدا حذف الـ repo | Developer ثقة عالية |
| **Maintain** | merge PRs + manage issues | Senior Dev |
| **Write** ⭐ | push code + create PRs | Developer (أنا) |
| **Triage** | manage issues + PRs بدون code | Project manager |
| **Read** | clone + view | Auditor |

### القاعدة:
- **Developer (أنا)** → Write
- **أي شخص يحتاج يرى الكود** → Read

### ⚠️ تحذير:
**Owner = خطير.** لا تعطي Owner لأحد ثاني — يقدر يحذف الـ repo بكل الـ commits.

---

## 🔟 Anthropic Claude (للـ Mariam Extension)

**الغرض:** الـ AI agent اللي يعمل Mariam

### الطريقة:
1. أنشئ workspace جديد في https://console.anthropic.com
2. **Settings** → **Members**
3. **Invite Member**
4. اعطيها **Member** role (مش Admin)

### ⚠️ ملاحظة:
Mariam (الـ extension) تستخدم **session تبعك** في المتصفح — مش حساب منفصل. لو تبغى لها حساب منفصل، اعمل لها Gmail جديد + Anthropic account جديد + ادفع تبعها.

---

# 🎯 إعدادات سريعة حسب الدور

## لو هتضيف **Content Writer جديد** (مثل مايا):

| الأداة | الصلاحية |
|---|---|
| GSC | Full user |
| Bing Webmaster | Read/Write |
| GA4 | Viewer |
| Cloudinary | Media Library |
| GitHub | لا (مش محتاج) |
| Vercel | لا |
| MongoDB | لا |

**الوقت المطلوب:** ~10 دقايق

---

## لو هتضيف **Developer جديد**:

| الأداة | الصلاحية |
|---|---|
| GitHub | Write |
| Vercel | Member |
| MongoDB Atlas | Project Data Access Admin |
| GSC | Full user |
| Cloudinary | Admin |
| Resend | Developer |
| GA4 | Editor |
| GTM | Approve |

**الوقت المطلوب:** ~20 دقيقة

---

## لو هتضيف **SEO Specialist بشري**:

| الأداة | الصلاحية |
|---|---|
| GSC | Full user |
| Bing Webmaster | Read/Write |
| GA4 | Editor |
| GTM | Edit |
| Cloudinary | لا |
| GitHub | Read (يقرأ schema, robots, etc) |

**الوقت المطلوب:** ~15 دقيقة

---

## لو هتضيف **Designer / Marketing**:

| الأداة | الصلاحية |
|---|---|
| Cloudinary | Admin (للصور) |
| GA4 | Marketer |
| GTM | Edit |
| GSC | Restricted user |
| Vercel | Viewer |

**الوقت المطلوب:** ~10 دقايق

---

# 🛡 أفضل الممارسات الأمنية

## ✅ افعل دائمًا:

1. **استخدم 2-Factor Authentication (2FA)** على كل حساباتك (Gmail, GitHub, Vercel) → ادخل Settings → Security → enable
2. **اعمل review كل 3 شهور** — راجع قائمة users في كل أداة، شيل اللي ما يحتاج access
3. **استخدم Password Manager** (1Password, Bitwarden) — مجاني وآمن
4. **سجّل في ملف من عندك** كل شخص أعطيته access (مع تاريخ + سبب)
5. **استخدم Restricted/Viewer roles** دايمًا إلا لو الشخص يحتاج Write

## ❌ ممنوع:

1. **لا تشارك password** أبدًا — حتى مع الفريق
2. **لا تعطي Owner لأي حد** غيرك (يقدر يحذفك)
3. **لا تستخدم نفس password** في أكثر من حساب
4. **لا تنشر API keys** في Slack/Discord/Email
5. **لا تعطي MongoDB write access** إلا لمطور موثوق

---

# 📅 جدول مراجعة الصلاحيات

## كل أسبوع (5 دقايق):
- شوف Vercel deployments → تأكد كل deploy من شخص معروف
- شوف GitHub activity → تأكد كل push من Developer

## كل شهر (30 دقيقة):
- راجع GSC Users → شيل اللي ما يحتاج
- راجع GA4 Users → نفس الشي
- راجع Cloudinary Users
- راجع كل API keys → احذف القديمة

## كل 3 شهور (ساعة):
- راجع كل الأدوات → احذف users ما تذكر متى أضفتهم
- غيّر passwords الحساسة (Vercel, MongoDB)
- راجع 2FA → تأكد كل حسابك معاه 2FA
- اعمل backup للقاعدة (DB)

---

# 🚨 لو حد ترك الشركة / يحتاج remove فوري

## الخطوات (بالترتيب — أهم شي الأول):

1. **GitHub** — Remove من جميع الـ repos
2. **MongoDB Atlas** — Revoke access (خطر — يقدر يحذف بيانات)
3. **Vercel** — Remove من team
4. **GSC** — Remove access
5. **GA4** — Remove
6. **Cloudinary** — Remove
7. **Resend** — Revoke any API keys اللي عندهم
8. **GTM** — Remove
9. **Bing Webmaster** — Remove

**ثم:**
10. **غيّر passwords** على الحسابات الحساسة (لو شاركتها)
11. **اعمل rotation للـ API keys** اللي ممكن يكونوا شافوها

**الوقت المطلوب:** 30 دقيقة لـ shutdown كامل

---

# 📝 ملف للسجل الذاتي (مقترح)

أنصحك تعمل ملف بسيط (Excel أو Notion) فيه:

| الاسم | الإيميل | الدور | الأدوات اللي عنده فيها access | تاريخ الإضافة | تاريخ المراجعة الأخيرة |
|---|---|---|---|---|---|
| مايا | maya@example.com | Content Writer | GSC, Bing, GA4, Cloudinary | 2026-05-27 | — |
| (أنا — Developer) | dev@modonty.com | Developer | GitHub, Vercel, MongoDB, GSC, Cloudinary, Resend, GA4, GTM | 2026-04-01 | 2026-05-27 |

كل شهر شوف الملف، راجع، حدّث.

---

# 🎓 ملخص في 5 سطور

1. **ما تشارك password** — كل أداة فيها User Management
2. **اختار أقل صلاحية ممكنة** — Restricted/Viewer أحسن من Admin
3. **2FA على كل حساباتك** — بدون استثناء
4. **مراجعة شهرية** — احذف اللي ما يحتاج
5. **لو حد ترك** — احذف من 9 أدوات فورًا

---

**ملف مرجعي:** احفظه + ارجع له لما تحتاج تضيف أي شخص.
**عنّيت أي حد بعد كذا؟** ضيفه للجدول الذاتي + راجع كل 3 شهور.

---

المصطلحات الإنجليزية:
- User Management · Permissions · Roles · Access
- Owner · Admin · Editor · Viewer · Read · Write
- 2FA (Two-Factor Authentication) · Password Manager
- API key · session · token
- Google Search Console (GSC) · Bing Webmaster Tools
- Google Analytics 4 (GA4) · Google Tag Manager (GTM)
- Vercel · MongoDB Atlas · Cloudinary · Resend · GitHub · Anthropic
- Full user · Restricted user · Project Data Access Admin · Maintain
- Newsletter · Notifications · audit · rotation
- Content Writer · Developer · SEO Specialist · Designer · Marketing
