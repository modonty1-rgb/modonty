"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * **حقلُ كلمة المرور — وحدةٌ واحدة** (خالد، ٢٤ سبتمبر ٢٠٢٦: «very bad ui and ux»).
 *
 * كان الحقلُ وثلاثةُ أزرارٍ متفرّقة: العينُ خارجه تنزل عن محاذاته حين يظهر الخطأ (`items-end`
 * يحاذي أسفلَ الخطأ لا أسفلَ الحقل)، و«توليد» والنسخُ في سطرٍ ثانٍ منفصلٍ عنه. الآن:
 * - «توليد كلمة مرور» رابطٌ في سطر العنوان — فعلٌ على الحقل، يُقرأ معه.
 * - العينُ والنسخُ **داخل** الحقل عند طرفه — لا تتحرّك مهما ظهر تحته.
 * - الخطأُ سطرٌ واحدٌ تحته.
 *
 * `type="password"` افتراضاً: الحقلُ يحمل كلمةَ عميلٍ حيّ، فلا يظهر نصّاً إلّا بضغطةٍ مقصودة
 * (بطاقة PWPLAIN، ٢٤ أغسطس). والمحفوظةُ مهشوشةٌ لا تصل الحقل — فالعينُ تكشف ما كُتب أو وُلِّد.
 */
export function PasswordField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (password: string, opts?: { generated?: boolean }) => void;
  error?: string;
}) {
  const { toast } = useToast();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  function generate() {
    // مجموعةٌ بلا أحرفٍ متشابهة (O/0 · l/1): تُملى بالهاتف وتُنسخ بالعين.
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const bytes = crypto.getRandomValues(new Uint32Array(14));
    onChange(Array.from(bytes, (n) => alphabet[n % alphabet.length]).join(""), { generated: true });
    setVisible(true);
    setCopied(false);
    toast({ title: "وُلِّدت كلمة مرور", description: "احفظ الصفحة لتُخزَّن." });
  }

  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ variant: "destructive", title: "تعذّر النسخ", description: "انسخها يدويّاً من الحقل." });
    }
  }

  const iconButton =
    "grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="password" className="text-[11px] font-medium leading-none text-muted-foreground">
          Password
        </Label>
        <button
          type="button"
          onClick={generate}
          className="inline-flex items-center gap-1 rounded text-[12px] font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <KeyRound className="size-3.5" aria-hidden />
          توليد كلمة مرور
        </button>
      </div>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          dir="ltr"
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={cn("h-8 py-1 pe-16 ps-2.5 text-sm", error && "border-destructive")}
        />
        {/* الكلمةُ لاتينيّة فالحقلُ `dir="ltr"`: تبدأ من اليسار، والأيقونتان عند نهايتها يميناً
            (`pe-16` يحجز لهما) فلا تغطّيان حرفاً. */}
        <div className="absolute inset-y-0 right-1 flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            aria-pressed={visible}
            title={visible ? "إخفاء" : "إظهار"}
            className={iconButton}
          >
            {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={copy}
            disabled={!value}
            aria-label={copied ? "نُسخت" : "نسخ كلمة المرور"}
            title={copied ? "نُسخت" : "نسخ"}
            className={cn(iconButton, "disabled:pointer-events-none disabled:opacity-30")}
          >
            {copied ? <Check className="size-4 text-emerald-500" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
      {error ? <p className="text-[11px] leading-tight text-destructive">{error}</p> : null}
    </div>
  );
}
