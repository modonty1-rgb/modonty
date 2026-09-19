"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * **زرّان بجانب حقل كلمة المرور — توليدٌ ونسخ.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «لا دخولَ بعد هذا ماله داعي، شيله» — فسقطت شارةُ الحالة.
 * كانت تقول إن كان للعميل كلمةٌ محفوظة، والمعلومةُ باقيةٌ حيث تُستعمل فعلاً: قسمُ
 * الترحيب لا يُرسل ما لم تكن هناك كلمة.
 *
 * و«أرسل بيانات الدخول» خرج إلى قسمِه المستقلّ (خالد، نفس اليوم): إرسالُ بريدٍ لعميلٍ حيٍّ
 * فعلٌ لا يُرجَع، وزرٌّ ملاصقٌ لحقلِ إدخالٍ يُضغط بالعادة لا بالقصد.
 */
export function PasswordActions({
  draftPassword,
  onGenerate,
}: {
  /** ما في الحقل حالياً — «انسخ» تظهر على ما وُلِّد قبل حفظه. */
  draftPassword: string;
  onGenerate: (password: string) => void;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function generate() {
    // مجموعةٌ بلا أحرفٍ متشابهة (O/0 · l/1): تُملى بالهاتف وتُنسخ بالعين.
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const bytes = crypto.getRandomValues(new Uint32Array(14));
    const pw = Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("");
    onGenerate(pw);
    setCopied(false);
    toast({ title: "وُلِّدت كلمة مرور", description: "احفظ الصفحة لتُخزَّن." });
  }

  async function copy() {
    if (!draftPassword) return;
    try {
      await navigator.clipboard.writeText(draftPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ variant: "destructive", title: "تعذّر النسخ", description: "انسخها يدويّاً من الحقل." });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" onClick={generate} className="h-8 gap-1.5 text-[12px]">
        <KeyRound className="size-3.5" aria-hidden />
        ولّد
      </Button>
      {draftPassword ? (
        <Button type="button" variant="ghost" onClick={copy} className="h-8 text-[12px]">
          {copied ? "نُسخت ✓" : "انسخ"}
        </Button>
      ) : null}
    </div>
  );
}
