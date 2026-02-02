"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { createFAQ, updateFAQ } from "../actions/faq-actions";
import { CharacterCounter } from "@/components/shared/character-counter";
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
    speakable?: any;
    mainEntity?: any;
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
          title: "Success",
          description: faqId ? "FAQ updated successfully" : "FAQ created successfully",
        });
        if (onSuccess) {
          onSuccess();
        } else {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="advanced">Advanced SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">
                  Question <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">
                  Answer <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer"
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  value={formData.position ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      position: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  placeholder="Auto-assigned if not set"
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Position determines the order. Lower numbers appear first.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked === true })
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (visible on public FAQ page)
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle || ""}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="SEO-optimized title for the question"
                  maxLength={60}
                />
                <CharacterCounter current={formData.seoTitle?.length || 0} max={60} />
                <p className="text-xs text-muted-foreground">
                  Optimal length: 50-60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, seoDescription: e.target.value })
                  }
                  placeholder="SEO description/preview text"
                  rows={3}
                  maxLength={160}
                />
                <CharacterCounter current={formData.seoDescription?.length || 0} max={160} />
                <p className="text-xs text-muted-foreground">
                  Optimal length: 155-160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inLanguage">Language</Label>
                <Input
                  id="inLanguage"
                  value={formData.inLanguage}
                  onChange={(e) => setFormData({ ...formData, inLanguage: e.target.value })}
                  placeholder="ar"
                />
                <p className="text-xs text-muted-foreground">
                  Language code for hreflang (e.g., "ar", "en")
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastReviewed">Last Reviewed</Label>
                <Input
                  id="lastReviewed"
                  type="date"
                  value={
                    formData.lastReviewed
                      ? new Date(formData.lastReviewed).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastReviewed: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dateCreated">Date Created</Label>
                <Input
                  id="dateCreated"
                  type="date"
                  value={
                    formData.dateCreated
                      ? new Date(formData.dateCreated).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dateCreated: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="datePublished">Date Published</Label>
                <Input
                  id="datePublished"
                  type="date"
                  value={
                    formData.datePublished
                      ? new Date(formData.datePublished).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      datePublished: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upvoteCount">Upvote Count</Label>
                <Input
                  id="upvoteCount"
                  type="number"
                  value={formData.upvoteCount ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      upvoteCount: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  placeholder="0"
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Community upvotes (Schema.org upvoteCount)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answerCount">Answer Count</Label>
                <Input
                  id="answerCount"
                  type="number"
                  value={formData.answerCount ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      answerCount: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  placeholder="1"
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Number of alternative answers (if multiple answers supported)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {faqId ? "Update FAQ" : "Create FAQ"}
        </Button>
      </div>
    </form>
  );
}
