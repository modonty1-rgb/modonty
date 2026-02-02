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

interface FeedbackFormProps {
  articleTitle: string;
  onSubmit: (feedback: string) => Promise<void>;
  onCancel: () => void;
}

export function FeedbackForm({ articleTitle, onSubmit, onCancel }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert("Please provide feedback");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Request Changes</CardTitle>
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
            Article: {articleTitle}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback / Changes Requested</Label>
              <Textarea
                id="feedback"
                placeholder="Please describe what changes you'd like to see in this article..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                required
                disabled={loading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Your feedback will be sent to the content team for review.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !feedback.trim()}>
                {loading ? "Sending..." : "Send Feedback"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
