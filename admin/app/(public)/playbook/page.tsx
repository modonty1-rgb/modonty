import { ModontyMark } from "@modonty/shared/components/icons/modonty-mark";

import { ModontyPhilosophyMap } from "./components/modonty-philosophy-map";
import { ModontySurfacesMap } from "./components/modonty-surfaces-map";
import { ModontyValues } from "./components/modonty-values";

export const metadata = { title: "ما هي مدونتي؟" };

/**
 * صفحة هويّة لا صفحة تشغيل: فلسفتنا · قيمنا · قصة الشعار · هيكل المنظومة.
 * ما كان فيها من مقارنة وتسعير انتقل إلى `sales/compare`، ودفتر الوعود إلى
 * `sales/what-we-sell`، والرحلة والأدوار إلى `roles` (خالد، ١٢ سبتمبر ٢٠٢٦).
 * ولذلك لا قراءة من القاعدة هنا — كان استدعاء التسعير يعمل في كل زيارة ونتيجته لا تُعرض.
 */
export default function PlaybookHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-6" dir="rtl">
      {/*
        الشارة «PLAYBOOK · 01» حُذفت وذاب معناها في النصّ (خالد، ١٢ سبتمبر ٢٠٢٦):
        وسمٌ إنجليزيّ فوق عنوان عربيّ كان يقول «هذه صفحة تعريف» بلغة لا يقرأها الموظّف الجديد.
        الجملة الأولى تقول الشيء نفسه بالعربية، وتُفيد من يقرأ ومن يُقارَن به.
      */}
      <header className="rounded-xl border bg-card p-5">
        <h1 className="text-xl font-bold">ما هي مدونتي؟</h1>

        <p className="mt-3 max-w-4xl border-s-2 border-primary ps-3 text-[15.5px] font-bold leading-8">
          مدونتي منظومة عربية سعودية، تربط الباحث عن معلومة بالخبير الذي يعرفها،
          وبالشريك الذي يقدّم حلّها، تحت سقف واحد موثّق.
        </p>

        {/*
          التعريف مأخوذ من مدونتي نفسها لا من وصف مكتوب هنا (خالد، ١٢ سبتمبر ٢٠٢٦:
          «ادرس مدونتي… اديني الحقيقة»). المصادر:
          · modonty/messages/ar.json → about.hero (منظومة عربية سعودية · نربط الباحث…)
          · نفس الملف → about.cornerstones (الركائز الثلاث) و becomePartner (عملاء من جوجل بلا إعلانات)
          · نفس الملف → modonty.story (بدأت من تجربة إعلانات مدفوعة · رؤية ٢٠٣٠ · السعودية ثم مصر ثم الخليج)
          · مسارات modonty/app → الأبواب المذكورة أدناه، كلٌّ صفحة قائمة لا خطّة

          «منصة محتوى عربية» حُذفت: كانت توحي بأننا نكتب مقالات فقط، والمقال بابٌ من أبوابها.
        */}
        {/*
          ترتيب الفقرات: السبب أوّلًا ثم ما بُني عليه (خالد، ١٢ سبتمبر ٢٠٢٦).
          «بدأنا…» كانت آخر فقرة، وهي أقوى ما في الكتلة وأكثره التصاقًا بالذهن،
          فكانت تصل بعد أن يكون القارئ قد فرغ انتباهه. صارت المدخل، وما بعدها شرحٌ لها.

          صُحّح فيها: «مع كل مقال» كانت تناقض «المقال باب واحد من أبوابها»،
          و«هذين السوقين» تعود على ثلاثة أسواق لا اثنين.
        */}
        <div className="mt-3 max-w-4xl space-y-3 text-sm leading-7 text-muted-foreground">
          <p>
            <b className="font-bold text-foreground">بدأنا</b> لأن الإعلان المدفوع يُطفأ يوم تتوقّف ميزانيته،
            فبنينا ما يتراكم بدل ما ينطفئ: عملاء من البحث بلا إعلانات.
            {" "}<b className="font-bold text-foreground">ونتّجه</b> من السعودية إلى مصر ثم الخليج،
            لنصير المرجع العربي الأوثق حين يبحث الناس عن خبير يثقون به.
            {" "}<b className="font-bold text-foreground">ونعمل كل يوم</b> على محتوى عربي متخصّص يفهم هذه الأسواق،
            ويستهدف بحثًا خلفه نيّة شراء لا فضول.
          </p>
          {/*
            كانت هذه الفقرة تعدّ الأبواب عدًّا، ثم صارت رحلةً تمشي بالترتيب نفسه — وكلتاهما
            فهرس (خالد، ١٢ سبتمبر ٢٠٢٦: «القصة مملة… وطويلة»). القصّة تحتاج منعطفًا لا جردًا،
            فبُنيت على السؤال الذي يأتي بعد الإجابة: «ومن كتب هذا؟» — وهو بالضبط ما تبيعه مدونتي.
            حُذف منها عدّ الأقسام التسعة والمجالات والوسوم؛ مكانها بطاقة PAGE-01 في دفتر الوعود.
          */}
          <p>
            وهذا البحث يبدأ هكذا: سؤالٌ في منتصف الليل، وإجابةٌ تنتظره في مقال على مدونتي.
            لكن السؤال الحقيقي يأتي بعد
            الإجابة: ومن كتب هذا؟ هنا يفترق الطريق. اسم الجهة تحت المقال، وضغطةٌ واحدة تفتح صفحتها
            الرسمية: خدماتها، وأعمالها، وآراء من جرّبها، وأوراقها الرسمية أمامه لا خلف بريد
            إلكتروني. يتصفّح، ثم يحجز موعده أو يشتري من مكانه.
            {" "}<b className="font-bold text-foreground">الناس لا تنقصها إجاباتٌ على الإنترنت،
            ينقصها أن تعرف من وراءها.</b>
          </p>
          <p>
            ولذلك ثلاثٌ لا نتنازل عنها:
            {" "}<b className="font-bold text-foreground">بيت رقمي</b> باسم الشريك لا صفحة ضيف،
            {" "}<b className="font-bold text-foreground">وجدار ثقة</b> من أوراقه الرسمية يراه الزائر قبل أن يقرّر،
            {" "}<b className="font-bold text-foreground">وأرقام حقيقية</b> تصله لحظة بلحظة لا تقديرات.
          </p>
        </div>
      </header>

      {/*
        الفلسفة قسمٌ قائم بذاته لا سطرٌ في المقدّمة (خالد، ١٢ سبتمبر ٢٠٢٦).
        كانت في «القواعد الذهبية» بوصفها سلاح بيع (القاعدة ٢٠)، و client-setup/page.tsx:38
        يكتب القاعدة صراحةً: ما يوصّف مدونتي نفسها — تعريفها وفلسفتها وهويتها — مكانه هنا.
        والمصدر الرسمي يسمّيها فلسفةً لا سلاحًا: modonty/messages/ar.json → modonty.story،
        فصلٌ عنوانه «فلسفتنا». بقي في المبيعات السيناريو والحساب، وحُذف منها شرح الفلسفة.
      */}
      <section className="mt-8 scroll-mt-6" id="philosophy">
        {/*
          البطاقة مرّت بثلاث تصحيحات بصرية في جلسة واحدة (خالد، ١٢ سبتمبر ٢٠٢٦):
          · ثلاث محاذيات في بطاقة واحدة → التوسيط للحديث وحده لأنه اقتباس، وما عداه يمينًا.
          · أعمدة بلا فاصل تسيل في بعضها → خطّ رأسيّ خفيف على الشاشات العريضة.
          · شارة وترويسة معلّقتان فوق البطاقة → دخلتا داخلها، وسقط معهما الترقيم.

          وآخرها «أناقة وبساطة ومريح للعين»: رُفعت الأشرطة الملوّنة، لأن كل شريط لونٍ
          حدٌّ إضافي تراه العين. الفصل بخطٍّ خفيف بنصف الشدّة، وظلٌّ يرفع البطاقة عن الخلفية.

          والهوامش ضُيّقت بعدها مباشرةً: كنت وسّعتها باسم «التنفّس» فانتفخت البطاقة
          (خالد: «ما هو هذا مستند، الواحد بيقراه محتاج عينه ترتاح»). المستند يُقرأ لا
          يُتأمَّل، وراحة العين فيه من قِصَر المسافة بين السطر والسطر لا من اتّساعها.
        */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 px-4 pt-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ModontyMark className="text-[19px]" />
            </span>
            <div>
              <h2 className="text-[17px] font-bold leading-6">فلسفتنا</h2>
              <p className="text-[12.5px] leading-5 text-muted-foreground">الفكرة التي يقوم عليها كل ما تقرأه بعدها.</p>
            </div>
          </div>

          <div className="px-4 py-5 text-center">
            <p className="text-[16px] font-bold leading-8 text-primary">
              «المؤمن للمؤمن كالبنيان يشدّ بعضه بعضًا»
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">رواه البخاري عن أبي موسى الأشعري</p>
          </div>

          <div className="border-t border-border/60">
            <ModontyPhilosophyMap />
          </div>

          <p className="border-t border-border/60 px-4 py-3.5 text-[13px] leading-6 text-muted-foreground">
            ولذلك لا نبيع مساحةً على نطاق، بل عضويةً في بنيان. وهذا ما لا يستطيع منافس صغير تقليده:
            يحتاج مئة شريك قبله ليبدأ بناء ما بنيناه.
          </p>
        </div>
      </section>

      {/*
        كانت «قيمنا وقصة شعارنا» قسمًا واحدًا بحرف عطف في عنوانه، وحرف العطف في العنوان
        علامةُ أنّ تحته موضوعين (خالد، ١٢ سبتمبر ٢٠٢٦). فُصلا، وأخذ كلٌّ هيئة بطاقة
        الفلسفة نفسها: ترويسة داخل البطاقة بأيقونة من أيقونات مدونتي، لا شارة معلّقة فوقها.
      */}
      <section className="mt-8 scroll-mt-6" id="values">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 px-4 pt-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ModontyMark className="text-[19px]" />
            </span>
            <h2 className="text-[17px] font-bold leading-6">قيمنا</h2>
          </div>
          <div className="mt-4 border-t border-border/60">
            <ModontyValues />
          </div>
        </div>
      </section>

      {/*
        كان القسم ثلاثة أعمدة متساوية بخطوط ممتدّة من حافة إلى حافة، فوقها وتحتها شرائط
        أفقية — أي جدول (خالد، ١٢ سبتمبر ٢٠٢٦). صار قصّة تُقرأ: فقرةٌ واحدة، ثم ثلاث
        وقفات يسبق كلًّا منها معيَّنُ العلامة، ثم الجملة التي تُحفظ.
        وسقط سطر «جوابٌ يُقال للشريك حين يسأل» لأنه يصف الصفحة لا يقول شيئًا فيها.
      */}
      <section className="mt-8 scroll-mt-6" id="logo-story">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 px-4 pt-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ModontyMark className="text-[19px]" />
            </span>
            <h2 className="text-[17px] font-bold leading-6">قصة الشعار</h2>
          </div>

          <div className="px-5 pb-5 pt-4">
            <p className="max-w-3xl text-[13.5px] leading-7 text-muted-foreground">
              النقطة الصغيرة في الشعار ليست زخرفة، بل القصة كلها: كل نصّ في العالم يبدأ بنقطة
              وينتهي بنقطة. أول حركة قلم على ورق نقطة، وآخر علامة في الجملة نقطة، والذرّة الأولى
              لأي محتوى مكتوب نقطة.
            </p>

            <div className="mt-5 max-w-3xl space-y-2.5">
              {[
                ["تذكير", "كل ما نصنعه يبدأ من النقطة الأولى: مقالًا كان أو منصّة أو قرارًا. لا اختصارات."],
                ["وعد", "كل مقال نكتبه يصل نقطته الأخيرة بإتقان. لا تسليم ناقص ولا منتصف طريق."],
                ["أساس", "مهما كبر البنيان يبقى مبنيًّا نقطةً فوق نقطة."],
              ].map(([title, body]) => (
                <p key={title} className="flex gap-2.5 text-[13px] leading-6 text-muted-foreground">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] bg-[#00d8d8]/70" />
                  <span>
                    <b className="font-bold text-foreground">{title}:</b> {body}
                  </span>
                </p>
              ))}
            </div>

            <p className="mt-5 text-[14.5px] font-bold leading-7 text-primary">
              «من النقطة الأولى إلى النقطة الأخيرة — كل قصة، وكل مقال، وكل شريك.»
            </p>
          </div>
        </div>
      </section>

      {/* بهيئة الأقسام الثلاثة قبله: ترويسة داخل البطاقة بأيقونة مدونتي، لا عنوان عارٍ فوق صندوق. */}
      <section className="mt-8 scroll-mt-6" id="surfaces">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 px-4 pt-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ModontyMark className="text-[19px]" />
            </span>
            <h2 className="text-[17px] font-bold leading-6">هيكل المنظومة</h2>
          </div>
          <div className="mt-4 border-t border-border/60">
            <ModontySurfacesMap />
          </div>
        </div>
      </section>
    </div>
  );
}
