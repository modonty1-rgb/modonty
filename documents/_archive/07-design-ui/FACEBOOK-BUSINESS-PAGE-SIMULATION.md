## محاكاة صفحة فيسبوك للأعمال لعملاء مودونتي

هذه الوثيقة تشرح كيف تضبط بيانات أي عميل في مودونتي (مثل **Elmazny Marketing Agency**) بحيث تبدو صفحة العميل في مودونتي أقرب ما يمكن لصفحة **Facebook Business Page** من حيث البنية: صورة الغلاف، صورة الملف الشخصي، الاسم، الأزرار، الأقسام، والإشارات الاجتماعية – باستخدام الحقول والمكوّنات الموجودة فقط.

In English: this spec shows how to configure a Modonty client so its detail page structurally mirrors a Facebook Business Page while still using Modonty’s own design.

---

## 1. تشريح صفحة فيسبوك للأعمال (Facebook Business Page Anatomy)

اعتمادًا على توثيق Meta الرسمي لصفحات الأعمال `[Set up your Facebook business Page]`, `[Create a Facebook Page for your business]`, `[Customize a Page]`, تكون أهم عناصر صفحة فيسبوك للأعمال:

- **صورة الملف الشخصي (Profile Picture)**  
  صورة مربعة تمثل الشعار أو العلامة التجارية.

- **صورة الغلاف (Cover Photo)**  
  بانر عريض في أعلى الصفحة يعبر عن هوية النشاط.

- **اسم الصفحة واسم المستخدم (@username / Page URL)**  
  اسم النشاط + رابط قصير مميز.

- **زر الإجراء (Call To Action Button)**  
  مثل: Contact us, Call now, Send message, Book, Learn more… يظهر أسفل الغلاف.

- **قسم حول (About / Page Info)**  
  وصف قصير + تفاصيل أساسية عن النشاط.

- **معلومات الاتصال (Contact Info)**  
  موقع إلكتروني، هاتف، بريد إلكتروني، موقع جغرافي، ساعات العمل.

- **التبويبات (Tabs / Navigation)**  
  مثل: Home, About, Posts, Reviews, Photos, Services, Shop… قابلة للتخصيص.

- **الخدمات / العروض (Services / Products)**  
  قائمة بالخدمات أو الباقات التي يقدمها النشاط.

- **الدليل الاجتماعي (Social Proof)**  
  عدد الإعجابات والمتابعين، التقييمات/المراجعات، التفاعل على المنشورات.

- **الصور والفيديوهات (Photos / Media)**  
  مكتبة صور وفيديو مرتبطة بالنشاط.

ملاحظة: نقوم في مودونتي بمحاكاة **البنية والسلوك** (structure & behavior) قدر الإمكان، وليس العلامة التجارية لفيسبوك أو تصميمه البصري.

---

## 2. ربط عناصر فيسبوك مع حقول ومكوّنات مودونتي

الجدول التالي يوضح كيف نحاكي كل جزء من صفحة فيسبوك باستخدام حقول العميل ومكوّنات صفحة العميل في مودونتي (ضمن مسار `modonty/app/clients/[slug]/`):

| عنصر فيسبوك | ما يقابله في مودونتي |
| ----------- | --------------------- |
| **Profile Picture** (صورة الملف الشخصي) | حقل `logoMedia` في نموذج العميل. يظهر في مكوّن `client-hero.tsx` كصورة دائرية فوق الغلاف، ويستخدم أيضًا في JSON‑LD كـ `Organization.logo`. |
| **Cover Photo** (صورة الغلاف) | حقلا `ogImageMedia` أو `twitterImageMedia` في العميل. يتم استخدامهما كخلفية بصرية لمكوّن `ClientHero` (انظر `client-hero.tsx`). يفضَّل أبعاد قريبة من \(1200×630\) والتي تتوافق مع توصيات Facebook/OG. |
| **Page Name** (اسم الصفحة) | حقل `name` في العميل. يظهر في الـ Hero، ويستخدم كجزء من `seoTitle` و `og:title` و `twitter:title`. |
| **Page Username / URL** (اسم المستخدم / رابط الصفحة) | حقل `slug` يولّد رابط صفحة العميل في مودونتي (`/clients/[slug]`). وحقل `url` يخزن الموقع الرسمي (يمكن اعتباره مكافئًا للرابط الخارجي في فيسبوك). |
| **About / Page Info** (حول / معلومات) | الحقول: `description`, `seoDescription`, `businessBrief`, `targetAudience`, `contentPriorities`. هذه الحقول تُعرض في مكوّن `client-about.tsx` وعبر تبويب "معلومات" في واجهة العميل. |
| **Contact Info** (معلومات الاتصال) | الحقول: `email`, `phone`, `contactType` بالإضافة إلى حقول العنوان `addressCity`, `addressRegion`, `addressCountry`, `addressStreet`, إلخ. تُعرض في `client-contact.tsx` وأجزاء من `client-about.tsx`. |
| **Location & Hours** (الموقع وساعات العمل) | حقول العنوان (انظر مستند `CLIENTS PAGE META & JSON-LD SPEC`) + إمكانية استخدام `addressLatitude`, `addressLongitude` في JSON‑LD. (ساعات العمل يمكن إضافتها لاحقًا عبر حقل مخصص إن لزم). |
| **CTA Button** (زر الإجراء الرئيسي) | في مكوّن `client-hero.tsx`: زر **"زيارة الموقع"** (Visit Website) يعتمد على حقل `url`. يمكن التعامل معه كمعادل لـ “Contact us / Learn more”. أزرار "متابعة" و"مشاركة" (`share-client-button.tsx`) تعمل كأزرار تفاعل إضافية. |
| **Tabs (Home, About, Posts, Reviews, …)** | في مودونتي، التبويبات الحالية في صفحة العميل هي: `overview`, `articles`, `about` داخل `client-tabs-wrapper.tsx`. يمكن اعتبار: **Overview = Home**, **Articles = Posts**, **About = About** على فيسبوك. |
| **Services / Products** | يمكن تمثيلها داخل الوصف، `businessBrief`, `contentPriorities` أو عبر مقالات مخصصة في تبويب "المقالات" توضّح الخدمات والباقات. |
| **Social Proof (Likes, Followers, Reviews)** | يعتمد على: جدول `ClientLike` لعدد المتابعين، `ClientView` لعدد الزيارات، وعدد مقالات العميل. هذه القيم تُجمع في `client-stats.ts` وتُعرض في `client-hero.tsx` كإحصاءات (followers, articles, views). |
| **Social Links (Facebook, Instagram, …)** | حقل `sameAs` في العميل (مصفوفة روابط) يستخدم في JSON‑LD كـ `Organization.sameAs`، كما تظهر أيقونات مواقع التواصل (LinkedIn, Twitter, Facebook…) في `client-hero.tsx` و/أو `client-contact.tsx`. |
| **Photos / Media** | يمكن تمثيلها عبر صور المقالات الخاصّة بالعميل أو صور مرفوعة كـ `ogImageMedia`, `twitterImageMedia`، أو وسائط أخرى مرتبطة بالمقالات. |

بهذا الربط يمكن لأي مسوّق أن يحوّل صفحة العميل في مودونتي إلى نسخة احترافية تحاكي فيسبوك من حيث الأقسام الرئيسية وسهولة الفهم للمستخدم.

---

## 3. إعداد عميل جديد: Elmazny Marketing Agency كمثال

الهدف هنا هو ضبط سجل عميل جديد في مودونتي بحيث يحاكي صفحة فيسبوك التالية:  
`https://www.facebook.com/abdelrhmanelmazny`

### 3.1 معلومات أساسية (Basic Info)

- **name (اسم العميل)**  
  مثال مقترح:  
  - `Elmazny Marketing Agency`  
  أو صيغة عربية + إنجليزية:  
  - `Elmazny Marketing Agency - وكالة التسويق المزني`

- **legalName (الاسم القانوني)**  
  إن وُجد في السجل التجاري أو في صفحة فيسبوك الرسمية، يُسجَّل هنا بصيغته النظامية (مثلاً: `Elmazny Marketing Agency LLC`). إن لم يتوفر، يمكن تركه فارغًا.

- **slug (مسار الرابط)**  
  يُولَّد تلقائيًا من الاسم وفق قواعد النظام (إزالة الكلمات العامة، استبدال الفراغات بشرطات، حد أقصى للطول). لا حاجة للتعديل اليدوي إلا عند الضرورة التسويقية.

### 3.2 الهوية البصرية (Branding: Logo & Cover)

- **logoMedia (شعار الصفحة / Profile Picture)**  
  - ارفع نسخة عالية الجودة من شعار Elmazny (مربعة قدر الإمكان).  
  - أبعاد مقترحة: من \(512×512\) حتى \(1024×1024\).  
  - صيغة مفضلة: PNG بخلفية شفافة أو SVG.  
  - alt (نصي): `"Elmazny Marketing Agency Logo"`.

- **ogImageMedia (Cover / OG Image)**  
  هذه الصورة هي المعادل لصورة الغلاف على فيسبوك، وتُستخدم أيضًا كصورة المشاركة على فيسبوك/لينكدإن، حسب توثيق Open Graph وFacebook Sharing:
  - أبعاد موصى بها: \(1200×630\) بكسل (نفس توصيات Facebook للـ OG).  
  - يمكن تصميمها بحيث تشبه غلاف فيسبوك من حيث التركيب: خلفية براندية + شعار + رسالة تسويقية قصيرة.  
  - حجم ملف أقل من 300KB لتحسين السرعة.  
  - alt نصي (مثال): `"Elmazny Marketing Agency - Digital Marketing Cover"`.

- **twitterImageMedia (اختياري)**  
  - إن رغبت بصورة مخصصة لـ X/Twitter، استخدمها هنا بنفس الأبعاد \(1200×630\).  
  - إن تُركت فارغة، سيستخدم النظام `ogImageMedia` تلقائيًا.

### 3.3 العناوين الوصفية (SEO Title & Description)

استنادًا إلى مستند `CLIENT-META-TAGS-RESEARCH.md`:

- **seoTitle**  
  - طول مقترح: 50–60 حرفًا.  
  - مثال عربي/إنجليزي:  
    - `Elmazny Marketing Agency | إدارة حملات التسويق الرقمي باحترافية`  
  - يظهر في: `<title>`, `og:title`, `twitter:title`.

- **seoDescription**  
  - طول مقترح: 120–160 حرفًا.  
  - مثال:  
    - `وكالة Elmazny Marketing Agency متخصصة في حملات التسويق الرقمي، إدارة منصات التواصل، والإعلانات الممولة لتحقيق نمو حقيقي لعلامتك التجارية.`  
  - يظهر في: `meta name="description"`, `og:description`, `twitter:description`.

- **description**  
  - نص أطول يستخدم في JSON‑LD وفي قسم "معلومات".  
  - يركّز على: نوع الوكالة، نوع العملاء، أهم الخدمات (إدارة سوشيال ميديا، إعلانات ممولة، محتوى، إلخ).  
  - لا تنسخ نصوص فيسبوك حرفيًا؛ استخدم صياغة أصلية تعبّر عن نفس الفكرة.

### 3.4 ملخص الأعمال والجمهور (Business Brief & Audience)

- **businessBrief**  
  - فقرة عربية واضحة تشرح: ما الذي تقدمه Elmazny، لمن، وبأي أسلوب.  
  - هذا الحقل موجّه للكتاب ومسؤولي التسويق داخل مودونتي، ويُستخدم في `client-about.tsx`.

- **targetAudience**  
  - وصف للفئة المستهدفة (أصحاب الأنشطة، المتاجر الإلكترونية، العيادات،… إلخ).  
  - مثال:  
    - `أصحاب الأنشطة الصغيرة والمتوسطة الذين يبحثون عن شريك تسويق رقمي طويل الأمد لزيادة المبيعات عبر السوشيال ميديا.`  

- **contentPriorities**  
  - مصفوفة نصوص توضّح الأولويات التحريرية:  
    - `["إدارة حسابات التواصل الاجتماعي", "الإعلانات الممولة", "تصميم المحتوى الإبداعي", "تقارير أداء الحملات"]`.

### 3.5 بيانات الاتصال والموقع (Contact & Location)

استنادًا إلى بيانات صفحة فيسبوك الرسمية (قدر المتاح):

- **url**  
  - الموقع الرسمي إن وُجد (مثال: `https://elmazny-agency.com`).  
  - هذا الرابط يُستخدم في زر "زيارة الموقع" (CTA الرئيسي).

- **email**  
  - بريد الدعم أو التواصل الظاهر في صفحة فيسبوك أو في الموقع الرسمي، مثل: `info@elmazny-agency.com`.

- **phone**  
  - رقم الهاتف/الواتساب الظاهر في الصفحة، بصيغة دولية مفضلة: `+9665XXXXXXXX`.

- **contactType**  
  - مثل: `"customer service"`, `"sales"`, `"support"`.

- **addressCity / addressRegion / addressCountry / addressStreet / addressPostalCode**  
  - عبّئها قدر ما يتوفر من معلومات في فيسبوك (مدينة، منطقة، بلد…).  
  - في السعودية:  
    - `addressCountry` = `"SA"`  
    - `addressRegion` = اسم المنطقة (مثل: "منطقة مكة المكرمة").  

- **addressLatitude / addressLongitude (اختياري)**  
  - إن توفر موقع خرائط واضح، يمكن إضافته لتحسين Local SEO في JSON‑LD.

### 3.6 روابط السوشيال ميديا (Social Profiles / sameAs)

- في حقل `sameAs` أضِف الروابط التالية (كمصفوفة):
  - `https://www.facebook.com/abdelrhmanelmazny`  ← **مهم جدًا** لأنه الرابط الرئيس الذي نُحاكيه.  
  - أي حسابات أخرى رسمية (إن وُجدت): LinkedIn, Instagram, X…  

هذه الروابط تُستخدم في JSON‑LD كـ `Organization.sameAs` وتُساعد محركات البحث على التحقق من هوية الوكالة.

---

## 4. توافق الـ Meta و JSON‑LD مع مشاركة فيسبوك

نظام الـ SEO الحالي في مودونتي (انظر:  
`documents/seo/CLIENT-META-TAGS-RESEARCH.md` و  
`documents/perfect-jsonld-metatag/importatn-CLIENTS-PAGE-META-JSONLD-SPEC.md`) يتولّى تلقائيًا:

- **Open Graph Tags (لـ Facebook / LinkedIn)**  
  - `og:title` ← من `seoTitle`.  
  - `og:description` ← من `seoDescription`.  
  - `og:url` ← من رابط صفحة العميل (`/clients/[slug]` أو `canonicalUrl`).  
  - `og:image`, `og:image:width`, `og:image:height`, `og:image:alt` ← من `ogImageMedia` أو من الشعار كـ fallback.

- **Twitter Cards**  
  - `twitter:card` = `summary_large_image` عندما تتوفر صورة.  
  - `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt` ← من الحقول نفسها أو من الصور الافتراضية.

- **Organization JSON‑LD**  
  - يولّد كائن `Organization` كامل للعميل يتضمن: `name`, `legalName`, `url`, `logo`, `sameAs`, `contactPoint`, `address`, `vatID`, `taxID`, إلخ، استنادًا إلى الحقول المعبأة.

**النتيجة:** عندما تقوم بمشاركة رابط صفحة العميل في فيسبوك، سيستخدم فيسبوك نفس `og:title`, `og:description`, `og:image` المولَّدة من هذه الحقول، فتظهر بطاقة المعاينة قريبة جدًا من شكل مشاركة صفحة فيسبوك للأعمال.

---

## 5. قائمة تحقق: محاكاة صفحة فيسبوك للأعمال

استخدم هذه القائمة عند إعداد أي عميل (خاصة Elmazny) للتأكد من أن صفحة مودونتي تحاكي صفحة فيسبوك قدر الإمكان:

- **الهوية البصرية**
  - [ ] تم رفع شعار واضح في `logoMedia` بأبعاد لا تقل عن \(512×512\) وبـ alt مناسب.  
  - [ ] تم رفع صورة غلاف قوية في `ogImageMedia` بأبعاد قريبة من \(1200×630\) تعكس هوية العميل.  

- **المحتوى النصي**
  - [ ] تم ضبط `seoTitle` و `seoDescription` بنصوص جذابة وفق الحدود الموصى بها.  
  - [ ] تم كتابة `description` و `businessBrief` بنص أصلي يصف الوكالة وخدماتها (بدون نسخ حرفي من فيسبوك).  
  - [ ] تم تحديد `targetAudience` و `contentPriorities` لدعم كتابة محتوى متوافق مع شخصية العلامة.  

- **معلومات الاتصال والموقع**
  - [ ] تم إدخال `url` (الموقع الرسمي) لاستخدامه كزر CTA رئيسي في الـ Hero.  
  - [ ] تم إدخال `email` و `phone` بشكل صحيح ويمكن النقر عليهما.  
  - [ ] تم تعبئة حقول العنوان الرئيسية (مدينة، منطقة، بلد) بما يتوافق مع بيانات فيسبوك.  

- **روابط السوشيال**
  - [ ] حقل `sameAs` يتضمن على الأقل رابط صفحة فيسبوك الأصلية: `https://www.facebook.com/abdelrhmanelmazny`.  
  - [ ] تمت إضافة أي حسابات رسمية أخرى (LinkedIn, Instagram, X…) إن وُجدت.  

- **الدليل الاجتماعي**
  - [ ] هناك خطة لتوليد تفاعل (مشاهدات + متابعات) حتى تظهر إحصاءات `followers`, `articles`, `views` في الـ Hero.  
  - [ ] تم ربط العميل بمقالات ذات صلة (خدمات، دراسات حالة، عروض) تظهر في تبويب "المقالات".  

- **توافق الهيكل مع فيسبوك**
  - [ ] تبويب **نظرة عامة** في مودونتي يحتوي على أبرز المعلومات التي تظهر عادة في تبويب Home في فيسبوك.  
  - [ ] تبويب **معلومات** يحتوي على كل الحقول التعريفية (حول، بيانات الاتصال، العنوان…).  
  - [ ] تبويب **المقالات** يُستخدم كبديل لمنشورات الصفحة (Posts) لتثقيف العميل وشرح الخدمات.  

- **مراجعة معاينة المشاركة (Share Preview)**
  - [ ] تم اختبار مشاركة رابط صفحة العميل في فيسبوك وتأكدت من أن الصورة والعنوان والوصف تظهر بشكل صحيح.  
  - [ ] تم فحص الـ Meta و JSON‑LD عبر أدوات مثل Rich Results Test / OpenGraph Debugger عند الحاجة.  

عند اكتمال جميع العناصر أعلاه، تكون صفحة العميل في مودونتي قد وصلت إلى مستوى محاكاة عالي جدًا لصفحة فيسبوك للأعمال، مع الحفاظ على تصميم مودونتي وخصائصه التقنية والـ SEO المتقدم.

