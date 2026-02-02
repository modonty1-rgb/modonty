"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { submitFAQFeedback, checkExistingFeedback } from "../faq/actions/faq-feedback-actions";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  upvoteCount?: number | null;
  downvoteCount?: number | null;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [feedbackStates, setFeedbackStates] = useState<Record<string, "helpful" | "not-helpful" | null>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, "helpful" | "not-helpful" | null>>({});
  const checkedItemsRef = useRef<Set<string>>(new Set());

  // Check for existing feedback on mount (only once per item)
  useEffect(() => {
    const checkFeedbacks = async () => {
      for (const item of items) {
        // Skip if already checked
        if (checkedItemsRef.current.has(item.id)) {
          continue;
        }

        // Mark as being checked
        checkedItemsRef.current.add(item.id);

        try {
          const existing = await checkExistingFeedback(item.id);
          if (existing.hasFeedback) {
            setFeedbackStates((prev) => ({
              ...prev,
              [item.id]: existing.isHelpful ? "helpful" : "not-helpful",
            }));
          }
        } catch (error) {
          console.error(`Error checking feedback for FAQ ${item.id}:`, error);
          // Remove from checked set on error so it can be retried
          checkedItemsRef.current.delete(item.id);
        }
      }
    };

    checkFeedbacks();
  }, [items]);

  const handleFeedback = async (faqId: string, isHelpful: boolean) => {
    const buttonType = isHelpful ? "helpful" : "not-helpful";
    
    setIsSubmitting((prev) => ({ ...prev, [faqId]: buttonType }));
    
    const result = await submitFAQFeedback(faqId, isHelpful);
    
    if (result.success) {
      setFeedbackStates((prev) => ({
        ...prev,
        [faqId]: isHelpful ? "helpful" : "not-helpful",
      }));
      // Refresh the page to show updated counts
      window.location.reload();
    } else if (result.alreadySubmitted) {
      setFeedbackStates((prev) => ({
        ...prev,
        [faqId]: isHelpful ? "helpful" : "not-helpful",
      }));
    }
    
    setIsSubmitting((prev) => ({ ...prev, [faqId]: null }));
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => {
        const feedbackState = feedbackStates[item.id];
        const submitting = isSubmitting[item.id];
        const isSubmittingHelpful = submitting === "helpful";
        const isSubmittingNotHelpful = submitting === "not-helpful";
        
        // Ensure counts are numbers
        const upvoteCount = typeof item.upvoteCount === 'number' ? item.upvoteCount : (item.upvoteCount ?? 0);
        const downvoteCount = typeof item.downvoteCount === 'number' ? item.downvoteCount : (item.downvoteCount ?? 0);

        return (
          <AccordionItem
            key={item.id}
            value={`item-${index}`}
            className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors rounded-lg px-3 -mx-3"
          >
            <AccordionTrigger
              className="text-right hover:no-underline py-5 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-all"
            >
              <div className="flex items-center justify-between w-full gap-4">
                <span className="font-semibold text-base text-foreground leading-relaxed flex-1 text-right">
                  {item.question}
                </span>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 border border-primary/10">
                    <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-primary tabular-nums">
                      {upvoteCount}
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">مفيد</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/5 border border-destructive/10">
                    <ThumbsDown className="h-3.5 w-3.5 text-destructive" />
                    <span className="font-semibold text-destructive tabular-nums">
                      {downvoteCount}
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">غير مفيد</span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent
              className="text-muted-foreground leading-relaxed pb-5"
            >
              <div
                dangerouslySetInnerHTML={{ __html: item.answer }}
                className="prose prose-sm max-w-none text-muted-foreground mb-6"
              />
              <div className="flex flex-col gap-4 pt-6 mt-6 border-t border-border bg-muted/20 rounded-lg p-4 -mx-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">هل كان هذا مفيداً؟</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(item.id, true)}
                    disabled={isSubmittingHelpful || isSubmittingNotHelpful}
                    className={
                      feedbackState === "helpful"
                        ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-sm"
                        : "hover:bg-primary/5 border border-transparent hover:border-primary/10"
                    }
                  >
                    {isSubmittingHelpful ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-4 w-4 ml-2" />
                    )}
                    <span className="font-medium">مفيد</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(item.id, false)}
                    disabled={isSubmittingHelpful || isSubmittingNotHelpful}
                    className={
                      feedbackState === "not-helpful"
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 shadow-sm"
                        : "hover:bg-destructive/5 border border-transparent hover:border-destructive/10"
                    }
                  >
                    {isSubmittingNotHelpful ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <ThumbsDown className="h-4 w-4 ml-2" />
                    )}
                    <span className="font-medium">غير مفيد</span>
                  </Button>
                </div>
                {feedbackState && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-medium">
                      شكراً لملاحظاتك
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
