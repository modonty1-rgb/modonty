"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import { CheckCircle2, AlertCircle, Image as ImageIcon, Monitor, XCircle, MapPin } from "lucide-react";

interface AppearanceItem {
  where: string;
  fit: "contain" | "cover";
  shape: string;
  note?: string;
}

interface ImageSpec {
  type: string;
  label: string;
  labelAr: string;
  width: number;
  height: number;
  ratio: string;
  format: string;
  maxSize: string;
  usage: string;
  objectFit: "contain" | "cover";
  required: boolean;
  safeZone: string;
  appearances: AppearanceItem[];
  note?: string;
}

const imageStandards: ImageSpec[] = [
  {
    type: "featured",
    label: "Featured Image",
    labelAr: "الصورة الرئيسية للمقال",
    width: 1920,
    height: 1080,
    ratio: "16:9",
    format: "WebP / JPG",
    maxSize: "500 KB",
    usage: "الصورة الكبيرة اللي تظهر أعلى كل مقال. لازم تكون عريضة — مثل شاشة التلفزيون بالضبط.",
    objectFit: "contain",
    required: true,
    safeZone: "المنتصف — المربع المركزي 50% يظهر دائماً. في بعض الأماكن تُقطع كمربع.",
    note: "⚠️ نفس الصورة تظهر كـ 16:9 في صفحة المقال، وكمربع مقطوع في أماكن أخرى",
    appearances: [
      { where: "صفحة المقال — أعلى الصفحة (Hero)", fit: "contain", shape: "16:9 كاملة — بدون قص" },
      { where: "بطاقة المقال في القوائم والتصفح", fit: "cover", shape: "16:9 — قص خفيف من الجوانب" },
      { where: "قسم «مقالات أخرى» في الشريط الجانبي", fit: "cover", shape: "مربع 1:1 — قص من كل الجوانب", note: "⚠️ تظهر كمربع هنا" },
      { where: "صفحة العميل — معرض صور المقالات", fit: "cover", shape: "مربع 1:1 — قص من كل الجوانب", note: "⚠️ تظهر كمربع هنا" },
    ],
  },
  {
    type: "client-logo",
    label: "Client Logo",
    labelAr: "لوجو العميل",
    width: 500,
    height: 500,
    ratio: "1:1",
    format: "SVG / PNG",
    maxSize: "50 KB",
    usage: "يظهر بجانب اسم العميل في كل مقال وقائمة. لازم يكون مربع تماماً وبخلفية شفافة.",
    objectFit: "contain",
    required: true,
    safeZone: "المنتصف — الشعار يظهر كاملاً دائماً، يصغر حسب المكان.",
    note: "⚠️ PNG بخلفية شفافة فقط. JPG تُظهر مربع أبيض حول الشعار.",
    appearances: [
      { where: "بطاقة المقال — بجانب اسم العميل", fit: "contain", shape: "دائرة 40×40 px" },
      { where: "شريط جانبي المقال — مع غلاف العميل", fit: "contain", shape: "دائرة 56×56 px" },
      { where: "شريط جانبي المقال — بدون غلاف", fit: "contain", shape: "دائرة 80×80 px" },
      { where: "صفحة قائمة العملاء", fit: "contain", shape: "دائرة 80×80 px" },
      { where: "صفحة العميل — فوق الغلاف (أفاتار)", fit: "contain", shape: "دائرة 80-112 px" },
    ],
  },
  {
    type: "client-hero-cover",
    label: "Client Hero Cover",
    labelAr: "صورة غلاف صفحة العميل",
    width: 2400,
    height: 400,
    ratio: "6:1",
    format: "WebP / JPG",
    maxSize: "500 KB",
    usage: "البنر العريض اللي يظهر أعلى صفحة العميل. يمتد على عرض الشاشة كاملاً — مثل غلاف تويتر.",
    objectFit: "cover",
    required: false,
    safeZone: "المنتصف — الجوانب قد تُقطع على الشاشات الصغيرة. لا تحط نصوص.",
    note: "⚠️ لا تحط نصوص أو أرقام داخل الصورة. النظام يُضيف نص تلقائياً فوقها.",
    appearances: [
      { where: "صفحة العميل — بنر أعلى الصفحة (Hero)", fit: "cover", shape: "6:1 — يمتد عرض الشاشة" },
      { where: "الشريط الجانبي للمقال — بطاقة العميل", fit: "cover", shape: "16:9 — مقطوع من الأعلى والأسفل", note: "⚠️ يُقطع بشكل مختلف هنا" },
    ],
  },
  {
    type: "category",
    label: "Category Image",
    labelAr: "صورة الفئة",
    width: 600,
    height: 600,
    ratio: "1:1",
    format: "WebP / JPG",
    maxSize: "150 KB",
    usage: "تظهر في صفحة الفئة. حجمها الفعلي صغير — ارفع نسخة عالية الجودة والنظام يصغّرها.",
    objectFit: "cover",
    required: false,
    safeZone: "المنتصف — تظهر مرة كمربع ومرة كـ 16:9 حسب الجهاز.",
    appearances: [
      { where: "قائمة الفئات — بطاقة الفئة (موبايل وتابلت)", fit: "cover", shape: "16:9" },
      { where: "صفحة الفئة — رأس الصفحة (ديسكتوب)", fit: "cover", shape: "مربع 192×192 px" },
    ],
  },
  {
    type: "author-avatar",
    label: "Author Avatar",
    labelAr: "صورة الكاتب",
    width: 256,
    height: 256,
    ratio: "1:1",
    format: "JPG / PNG",
    maxSize: "50 KB",
    usage: "صورة الكاتب اللي تظهر في صفحات المقالات. لازم تكون مربعة — وجه الشخص في المنتصف.",
    objectFit: "cover",
    required: false,
    safeZone: "المنتصف — الوجه لازم في المنتصف. الحواف دائماً مقطوعة في دائرة.",
    appearances: [
      { where: "صفحة المقال — بيانات الكاتب", fit: "cover", shape: "دائرة 40-56 px" },
      { where: "بطاقة المقال — أيقونة صغيرة", fit: "cover", shape: "دائرة 24-32 px" },
      { where: "صفحة الكاتب — أعلى الصفحة", fit: "cover", shape: "دائرة 80-96 px" },
    ],
  },
  {
    type: "og",
    label: "OG / Social Image",
    labelAr: "صورة مشاركة الرابط",
    width: 1200,
    height: 630,
    ratio: "1.91:1",
    format: "JPG / PNG",
    maxSize: "300 KB",
    usage: "تظهر لما أحد يشارك رابط المقال في واتساب أو تويتر أو لينكدإن. مقاسها ثابت ما يتغير.",
    objectFit: "cover",
    required: true,
    safeZone: "المنتصف — هذه الصورة للمشاركة فقط، لا تظهر على الموقع مباشرة.",
    appearances: [
      { where: "واتساب / تويتر / لينكدإن — معاينة الرابط", fit: "cover", shape: "1200×630 — خارج الموقع فقط" },
    ],
  },
  {
    type: "gallery",
    label: "Gallery Image",
    labelAr: "صور معرض المقال",
    width: 1200,
    height: 675,
    ratio: "16:9",
    format: "WebP / JPG",
    maxSize: "200 KB",
    usage: "صور إضافية داخل المقال تظهر في شبكة. الحواف قد تُقطع — حط الشيء المهم في المنتصف.",
    objectFit: "cover",
    required: false,
    safeZone: "المنتصف — تظهر في شبكة مربعة أو مستطيلة، الحواف مقطوعة دائماً.",
    appearances: [
      { where: "صفحة المقال — معرض الصور داخل المحتوى", fit: "cover", shape: "شبكة 16:9 أو مربعة حسب عدد الصور" },
    ],
  },
];

const designRules = [
  { rule: "كل صور المقالات: عريضة 16:9", detail: "الصورة الرئيسية، صورة البطاقة، صور المعرض — كلها لازم تكون بمقاس التلفزيون (عريضة)" },
  { rule: "كل الأيقونات والشعارات: مربع 1:1", detail: "لوجو العميل، صورة الكاتب، صورة الفئة — كلها مربعة تماماً" },
  { rule: "غلاف صفحة العميل فقط: بنر عريض جداً 6:1", detail: "هذا البنر مختلف عن باقي الصور — عريض مثل غلاف تويتر أو لينكدإن" },
  { rule: "لوجو وأيقونات: PNG بخلفية شفافة دائماً", detail: "لو رفعت JPG ستظهر مربع أبيض حول الشعار. PNG الشفاف يندمج مع أي خلفية" },
  { rule: "لا تكتب نصوص داخل الصورة", detail: "الأسماء والعناوين والأرقام تُضاف تلقائياً من النظام — الصورة تكون فارغة من النصوص" },
  { rule: "لا ترفع صور صغيرة", detail: "الحد الأدنى 1280px عرض لصور المقالات. الصور الصغيرة تظهر ضبابية على الشاشات الكبيرة" },
];

const commonMistakes = [
  { wrong: "رفعت صورة طويلة وضيقة كـ Featured Image فظهرت شرائط بيضاء", right: "الصورة الرئيسية لازم 16:9 — مثل (1920×1080)" },
  { wrong: "رفعت لوجو مستطيل (مثل 500×100) فظهر مشوّه", right: "اللوجو لازم مربع 1:1 — اجعله (500×500) مع padding شفاف" },
  { wrong: "رفعت لوجو JPG فظهر بخلفية بيضاء مربعة", right: "دائماً PNG بخلفية شفافة للشعارات والأيقونات" },
  { wrong: "رفعت نفس الصورة الرئيسية كغلاف صفحة العميل فظهرت محاصرة", right: "غلاف صفحة العميل مختلف — يحتاج بنر عريض جداً (2400×400)" },
  { wrong: "كتبت اسم العميل أو رقم هاتف داخل الصورة", right: "الصورة فارغة من النصوص — النظام يضيف كل شيء تلقائياً" },
  { wrong: "الصورة الرئيسية فيها نص أو وجه على الحافة اليسرى أو اليمنى", right: "الشيء المهم في المنتصف دائماً — الجوانب تُقطع في بعض الأماكن" },
];

function ImageCard({ img }: { img: ImageSpec }) {
  const maxW = 200;
  const maxH = 130;
  const aspectW = img.width;
  const aspectH = img.height;
  const scaleW = maxW / aspectW;
  const scaleH = maxH / aspectH;
  const scale = Math.min(scaleW, scaleH);
  const displayW = Math.round(aspectW * scale);
  const displayH = Math.round(aspectH * scale);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 flex flex-col items-start gap-3">
        {/* Visual aspect ratio preview */}
        <div
          className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center relative self-center"
          style={{ width: displayW, height: displayH, minHeight: 36 }}
        >
          <ImageIcon className="h-5 w-5 text-muted-foreground/30 absolute" />
          <div className="absolute bottom-1 end-1.5">
            <code className="text-[9px] bg-background/80 backdrop-blur px-1 py-0.5 rounded text-muted-foreground">
              {img.width} × {img.height}
            </code>
          </div>
          <div className="absolute top-1 start-1.5">
            <span className="text-[9px] bg-background/80 backdrop-blur px-1 py-0.5 rounded text-muted-foreground">
              {img.ratio}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between gap-1">
            <div>
              <h3 className="font-semibold text-sm leading-tight">{img.label}</h3>
              <p className="text-[10px] text-muted-foreground">{img.labelAr}</p>
            </div>
            {img.required ? (
              <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500 shrink-0">مطلوب</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground shrink-0">اختياري</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{img.usage}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{img.format}</code>
            <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">max {img.maxSize}</code>
            <Badge
              variant="outline"
              className={img.objectFit === "contain"
                ? "text-[10px] border-blue-500/30 text-blue-500"
                : "text-[10px] border-orange-500/30 text-orange-500"
              }
            >
              {img.objectFit}
            </Badge>
          </div>

          {/* Safe zone */}
          <div className="flex items-start gap-1.5 p-2 rounded bg-amber-500/[0.06] border border-amber-500/20">
            <MapPin className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-600 leading-relaxed">{img.safeZone}</p>
          </div>

          {/* Appearances */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">أين تظهر هذه الصورة</p>
            {img.appearances.map((a, i) => (
              <div key={i} className="flex items-start gap-1.5 py-1 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  <Badge
                    variant="outline"
                    className={a.fit === "contain"
                      ? "text-[9px] px-1 py-0 border-blue-500/30 text-blue-500"
                      : "text-[9px] px-1 py-0 border-orange-500/30 text-orange-500"
                    }
                  >
                    {a.fit}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-foreground leading-tight">{a.where}</p>
                  <p className="text-[9px] text-muted-foreground">{a.shape}</p>
                  {a.note && <p className="text-[9px] text-amber-500">{a.note}</p>}
                </div>
              </div>
            ))}
          </div>

          {img.note && (
            <p className="text-[10px] text-amber-500/90 leading-relaxed">{img.note}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function MediaGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Media & Image Standards"
      description="المقاسات المعتمدة وأفضل الممارسات — مرجع لفريق التصميم والمحتوى"
    >
      {/* Safe Zone — visual diagram */}
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">المنطقة الآمنة — Safe Zone</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            نفس صورتك تظهر في أشكال مختلفة. الشيء المهم دائماً في المنتصف — الحواف تُقطع في بعض الأماكن
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Visual diagram */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* 16:9 safe zone diagram */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <p className="text-xs font-semibold text-muted-foreground">صورة المقال الرئيسية 16:9</p>
              <div
                className="relative rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 overflow-hidden"
                style={{ width: 240, height: 135 }}
              >
                {/* outer - full image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] text-muted-foreground/50 absolute top-1 start-1.5">1920×1080</span>
                  <span className="text-[9px] text-muted-foreground/40 absolute bottom-1 end-1.5">تُقطع هنا في القوائم</span>
                </div>
                {/* left cut zone */}
                <div className="absolute inset-y-0 start-0 w-[12.5%] bg-red-500/10 border-e border-red-500/30" />
                {/* right cut zone */}
                <div className="absolute inset-y-0 end-0 w-[12.5%] bg-red-500/10 border-s border-red-500/30" />
                {/* top cut zone for square */}
                <div className="absolute inset-x-0 top-0 h-[18.75%] bg-orange-500/10 border-b border-orange-500/30" />
                {/* bottom cut zone for square */}
                <div className="absolute inset-x-0 bottom-0 h-[18.75%] bg-orange-500/10 border-t border-orange-500/30" />
                {/* safe center */}
                <div
                  className="absolute rounded border-2 border-emerald-500/60 bg-emerald-500/10 flex items-center justify-center"
                  style={{ top: "18.75%", bottom: "18.75%", left: "12.5%", right: "12.5%" }}
                >
                  <span className="text-[9px] text-emerald-600 font-semibold">✓ آمن</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/20 inline-block" /> تُقطع في القوائم</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-500/20 inline-block" /> تُقطع كمربع</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/20 inline-block" /> آمن دائماً</span>
              </div>
            </div>

            {/* Rules text */}
            <div className="flex-1 space-y-3">
              <div className="p-3 rounded-lg border bg-card space-y-2">
                <p className="text-xs font-semibold">🟢 الصورة الرئيسية للمقال (Featured Image)</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• في صفحة المقال: تظهر <strong>كاملة</strong> بنسبة 16:9 بدون قص</li>
                  <li>• في القوائم والبطاقات: الجوانب تُقطع قليلاً (cover)</li>
                  <li>• في الشريط الجانبي وصفحة العميل: تُقطع كـ <strong>مربع كامل</strong></li>
                  <li className="text-amber-500">⚠️ الوجه أو الشيء المهم: في المنتصف دائماً</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg border bg-card space-y-2">
                <p className="text-xs font-semibold">🟢 اللوجو والأيقونات (1:1)</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• تظهر دائماً كاملة (contain) — لكن بأحجام مختلفة</li>
                  <li>• من 24px دائرة صغيرة إلى 112px أفاتار صفحة العميل</li>
                  <li className="text-amber-500">⚠️ الشعار في المنتصف مع مساحة padding حول الحواف</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Cards */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">مقاسات الصور المعتمدة — وأين تظهر كل صورة</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            هذه المقاسات مأخوذة من الكود مباشرة — لكل صورة قائمة بكل مكان تظهر فيه على الموقع
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {imageStandards.map((img) => (
              <ImageCard key={img.type} img={img} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">جدول مرجعي سريع</CardTitle>
          <p className="text-xs text-muted-foreground">نسخة مختصرة — ارسلها للمصمم مع كل طلب تصميم</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-start py-2 pe-4 font-semibold text-muted-foreground">الصورة</th>
                  <th className="text-start py-2 pe-4 font-semibold text-muted-foreground">النسبة</th>
                  <th className="text-start py-2 pe-4 font-semibold text-muted-foreground">المقاس</th>
                  <th className="text-start py-2 pe-4 font-semibold text-muted-foreground">الظهور</th>
                  <th className="text-start py-2 pe-4 font-semibold text-muted-foreground">المنطقة الآمنة</th>
                  <th className="text-start py-2 font-semibold text-muted-foreground">الفورمات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {imageStandards.map((img) => (
                  <tr key={img.type} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2 pe-4">
                      <span className="font-medium">{img.label}</span>
                      <span className="block text-[10px] text-muted-foreground">{img.labelAr}</span>
                    </td>
                    <td className="py-2 pe-4">
                      <code className="bg-muted px-1.5 py-0.5 rounded">{img.ratio}</code>
                    </td>
                    <td className="py-2 pe-4">
                      <code className="bg-muted px-1.5 py-0.5 rounded">{img.width} × {img.height}</code>
                    </td>
                    <td className="py-2 pe-4">
                      <span className="text-[10px] text-muted-foreground">{img.appearances.length} أماكن</span>
                    </td>
                    <td className="py-2 pe-4">
                      <span className="text-[10px] text-amber-600">{img.safeZone.split("—")[0].trim()}</span>
                    </td>
                    <td className="py-2">
                      <code className="text-[10px] text-muted-foreground">{img.format}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Object Fit Explanation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">كيف تظهر صورتك على الموقع؟</CardTitle>
          <p className="text-xs text-muted-foreground">قاعدتان فقط — احفظهما وما راح تغلط</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/[0.03] space-y-2">
              <Badge variant="outline" className="border-blue-500/30 text-blue-500">contain — الصورة الرئيسية + اللوجوهات</Badge>
              <p className="text-sm font-semibold">الصورة تظهر كاملة بدون قص</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                النظام يعرض صورتك كاملة دائماً. لو مقاسها غلط ستظهر
                <strong className="text-amber-400"> أشرطة بيضاء</strong> على الجوانب.
                الأشرطة البيضاء = تحذير أن المقاس غلط — غيّر الصورة.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/[0.03] space-y-2">
              <Badge variant="outline" className="border-orange-500/30 text-orange-500">cover — البطاقات + الغلاف + المعرض</Badge>
              <p className="text-sm font-semibold">الصورة تملأ الإطار — الحواف قد تُقطع</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                الصورة تملأ المساحة بالكامل لكن الحواف قد تُقطع.
                <strong className="text-orange-400"> الشيء المهم في صورتك حطّه في المنتصف دائماً</strong> — الوجه، اللوجو، المنتج.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Rules */}
      <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">قواعد لازم تعرفها قبل ما ترفع أي صورة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {designRules.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.rule}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Common Mistakes */}
      <Card className="border-red-500/20 bg-red-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <CardTitle className="text-base">أخطاء شائعة — شوف المشكلة وحلّها</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {commonMistakes.map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 py-2 border-b border-border/40 last:border-0">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">{item.wrong}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground">{item.right}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alt Text Guide */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">كيف تكتب Alt Text صحيح؟</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03]">
              <p className="text-xs font-semibold text-emerald-600 mb-2">صحيح</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>&quot;فريق عمل شركة مدونتي في اجتماع تخطيط المحتوى&quot;</li>
                <li>&quot;شعار شركة أرامكو السعودية بخلفية شفافة&quot;</li>
                <li>&quot;رسم بياني يوضح نمو عدد المقالات في 2025&quot;</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/[0.03]">
              <p className="text-xs font-semibold text-red-500 mb-2">خطأ</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>&quot;صورة&quot; — غير وصفي</li>
                <li>&quot;IMG_20250101_123456.jpg&quot; — اسم ملف</li>
                <li>&quot;صورة صورة صورة شعار شعار&quot; — حشو كلمات</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
