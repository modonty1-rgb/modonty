"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import { CheckCircle2, AlertCircle, Image as ImageIcon, Monitor, Smartphone, Share2 } from "lucide-react";

interface ImageSpec {
  type: string;
  label: string;
  width: number;
  height: number;
  ratio: string;
  format: string;
  maxSize: string;
  usage: string;
  required: boolean;
  color: string;
}

const imageStandards: ImageSpec[] = [
  {
    type: "featured",
    label: "Featured Image",
    width: 1200,
    height: 630,
    ratio: "1.91:1",
    format: "WebP / JPG",
    maxSize: "200 KB",
    usage: "صورة المقال الرئيسية — تظهر في رأس المقال ونتائج البحث والسوشال",
    required: true,
    color: "emerald",
  },
  {
    type: "og",
    label: "OG Image",
    width: 1200,
    height: 630,
    ratio: "1.91:1",
    format: "JPG / PNG",
    maxSize: "300 KB",
    usage: "صورة المشاركة — تظهر عند مشاركة الرابط في Facebook, LinkedIn, WhatsApp",
    required: true,
    color: "blue",
  },
  {
    type: "twitter",
    label: "Twitter Image",
    width: 1200,
    height: 600,
    ratio: "2:1",
    format: "JPG / PNG",
    maxSize: "300 KB",
    usage: "تظهر عند مشاركة الرابط في Twitter/X",
    required: false,
    color: "sky",
  },
  {
    type: "logo",
    label: "Logo",
    width: 400,
    height: 400,
    ratio: "1:1",
    format: "SVG / PNG",
    maxSize: "50 KB",
    usage: "شعار العميل — يظهر بجانب اسم العميل في المقالات والقوائم",
    required: true,
    color: "violet",
  },
  {
    type: "hero",
    label: "Hero Image",
    width: 1200,
    height: 630,
    ratio: "1.91:1",
    format: "WebP / JPG",
    maxSize: "250 KB",
    usage: "صورة الصفحة الرئيسية — صفحات مدونتي (من نحن، الشروط...)",
    required: false,
    color: "amber",
  },
  {
    type: "avatar",
    label: "Avatar",
    width: 200,
    height: 200,
    ratio: "1:1",
    format: "JPG / PNG",
    maxSize: "30 KB",
    usage: "صورة الكاتب — تظهر في المقالات وصفحة الكاتب",
    required: false,
    color: "pink",
  },
  {
    type: "gallery",
    label: "Gallery Image",
    width: 1200,
    height: 800,
    ratio: "3:2",
    format: "WebP / JPG",
    maxSize: "200 KB",
    usage: "صور إضافية داخل المقال — معرض الصور",
    required: false,
    color: "orange",
  },
];

const cloudinaryRules = [
  { rule: "استخدم Cloudinary فقط لرفع الصور", detail: "النظام يحسّن الصور تلقائياً عند رفعها عبر Cloudinary" },
  { rule: "لا ترفع صور بدون ضغط", detail: "Cloudinary يضيف q_auto,f_auto تلقائياً — لا تحتاج ضغط يدوي" },
  { rule: "اكتب Alt Text لكل صورة", detail: "النص البديل مهم للوصول ولتحسين الظهور في بحث الصور" },
  { rule: "لا تستخدم نصوص داخل الصور", detail: "محركات البحث لا تقرأ النصوص في الصور — استخدم HTML بدلاً منها" },
  { rule: "تأكد من حقوق الصورة", detail: "استخدم صور مرخصة أو مملوكة فقط — تجنب صور بدون ترخيص" },
];

function ImageCard({ img }: { img: ImageSpec }) {
  // Scale to fit within a max width of ~240px for the preview
  const maxPreviewWidth = 240;
  const scale = Math.min(maxPreviewWidth / img.width, 1);
  const previewW = Math.round(img.width * scale);
  const previewH = Math.round(img.height * scale);
  // For very tall images (1:1), cap height
  const displayH = Math.min(previewH, 160);
  const displayW = Math.round((img.width / img.height) * displayH);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 flex flex-col items-center gap-3">
        {/* Visual aspect ratio preview */}
        <div
          className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center relative"
          style={{ width: displayW, height: displayH }}
        >
          <ImageIcon className="h-6 w-6 text-muted-foreground/30 absolute" />
          <div className="absolute bottom-1 end-1.5">
            <code className="text-[9px] bg-background/80 backdrop-blur px-1 py-0.5 rounded text-muted-foreground">
              {img.width} x {img.height}
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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{img.label}</h3>
            {img.required ? (
              <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500">مطلوب</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">اختياري</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{img.usage}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{img.format}</code>
            <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">max {img.maxSize}</code>
          </div>
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
      {/* Visual Image Cards */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">مقاسات الصور المعتمدة</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            هذه المقاسات ثابتة ومعتمدة — يرجى الالتزام بها في جميع الصور المرفوعة
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

      {/* Quick Reference for Designer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-500/20 bg-blue-500/[0.03]">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-sm">Social Media</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Facebook / LinkedIn</span>
                <code className="bg-muted px-1.5 py-0.5 rounded">1200 x 630</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Twitter/X</span>
                <code className="bg-muted px-1.5 py-0.5 rounded">1200 x 600</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">WhatsApp</span>
                <code className="bg-muted px-1.5 py-0.5 rounded">1200 x 630</code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-500/20 bg-violet-500/[0.03]">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="h-4 w-4 text-violet-500" />
              <span className="font-semibold text-sm">Branding</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Logo</span>
                <code className="bg-muted px-1.5 py-0.5 rounded">400 x 400</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avatar</span>
                <code className="bg-muted px-1.5 py-0.5 rounded">200 x 200</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Favicon</span>
                <code className="bg-muted px-1.5 py-0.5 rounded">32 x 32</code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-sm">Content</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Featured Image</span>
                <code className="bg-muted px-1.5 py-0.5 rounded">1200 x 630</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gallery</span>
                <code className="bg-muted px-1.5 py-0.5 rounded">1200 x 800</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hero Page</span>
                <code className="bg-muted px-1.5 py-0.5 rounded">1200 x 630</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cloudinary Rules */}
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">قواعد رفع الصور</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {cloudinaryRules.map((item, i) => (
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
                <li>&quot;شعار شركة أرامكو السعودية بخلفية بيضاء&quot;</li>
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
