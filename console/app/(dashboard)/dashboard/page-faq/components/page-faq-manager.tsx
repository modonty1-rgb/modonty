"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Loader2, Check, X, RotateCcw, MessageCircleQuestion } from "lucide-react";
import {
  saveClientPageFaq,
  rejectClientPageFaq,
  restoreClientPageFaq,
  deleteClientPageFaq,
} from "../actions/page-faq-actions";
import type { ClientPageFaq } from "../helpers/page-faq-queries";

interface Props {
  initial: ClientPageFaq[];
}

function decode(s: string | null): string {
  // Stored answers/questions are HTML-entity-encoded for safe JSON-LD embedding;
  // decode back to plain text for editing in the form.
  if (!s) return "";
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

export function PageFaqManager({ initial }: Props) {
  const [faqs, setFaqs] = useState<ClientPageFaq[]>(initial);

  const pending = faqs.filter((f) => f.status === "PENDING");
  const published = faqs.filter((f) => f.status === "PUBLISHED");
  const rejected = faqs.filter((f) => f.status === "REJECTED");

  function replace(updated: ClientPageFaq) {
    setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }
  function remove(id: string) {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  }
  function add(created: ClientPageFaq) {
    setFaqs((prev) => [created, ...prev]);
  }

  return (
    <div className="space-y-6">
      <AddForm onAdded={add} />

      {pending.length > 0 && (
        <Group title="بانتظار ردّك" hint="أسئلة وصلتك من الزوار — اكتب الإجابة عشان تنشر.">
          {pending.map((f) => (
            <FaqCard key={f.id} faq={f} onSaved={replace} onRemoved={remove} />
          ))}
        </Group>
      )}

      {published.length > 0 && (
        <Group title="منشورة على صفحتك" hint="تظهر للزوار وفي بيانات Google (FAQPage).">
          {published.map((f) => (
            <FaqCard key={f.id} faq={f} onSaved={replace} onRemoved={remove} />
          ))}
        </Group>
      )}

      {rejected.length > 0 && (
        <Group title="مرفوضة" hint="مخفيّة عن صفحتك — تقدر تسترجعها أو تحذفها نهائياً.">
          {rejected.map((f) => (
            <FaqCard key={f.id} faq={f} onSaved={replace} onRemoved={remove} />
          ))}
        </Group>
      )}

      {faqs.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageCircleQuestion className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              ما فيه أسئلة بعد — أضف سؤالاً وجوابه، أو انتظر أسئلة الزوار.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AddForm({ onAdded }: { onAdded: (f: ClientPageFaq) => void }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (question.trim().length < 3) {
      toast.error("اكتب سؤالاً صحيحاً");
      return;
    }
    startTransition(async () => {
      const res = await saveClientPageFaq({ question, answer });
      if (res.success) {
        // Optimistic row — server revalidates the list on next load.
        onAdded({
          id: `tmp-${question.slice(0, 8)}-${answer.length}`,
          question: question.trim(),
          answer: answer.trim() || null,
          status: answer.trim() ? "PUBLISHED" : "PENDING",
          source: "manual",
          position: 999,
          submittedByName: null,
          submittedByEmail: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setQuestion("");
        setAnswer("");
        toast.success(answer.trim() ? "تم النشر" : "تم الحفظ كمسودة");
      } else {
        toast.error(res.error || "فشل الحفظ");
      }
    });
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Plus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-tight text-foreground">أضف سؤالاً وجواباً</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              اكتب سؤالاً متكرراً يسأله عملاؤك مع إجابته — يظهر في صفحتك مباشرة.
            </p>
          </div>
        </div>
        <Input placeholder="السؤال *" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Textarea
          placeholder="الإجابة (اتركها فارغة لتحفظها كمسودة)"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end">
          <Button onClick={submit} disabled={pending} className="gap-1.5">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            إضافة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FaqCard({
  faq,
  onSaved,
  onRemoved,
}: {
  faq: ClientPageFaq;
  onSaved: (f: ClientPageFaq) => void;
  onRemoved: (id: string) => void;
}) {
  const [question, setQuestion] = useState(decode(faq.question));
  const [answer, setAnswer] = useState(decode(faq.answer));
  const [pending, startTransition] = useTransition();

  const isReaderSubmission = faq.source === "user" || faq.source === "chatbot";
  // «نشر» only when moving a not-yet-published FAQ live; an already-published
  // row's save button is just «حفظ» (update) — never «نشر» under «منشورة».
  const willPublish = faq.status !== "PUBLISHED" && answer.trim().length > 0;

  function save() {
    if (question.trim().length < 3) {
      toast.error("اكتب سؤالاً صحيحاً");
      return;
    }
    startTransition(async () => {
      const res = await saveClientPageFaq({ id: faq.id, question, answer });
      if (res.success) {
        onSaved({
          ...faq,
          question: question.trim(),
          answer: answer.trim() || null,
          status: answer.trim() ? "PUBLISHED" : "PENDING",
        });
        toast.success(answer.trim() ? "تم النشر" : "تم الحفظ");
      } else {
        toast.error(res.error || "فشل الحفظ");
      }
    });
  }

  function doReject() {
    startTransition(async () => {
      const res = await rejectClientPageFaq(faq.id);
      if (res.success) {
        onSaved({ ...faq, status: "REJECTED" });
        toast.success("تم الرفض");
      } else toast.error(res.error || "فشل");
    });
  }

  function doRestore() {
    startTransition(async () => {
      const res = await restoreClientPageFaq(faq.id);
      if (res.success) {
        onSaved({ ...faq, status: "PENDING" });
        toast.success("تم الاسترجاع");
      } else toast.error(res.error || "فشل");
    });
  }

  function doDelete() {
    startTransition(async () => {
      const res = await deleteClientPageFaq(faq.id);
      if (res.success) {
        onRemoved(faq.id);
        toast.success("تم الحذف");
      } else toast.error(res.error || "فشل");
    });
  }

  return (
    <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
      {isReaderSubmission && faq.submittedByName && (
        <p className="text-[11px] text-muted-foreground">
          من زائر: <span className="font-medium text-foreground">{faq.submittedByName}</span>
        </p>
      )}
      <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="السؤال *" />
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={isReaderSubmission ? "اكتب إجابتك هنا للنشر..." : "الإجابة"}
        rows={3}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={save} disabled={pending} className="gap-1.5">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : willPublish ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {willPublish ? "نشر" : "حفظ"}
        </Button>
        {faq.status !== "REJECTED" ? (
          <Button size="sm" variant="ghost" onClick={doReject} disabled={pending} className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            رفض
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={doRestore} disabled={pending} className="gap-1.5 text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" />
            استرجاع
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={doDelete}
          disabled={pending}
          className="gap-1.5 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          حذف
        </Button>
      </div>
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-3 p-5">
        <div>
          <h2 className="text-base font-semibold leading-tight text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        </div>
        <div className="space-y-3">{children}</div>
      </CardContent>
    </Card>
  );
}
