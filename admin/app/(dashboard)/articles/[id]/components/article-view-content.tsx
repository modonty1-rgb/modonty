"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText, Link2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Article, ContentStats } from "../helpers/article-view-types";
import { getArticleLengthClassification } from "../helpers/article-view-helpers";
import { FieldLabel } from "./shared/field-label";

interface ArticleViewContentProps {
  article: Article;
  contentStats: ContentStats;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewContent({ article, contentStats, sectionRef }: ArticleViewContentProps) {

  const articleClassification = getArticleLengthClassification(contentStats.wordCount);

  return (
    <Card id="section-content" ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2 mb-2">
          <CardTitle className="text-3xl font-bold leading-tight text-right flex-1">{article.title}</CardTitle>
          <FieldLabel
            label=""
            fieldPath="article.title"
            fieldType="String"
          />
        </div>
        {article.excerpt && (
          <div className="flex items-center gap-2 mt-2">
            <CardDescription className="text-base leading-relaxed text-right flex-1">
              {article.excerpt}
            </CardDescription>
            <FieldLabel
              label=""
              fieldPath="article.excerpt"
              fieldType="String?"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4" dir="rtl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4 border-b">
          <Link2 className="h-4 w-4" />
          <span className="font-mono text-xs break-all">{article.slug}</span>
          <FieldLabel
            label=""
            fieldPath="article.slug"
            fieldType="String"
          />
        </div>

        <div className="flex items-center justify-between pb-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
                <Info className="h-3.5 w-3.5" />
                <span>دليل الطول الكامل</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto text-right" dir="rtl">
              <DialogHeader>
                <DialogTitle>دليل طول المقال - أفضل الممارسات (2025)</DialogTitle>
                <DialogDescription>
                  إرشادات شاملة بناءً على أفضل الممارسات الرسمية لمحركات البحث
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h3 className="font-semibold mb-3 text-sm">حالة المقال الحالية:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">التصنيف:</span>
                      <Badge className={cn(articleClassification.bgColor, articleClassification.color)}>
                        {articleClassification.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">عدد الكلمات:</span>
                      <span className="font-medium">{contentStats.wordCount.toLocaleString()} كلمة</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">النطاق الحالي:</span>
                      <span className="font-medium">{articleClassification.range}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">إرشادات الطول حسب نوع المحتوى:</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">المقالات الإخبارية</h4>
                        <Badge variant="outline" className="text-xs">750-1,500 كلمة</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        مناسبة للأخبار والتحديثات السريعة. ركز على الوضوح والإيجاز.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">مقالات الرأي</h4>
                        <Badge variant="outline" className="text-xs">1,000-1,500 كلمة</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        مناسبة للتعبير عن الآراء والتحليلات. وفر سياقاً كافياً لدعم وجهة نظرك.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">المقالات القياسية وأدلة التعليمات</h4>
                        <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900">1,500-2,500 كلمة</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-green-700 dark:text-green-300">الأفضل لـ SEO:</strong> هذا النطاق يحظى بتفضيل محركات البحث. يوفر عمقاً كافياً مع الحفاظ على جودة المحتوى.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">قوائم المقالات</h4>
                        <Badge variant="outline" className="text-xs">1,500-2,500 كلمة</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        مناسبة للمقالات القائمة. استخدم عناوين فرعية واضحة لكل عنصر.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">أدلة التعليمات الشاملة</h4>
                        <Badge variant="outline" className="text-xs">1,800-3,000 كلمة</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        مناسبة للشروحات التفصيلية. قسم المحتوى إلى خطوات واضحة.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">المقالات المتعمقة ودراسات الحالة</h4>
                        <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900">2,000-3,000 كلمة</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        مناسبة للمحتوى المتخصص. أضف بيانات وإحصائيات لدعم النقاط.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">المحتوى الأساسي والأدلة الشاملة</h4>
                        <Badge variant="outline" className="text-xs bg-indigo-100 dark:bg-indigo-900">3,000-5,000+ كلمة</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-indigo-700 dark:text-indigo-300">محتوى شامل:</strong> يوفر أقصى قيمة للقراء ومحركات البحث. استخدم فهرس وقائمة محتويات.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-3 text-sm">أفضل الممارسات العامة:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span><strong>الجودة أهم من الكمية:</strong> ركز على تقديم قيمة حقيقية للقراء بدلاً من ملء الكلمات</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span><strong>الحد الأدنى الموصى به:</strong> 300 كلمة على الأقل للمقالات الأساسية</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span><strong>النطاق الأمثل لـ SEO:</strong> 1,500-2,500 كلمة للمقالات القياسية</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span><strong>استخدم عناوين فرعية:</strong> قسم المحتوى الطويل إلى أقسام واضحة (H2, H3)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span><strong>أضف وسائط:</strong> الصور والرسوم البيانية تحسن التفاعل والوقت على الصفحة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span><strong>غطي الموضوع بشكل شامل:</strong> أجب على جميع الأسئلة المتعلقة بالموضوع</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span><strong>ركز على نية المستخدم:</strong> تأكد من أن المحتوى يلبي احتياجات القراء</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="font-semibold mb-3 text-sm">توصيات خاصة بحالتك الحالية:</h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {articleClassification.bestPractices.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  <p className="font-medium mb-1">ملاحظة مهمة:</p>
                  <p>
                    لا يوجد حد أدنى رسمي من Google لعدد الكلمات. ما يهم هو جودة المحتوى ومدى تلبية نية المستخدم.
                    استخدم هذه الإرشادات كدليل عام، ولكن ركز دائماً على تقديم قيمة حقيقية للقراء.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg border text-right" dir="rtl">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded cursor-help", articleClassification.bgColor, articleClassification.color)}>
                    {articleClassification.label}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-sm text-right" dir="rtl">
                  <div className="space-y-3">
                    <div className="border-b pb-2 space-y-1.5">
                      <p className="font-semibold text-sm mb-1.5">إرشادات الطول:</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">النطاق الحالي:</span>
                          <span className="font-medium">{articleClassification.range}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{articleClassification.minimum}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{articleClassification.recommended}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold mb-2 text-sm">أفضل الممارسات:</p>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {articleClassification.bestPractices.map((practice, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-xs text-muted-foreground">Words:</span>
            <span className="text-sm font-semibold">{contentStats.wordCount.toLocaleString()}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs text-right" dir="rtl">
                  <p className="font-semibold mb-1">طريقة عد الكلمات:</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {contentStats.countingMethod === "arabic"
                      ? "يتم استخدام طريقة خاصة للنصوص العربية التي تأخذ في الاعتبار الأحرف العربية والفواصل بشكل أدق."
                      : "يتم عد الكلمات عن طريق تقسيم النص حسب المسافات بين الكلمات."}
                  </p>
                  {contentStats.isArabic && (
                    <p className="text-xs text-muted-foreground">
                      تم اكتشاف نص عربي - يتم استخدام عد محسّن للكلمات العربية
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Characters:</span>
            <span className="text-sm font-semibold">{contentStats.characterCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">No spaces:</span>
            <span className="text-sm font-semibold">{contentStats.characterCountNoSpaces.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Paragraphs:</span>
            <span className="text-sm font-semibold">{contentStats.paragraphCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Headings:</span>
            <span className="text-sm font-semibold">{contentStats.headingCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Links:</span>
            <span className="text-sm font-semibold">{contentStats.linkCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Images:</span>
            <span className="text-sm font-semibold">{contentStats.imageCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground pb-3 border-b text-right" dir="rtl">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Content {article.contentFormat && `(${article.contentFormat})`}</span>
            <FieldLabel
              label=""
              fieldPath="article.content"
              fieldType="String"
            />
          </div>
          {contentStats.listCount > 0 && (
            <span className="text-xs">Lists: {contentStats.listCount}</span>
          )}
        </div>
        <div
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none",
            "prose-headings:font-semibold prose-headings:text-foreground",
            "prose-p:text-foreground prose-p:leading-relaxed",
            "prose-a:text-primary prose-a:underline prose-a:no-underline hover:prose-a:underline",
            "prose-strong:font-semibold prose-strong:text-foreground",
            "prose-em:italic prose-em:text-foreground",
            "prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
            "prose-pre:bg-muted prose-pre:text-foreground",
            "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:pr-4 prose-blockquote:italic prose-blockquote:text-muted-foreground",
            "prose-img:rounded-md prose-img:my-4",
            "prose-ul:list-disc prose-ul:ml-6 prose-ul:mr-0 prose-ul:mb-4",
            "prose-ol:list-decimal prose-ol:ml-6 prose-ol:mr-0 prose-ol:mb-4",
            "prose-li:mb-1",
            "text-right",
            "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-foreground [&_h1]:text-right",
            "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-foreground [&_h2]:text-right",
            "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground [&_h3]:text-right",
            "[&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-foreground [&_h4]:text-right",
            "[&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground [&_p]:text-right",
            "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mr-0 [&_ul]:mb-4 [&_ul]:space-y-2",
            "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mr-0 [&_ol]:mb-4 [&_ol]:space-y-2",
            "[&_li]:mb-1 [&_li]:text-foreground [&_li]:text-right",
            "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:pr-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4 [&_blockquote]:text-right",
            "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-foreground [&_code]:text-right",
            "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-foreground [&_pre]:text-right",
            "[&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80",
            "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4",
            "[&_strong]:font-semibold [&_strong]:text-foreground [&_strong]:text-right",
            "[&_em]:italic [&_em]:text-foreground [&_em]:text-right",
            "[&_hr]:my-6 [&_hr]:border-border"
          )}
          dir="rtl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.articleBodyText && (
          <div className="pt-4 mt-4 border-t space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Plain Text (for SEO)</p>
              <FieldLabel
                label=""
                fieldPath="article.articleBodyText"
                fieldType="String?"
              />
            </div>
            <div className="p-3 rounded border bg-muted/30 text-sm whitespace-pre-wrap text-right" dir="rtl">
              {article.articleBodyText}
            </div>
            <p className="text-xs text-muted-foreground">
              Plain text extracted from TipTap HTML content (used for Schema.org articleBody)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
