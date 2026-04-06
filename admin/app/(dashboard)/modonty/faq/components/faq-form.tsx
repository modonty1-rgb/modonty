"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { CharacterCounter } from "@/components/shared/character-counter";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { createFAQ, updateFAQ } from "../actions/faq-actions";
import type { FAQFormData } from "../helpers/faq-schema";
import { useToast } from "@/hooks/use-toast";

interface FAQFormProps {
  faqId?: string;
  initialData?: {
    question?: string;
    answer?: string;
    position?: number;
    isActive?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    lastReviewed?: Date;
    reviewedBy?: string;
    author?: string;
    upvoteCount?: number;
    answerCount?: number;
    dateCreated?: Date;
    datePublished?: Date;
    inLanguage?: string;
    speakable?: unknown;
    mainEntity?: unknown;
  };
  onSuccess?: () => void;
}

export function FAQForm({ faqId, initialData, onSuccess }: FAQFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FAQFormData>({
    question: initialData?.question || "",
    answer: initialData?.answer || "",
    position: initialData?.position,
    isActive: initialData?.isActive ?? true,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    lastReviewed: initialData?.lastReviewed,
    reviewedBy: initialData?.reviewedBy,
    author: initialData?.author,
    upvoteCount: initialData?.upvoteCount,
    answerCount: initialData?.answerCount,
    dateCreated: initialData?.dateCreated,
    datePublished: initialData?.datePublished,
    inLanguage: initialData?.inLanguage || "ar",
    speakable: initialData?.speakable,
    mainEntity: initialData?.mainEntity,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = faqId
        ? await updateFAQ(faqId, formData)
        : await createFAQ(formData);

      if (result.success) {
        toast({
          title: "تم الحفظ",
          description: "تم حفظ السؤال بنجاح",
          variant: "success",
        });
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/modonty/faq");
          router.refresh();
        }
      } else {
        setError(result.error || "Failed to save FAQ");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column — Question + Answer */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <CardTitle className="text-base">Question & Answer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormInput
                label="Question"
                name="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="e.g., How do I create an account?"
                required
                hint="The question shown to visitors"
              />
              <FormTextarea
                label="Answer"
                name="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Write a clear, helpful answer..."
                rows={6}
                required
                hint="Keep it concise — 40 to 60 words is ideal"
              />
            </CardContent>
          </Card>

          {/* SEO Card */}
          <Card className="border-blue-500/20 bg-blue-500/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <CardTitle className="text-base text-blue-400">Search Engine Optimization</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <FormInput
                  label="SEO Title"
                  name="seoTitle"
                  value={formData.seoTitle || ""}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Optional — defaults to the question"
                  hint="Title shown in Google results (30-60 characters)"
                />
                <CharacterCounter current={(formData.seoTitle || "").length} min={30} max={60} className="mt-1 ms-1" />
              </div>
              <div>
                <FormTextarea
                  label="SEO Description"
                  name="seoDescription"
                  value={formData.seoDescription || ""}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="Optional — a brief summary for search engines"
                  rows={2}
                  hint="Description below the title in search results (120-160 characters)"
                />
                <CharacterCounter current={(formData.seoDescription || "").length} min={120} max={160} className="mt-1 ms-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Settings + Actions */}
        <div className="lg:sticky lg:top-4 lg:self-start space-y-4">
          {/* Settings Card */}
          <Card className="border-amber-500/20 bg-amber-500/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <CardTitle className="text-base text-amber-400">Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked === true })
                  }
                />
                <label htmlFor="isActive" className="text-sm font-medium cursor-pointer flex-1">
                  Show on public FAQ page
                </label>
              </div>
              <FormInput
                label="Position"
                name="position"
                type="number"
                value={formData.position?.toString() ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    position: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  })
                }
                placeholder="Auto"
                hint="Lower number = appears first"
              />
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={loading} className="w-full gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {faqId ? "Update FAQ" : "Create FAQ"}
                    </>
                  )}
                </Button>
                {faqId && (
                  <Button type="button" variant="outline" className="w-full gap-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
