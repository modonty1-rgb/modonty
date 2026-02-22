"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { ar } from "@/lib/ar";

interface FeedbackFormProps {
  articleTitle: string;
  onSubmit: (feedback: string) => Promise<void>;
  onCancel: () => void;
}

export function FeedbackForm({ articleTitle, onSubmit, onCancel }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const a = ar.articles;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert(a.pleaseProvideFeedback);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(feedback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl" lang="ar">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{a.requestChangesTitle}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {a.articleLabel} {articleTitle}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">{a.feedbackLabel}</Label>
              <Textarea
                id="feedback"
                placeholder={a.feedbackPlaceholder}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                required
                disabled={loading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {a.feedbackSent}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                {a.cancel}
              </Button>
              <Button type="submit" disabled={loading || !feedback.trim()}>
                {loading ? a.sending : a.sendFeedback}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
