"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  ChevronDown,
  MessageCircleQuestion,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
  position?: number;
}

interface FAQBuilderProps {
  faqs: FAQItem[];
  onChange: (faqs: FAQItem[]) => void;
}

export function FAQBuilder({ faqs, onChange }: FAQBuilderProps) {
  // Track which FAQ is expanded (only one at a time). Newest added auto-expands.
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Find first incomplete FAQ (empty question OR empty answer)
  const incompleteIndex = faqs.findIndex(
    (f) => !f.question.trim() || !f.answer.trim(),
  );
  const hasIncomplete = incompleteIndex !== -1;

  const addFAQ = () => {
    if (hasIncomplete) {
      // Force user to complete the incomplete one first
      setExpandedIndex(incompleteIndex);
      return;
    }
    const newIndex = faqs.length;
    onChange([
      ...faqs,
      {
        question: "",
        answer: "",
        position: faqs.length,
      },
    ]);
    setExpandedIndex(newIndex);
  };

  const updateFAQ = (
    index: number,
    field: keyof FAQItem,
    value: string | number,
  ) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeFAQ = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {/* Empty state */}
      {faqs.length === 0 ? (
        <button
          type="button"
          onClick={addFAQ}
          className="group flex flex-col items-center justify-center w-full text-center py-10 px-6 rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2 group-hover:bg-primary/15 transition-colors">
            <MessageCircleQuestion className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">إضافة أول سؤال</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            FAQ Schema يساعد المقال يظهر مع أسئلة وأجوبة في نتائج Google
          </p>
        </button>
      ) : (
        <>
          {/* List */}
          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = expandedIndex === index;
              const previewQ = faq.question.trim() || `سؤال #${index + 1}`;
              const isIncomplete = !faq.question.trim() || !faq.answer.trim();
              const isEmpty = !faq.question.trim() && !faq.answer.trim();
              return (
                <div
                  key={index}
                  className={cn(
                    "group rounded-md border bg-card transition-colors",
                    isOpen && !isIncomplete && "border-primary/40 shadow-sm",
                    isOpen && isIncomplete && "border-amber-500/50 shadow-sm",
                    !isOpen && isIncomplete && "border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10",
                  )}
                >
                  {/* Header row — always visible */}
                  <div className="flex items-center gap-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(index)}
                      className="flex flex-1 items-center gap-2 text-start min-w-0"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
                          isIncomplete
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                        )}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={cn(
                          "text-sm flex-1 truncate",
                          isEmpty ? "text-muted-foreground italic" : "font-medium text-foreground",
                        )}
                      >
                        {previewQ}
                      </span>
                      {isIncomplete && (
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      )}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFAQ(index)}
                      aria-label={`حذف السؤال ${index + 1}`}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Expanded body */}
                  {isOpen && (
                    <div className="space-y-3 px-3 pb-3 pt-0 border-t">
                      <div className="pt-3">
                        <label className="text-xs font-medium mb-1 block text-muted-foreground">
                          السؤال
                        </label>
                        <Input
                          value={faq.question}
                          onChange={(e) => updateFAQ(index, "question", e.target.value)}
                          placeholder="ما هو السؤال؟"
                          autoFocus={!faq.question}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block text-muted-foreground">
                          الإجابة
                        </label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                          placeholder="ما هي الإجابة؟"
                          rows={3}
                          className="resize-y"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add tile at bottom */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={addFAQ}
                  disabled={hasIncomplete}
                  className={cn(
                    "group flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed py-3 px-4 transition-colors",
                    hasIncomplete
                      ? "border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/10 cursor-not-allowed opacity-70"
                      : "border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50",
                  )}
                >
                  {hasIncomplete ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        أكمل السؤال #{incompleteIndex + 1} قبل إضافة سؤال جديد
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                        إضافة سؤال
                      </span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {hasIncomplete && (
                <TooltipContent side="top">
                  السؤال #{incompleteIndex + 1} ينقصه{" "}
                  {!faqs[incompleteIndex].question.trim()
                    ? !faqs[incompleteIndex].answer.trim()
                      ? "السؤال والإجابة"
                      : "السؤال"
                    : "الإجابة"}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
