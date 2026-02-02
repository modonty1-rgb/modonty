"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";

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
  const addFAQ = () => {
    onChange([
      ...faqs,
      {
        question: "",
        answer: "",
        position: faqs.length,
      },
    ]);
  };

  const updateFAQ = (index: number, field: keyof FAQItem, value: string | number) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeFAQ = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">الأسئلة الشائعة</h4>
        <Button type="button" variant="outline" size="sm" onClick={addFAQ}>
          <Plus className="h-4 w-4 mr-2" />
          إضافة سؤال
        </Button>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          لا توجد أسئلة. اضغط "إضافة سؤال" للبدء.
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">سؤال #{index + 1}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFAQ(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">السؤال</label>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, "question", e.target.value)}
                    placeholder="ما هو السؤال؟"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">الإجابة</label>
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                    placeholder="ما هي الإجابة؟"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
