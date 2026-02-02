'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, Sparkles, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { generateArticleAI } from '../actions/generate-article-ai';
import { useArticleForm } from './article-form-context';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '../helpers/seo-helpers';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { cn } from '@/lib/utils';

type DialogStep = 'input' | 'loading' | 'preview';

interface AiArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiArticleDialog({ open, onOpenChange }: AiArticleDialogProps) {
  const [step, setStep] = useState<DialogStep>('input');
  const [keywords, setKeywords] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { updateFields, formData, authors } = useArticleForm();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setKeywords((formData.seoKeywords ?? []).join(', '));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- pre-fill only on open; formData read when open

  // Preview editor for content tab
  const previewEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Link.configure({ openOnClick: false }),
      Image,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: generatedData?.content || '',
    editable: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none min-h-[200px] p-4',
          'rtl:text-right ltr:text-left',
          '[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-4',
          '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3',
          '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2',
          '[&_p]:mb-4 [&_p]:leading-relaxed',
          '[&_ul]:list-disc [&_ul]:mr-6 [&_ul]:mb-4',
          '[&_ol]:list-decimal [&_ol]:mr-6 [&_ol]:mb-4'
        ),
        dir: 'rtl',
      },
    },
  });

  // Update preview editor when content changes
  if (previewEditor && generatedData?.content && previewEditor.getHTML() !== generatedData.content) {
    previewEditor.commands.setContent(generatedData.content);
  }

  const handleGenerate = async () => {
    const fromForm = (formData.seoKeywords ?? []).join(', ').trim();
    const keywordsToUse = keywords.trim() || fromForm;
    if (!keywordsToUse) {
      setError('يرجى إدخال الكلمات المفتاحية في تبويب «الكلمات المفتاحية لـ SEO» أو هنا');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setStep('loading');

    try {
      const result = await generateArticleAI({
        keywords: keywordsToUse,
        length,
        clientId: formData.clientId || undefined,
        categoryId: formData.categoryId || undefined,
      });

      if (result.success && result.data) {
        setGeneratedData(result.data);
        setStep('preview');
      } else {
        setError(result.error || 'فشل توليد المقال');
        setStep('input');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setStep('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (!generatedData) return;

    const slug = slugify(generatedData.title) || '';
    
    // Ensure authorId is set (singleton Modonty author)
    const authorId = formData.authorId || (authors.length > 0 ? authors[0].id : '');

    updateFields({
      title: generatedData.title,
      slug,
      content: generatedData.content,
      excerpt: generatedData.excerpt,
      seoTitle: generatedData.seoTitle,
      seoDescription: generatedData.seoDescription,
      wordCount: generatedData.wordCount,
      readingTimeMinutes: generatedData.readingTimeMinutes,
      contentDepth: generatedData.contentDepth,
      authorId,
      seoKeywords: generatedData.keywords ?? [],
      faqs: generatedData.faqs.map((faq: any, index: number) => ({
        question: faq.question,
        answer: faq.answer,
        position: index,
      })),
    });

    toast({
      title: 'تم تطبيق المحتوى',
      description: 'تم ملء النموذج بالمحتوى المُولّد بنجاح',
    });

    onOpenChange(false);
    // Reset state
    setTimeout(() => {
      setStep('input');
      setKeywords('');
      setLength('medium');
      setGeneratedData(null);
      setError(null);
    }, 300);
  };

  const handleRetry = () => {
    setStep('input');
    setGeneratedData(null);
    setError(null);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('input');
      setLength('medium');
      setGeneratedData(null);
      setError(null);
    }, 300);
  };

  const getContentDepthBadge = (depth: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      short: 'secondary',
      medium: 'default',
      long: 'outline',
    };
    const labels: Record<string, string> = {
      short: 'قصير',
      medium: 'متوسط',
      long: 'طويل',
    };
    return (
      <Badge variant={variants[depth] || 'default'}>
        {labels[depth] || depth}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={() => {
          const fromForm = (formData.seoKeywords ?? []).join(', ');
          setKeywords(fromForm);
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            توليد مقال بالذكاء الاصطناعي
          </DialogTitle>
          <DialogDescription>
            أدخل الكلمات المفتاحية واختر طول المقال لتوليد محتوى احترافي جاهز للنشر. إن وُجدت
            كلمات في تبويب «الكلمات المفتاحية لـ SEO» فستُعبَّأ هنا ويُولَّد المقال بناءً عليها.
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">الكلمات المفتاحية *</Label>
              <Textarea
                id="keywords"
                placeholder="مثال: التسويق الرقمي، استراتيجيات التسويق، تحسين محركات البحث"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                اذكر الموضوعات أو الكلمات المفتاحية التي تريد أن يتناولها المقال
              </p>
            </div>

            <div className="space-y-2">
              <Label>طول المقال</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={length === 'short' ? 'default' : 'outline'}
                  onClick={() => setLength('short')}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <span className="font-semibold">قصير</span>
                  <span className="text-xs text-muted-foreground">
                    400-600 كلمة
                  </span>
                </Button>
                <Button
                  type="button"
                  variant={length === 'medium' ? 'default' : 'outline'}
                  onClick={() => setLength('medium')}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <span className="font-semibold">متوسط</span>
                  <span className="text-xs text-muted-foreground">
                    900-1200 كلمة
                  </span>
                </Button>
                <Button
                  type="button"
                  variant={length === 'long' ? 'default' : 'outline'}
                  onClick={() => setLength('long')}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <span className="font-semibold">طويل</span>
                  <span className="text-xs text-muted-foreground">
                    1500-2500 كلمة
                  </span>
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جارٍ توليد المقال...</p>
            <p className="text-xs text-muted-foreground">
              قد يستغرق هذا بضع ثوانٍ
            </p>
          </div>
        )}

        {step === 'preview' && generatedData && (
          <div className="space-y-4 py-4">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">المحتوى</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="faqs">الأسئلة الشائعة</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>العنوان</Label>
                    {getContentDepthBadge(generatedData.contentDepth)}
                  </div>
                  <h3 className="text-lg font-semibold">{generatedData.title}</h3>
                </div>

                <div className="space-y-2">
                  <Label>الملخص</Label>
                  <p className="text-sm text-muted-foreground">{generatedData.excerpt}</p>
                </div>

                <div className="space-y-2">
                  <Label>المحتوى</Label>
                  <div className="border rounded-md bg-background">
                    {previewEditor && <EditorContent editor={previewEditor} />}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>عدد الكلمات: {generatedData.wordCount}</span>
                  <span>•</span>
                  <span>وقت القراءة: {generatedData.readingTimeMinutes} دقيقة</span>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>عنوان SEO</Label>
                    <Badge
                      variant={
                        generatedData.seoTitle.length >= 40 &&
                        generatedData.seoTitle.length <= 60
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {generatedData.seoTitle.length} حرف
                    </Badge>
                  </div>
                  <p className="text-sm">{generatedData.seoTitle}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>وصف SEO</Label>
                    <Badge
                      variant={
                        generatedData.seoDescription.length >= 130 &&
                        generatedData.seoDescription.length <= 170
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {generatedData.seoDescription.length} حرف
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {generatedData.seoDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>الكلمات المفتاحية</Label>
                  <div className="flex flex-wrap gap-2">
                    {generatedData.keywords?.map((keyword: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="faqs" className="space-y-4 mt-4">
                {generatedData.faqs && generatedData.faqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {generatedData.faqs.map((faq: any, index: number) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-right">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-right text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد أسئلة شائعة
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter>
          {step === 'input' && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={
                  (!keywords.trim() && !(formData.seoKeywords ?? []).join(', ').trim()) || isGenerating
                }
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جارٍ التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 ml-2" />
                    توليد المقال
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'loading' && (
            <Button variant="outline" onClick={handleCancel} disabled={isGenerating}>
              إلغاء
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة المحاولة
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
              <Button onClick={handleConfirm}>
                <CheckCircle className="h-4 w-4 ml-2" />
                تأكيد وتطبيق
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
