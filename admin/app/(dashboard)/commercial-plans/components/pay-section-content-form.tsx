import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PAY_MARK_NAMES } from "@modonty/shared/lib/commercial/pay-mark-names";

import { updatePaySectionContent } from "../actions";

/**
 * كلام صفحة البيع لسوق واحد (PAY-G13) — كل ما حول البطاقات: شريط الإعلان والعنوان
 * والعنوان الفرعي وأسطر الثقة.
 *
 * سوقان جنباً إلى جنب لا تبويبان: الفرق بينهما يُقرأ بالمقارنة («هل العرض معلن في مصر
 * أيضاً؟»)، وتبويبٌ يُخفي أحدهما يجعل السؤال يحتاج نقرتين وذاكرة.
 */

export interface PaySectionValues {
  announcement: string | null;
  headline: string | null;
  subheadline: string | null;
  trustItems: string[];
  vatNote: string | null;
  installmentLabel: string | null;
  refundNote: string | null;
  paymentFootnote: string | null;
  paymentFootnoteSub: string | null;
  payMarks: string[];
  installmentMark: string | null;
  teamHeadline: string | null;
  teamSubheadline: string | null;
}

export function PaySectionContentForm({ market, label, values }: { market: string; label: string; values: PaySectionValues }) {
  return (
    <form action={updatePaySectionContent.bind(null, market)} className="flex flex-col gap-3 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">{label}</h3>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
        شريط الإعلان <span className="font-normal">— فارغاً لا يظهر الشريط أصلاً.</span>
        <Input className="h-9" name="announcement" maxLength={120} placeholder="العرض ينتهي نهاية الشهر" defaultValue={values.announcement ?? ""} />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
        عنوان القسم
        <Input className="h-9" name="headline" maxLength={120} placeholder="اختر باقتك وابدأ النشر" defaultValue={values.headline ?? ""} />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
        العنوان الفرعي
        <Textarea name="subheadline" maxLength={300} rows={2} placeholder="محتوى وسيو ومتابعة — بعقد شهري بلا التزام طويل." defaultValue={values.subheadline ?? ""} />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
        أسطر الثقة <span className="font-normal">— سطر لكل عبارة، ٦ كحدّ أقصى.</span>
        <Textarea name="trustItems" rows={3} placeholder={"فاتورة ضريبية معتمدة\nإلغاء بلا رسوم"} defaultValue={values.trustItems.join("\n")} />
      </label>

      {/* ما كان مكتوباً في الكود حتى ١٣ سبتمبر ٢٠٢٦ (PAY-G20) — ادّعاءات تجارية وقانونية
          تتغيّر بتغيّر السوق والمزوّد، فلا تسكن ملفّاً يحتاج نشرة لتعديل كلمة فيه. */}
      <div className="mt-1 border-t pt-3">
        <p className="mb-2 text-xs font-semibold">الدفع والضمان</p>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            السطر الضريبي <span className="font-normal">— اتركه فارغاً لسوق نسبته غير مؤكّدة.</span>
            <Input className="h-9" name="vatNote" maxLength={80} placeholder="شامل ضريبة القيمة المضافة ١٥٪" defaultValue={values.vatNote ?? ""} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            زرّ التقسيط <span className="font-normal">— فارغاً لا يظهر الزرّ أصلاً.</span>
            <Input className="h-9" name="installmentLabel" maxLength={40} placeholder="قسّطها على دفعات" defaultValue={values.installmentLabel ?? ""} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            سطر الضمان
            <Input className="h-9" name="refundNote" maxLength={120} placeholder="استرداد ١٤ يوم — لو ما فعّلنا حسابك" defaultValue={values.refundNote ?? ""} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            شعارات الدفع <span className="font-normal">— أسماء مفصولة بفواصل من: {PAY_MARK_NAMES.join(" · ")}</span>
            <Input className="h-9" name="payMarks" placeholder="mada, visa, mastercard" defaultValue={values.payMarks.join(", ")} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            شعار التقسيط <span className="font-normal">— اسم واحد.</span>
            <Input className="h-9" name="installmentMark" placeholder="tamara" defaultValue={values.installmentMark ?? ""} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            حاشية الدفع
            <Input className="h-9" name="paymentFootnote" maxLength={160} placeholder="الدفع بالبطاقة عبر بوابة معتمدة · والتقسيط عبر تمارا" defaultValue={values.paymentFootnote ?? ""} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            سطر الحاشية الثاني
            <Input className="h-9" name="paymentFootnoteSub" maxLength={80} placeholder="Network International · PCI DSS" defaultValue={values.paymentFootnoteSub ?? ""} />
          </label>

          {/*
            قسم الفريق — العنوان وسطره. يظهران فوق وجوه من أُشّر لهم «اعرض هذا الشخص
            للعملاء» في شاشة الموظّفين. وفارغين يسقطان على نصٍّ افتراضيّ في المكوّن،
            فالقسم يُرسم صحيحاً قبل أن يُملأ.

            ⚠ الصياغة هنا تُقاس بالثقة لا بالوصف: «فريقٌ باسمه ووجهه» رُفضت لأنها تعلن
            أننا نثبت أننا حقيقيّون — وإعلانُ ذلك يزرع الشكّ الذي ينفيه. قل ما يفعله
            الفريق، لا أنه موجود.
          */}
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            عنوان قسم الفريق
            <Input className="h-9" name="teamHeadline" maxLength={60} placeholder="من يتابع اشتراكك" defaultValue={values.teamHeadline ?? ""} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            سطر قسم الفريق
            <Input className="h-9" name="teamSubheadline" maxLength={140} placeholder="بعد اشتراكك يتواصل معك فريقك ويتابع النشر شهراً بشهر." defaultValue={values.teamSubheadline ?? ""} />
          </label>
        </div>
      </div>

      <Button className="h-9 self-start" type="submit" variant="outline">حفظ كلام {label}</Button>
    </form>
  );
}
