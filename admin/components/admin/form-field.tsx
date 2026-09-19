import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

/**
 * **الكثافةُ المكتبيّة — ٤٧px للحقل لا ٧٢** (خالد ١٩ سبتمبر ٢٠٢٦: «الحقول مرتفعة
 * جدّاً… الأدمن هذا ما بيشتغل إلّا على الـdesktop… حسّ فيه padding داخليّ هو اللي مكبّر
 * المواضيع»).
 *
 * -- الرقمُ من الممارسات لا من الذوق --
 * ٣٢px هو **الافتراضُ المكتبيّ** لا الاستثناء: Ant Design يجعله مقاسَه الأوسط (٤٠ عنده
 * «كبير» و٢٤ «صغير»)، وCarbon يسمّيه `sm` ويعمل على `xs` أضيقَ منه. وMaterial يحذف
 * ٤dp لكلّ درجةِ كثافة، ويقول صراحةً إنّ هدفَ اللمس ٤٨px يُحفَظ بحشوٍ **خارجيّ** — وهي
 * قاعدةٌ لا تخصّنا أصلاً: هذا أدمنٌ يُستعمل بفأرةٍ على المكتب.
 *
 * -- والعلّةُ كانت الحشوَ الداخليَّ كما قال خالد --
 * `input.tsx:11` يحمل `h-10 py-2` قيمةً واحدةً بلا مقاسات. فلمّا خُفِّض الارتفاعُ إلى
 * ٣٦ بقي الحشوُ ٨px، فصار المطلوبُ `20 (سطر) + 8 + 8 + 1.3 (حدّ) = 37.3px` مضغوطاً في
 * ٣٦ — صندوقٌ يقاتل محتواه. والصحيحُ أن يتّسع الصندوقُ لما فيه: `20 + 4 + 4 + 2 = 30`
 * داخل `h-8` (٣٢) بفسحةٍ لا بتضارب.
 *
 * -- وهنا لا في كلّ شاشة --
 * هذا **المصدرُ المشترك** لحقول الأدمن كلِّها، فالكثافةُ تتغيّر مرّةً وتسري على الجميع.
 * و٤٠px يبقى مقاسَ صفّ الجدول (معيار الأدمن #٣): الجدولُ يُمسح بالعين، والنموذجُ يُملأ.
 */
export function FormField({ label, name, error, required, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="block cursor-default text-[11px] font-medium leading-none text-muted-foreground">
        <span>{label}</span>
        {required && <span className="text-destructive ms-1">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] leading-tight text-amber-600 dark:text-amber-500">{hint}</p>}
      {error && <p className="text-[11px] leading-tight text-destructive">{error}</p>}
    </div>
  );
}

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  hint?: string;
  step?: string | number;
  autoComplete?: string;
  maxLength?: number;
  /**
   * اتجاه النصّ داخل الحقل. أرقام الهواتف والآيبان لاتينية، وداخل نموذجٍ عربيّ تُقلَب
   * مقاطعها فيُقرأ `+9665…` معكوساً — يُحفظ صحيحاً ويُقرأ خطأً، وهو أسوأ من الاثنين.
   */
  dir?: "rtl" | "ltr";
}

export function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  error,
  required,
  value,
  onChange,
  disabled,
  readOnly,
  hint,
  step,
  autoComplete,
  maxLength,
  dir,
}: FormInputProps) {
  return (
    <FormField label={label} name={name} error={error} required={required} hint={hint}>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        step={step}
        autoComplete={autoComplete}
        maxLength={maxLength}
        dir={dir}
        className={`h-8 px-2.5 py-1 text-sm ${error ? "border-destructive" : ""}`}
      />
    </FormField>
  );
}

interface FormTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  disabled?: boolean;
  hint?: string;
}

export function FormTextarea({
  label,
  name,
  placeholder,
  error,
  required,
  value,
  onChange,
  onBlur,
  rows = 4,
  disabled,
  hint,
}: FormTextareaProps) {
  return (
    <FormField label={label} name={name} error={error} required={required} hint={hint}>
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        rows={rows}
        className={`px-2.5 py-1.5 text-sm ${error ? "border-destructive" : ""}`}
      />
    </FormField>
  );
}

interface FormSelectProps {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  hint?: string;
  children: ReactNode;
}

export function FormSelect({
  label,
  name,
  placeholder,
  error,
  required,
  value,
  onValueChange,
  disabled,
  hint,
  children,
}: FormSelectProps) {
  return (
    <FormField label={label} name={name} error={error} required={required} hint={hint}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={`h-8 px-2.5 py-1 text-sm ${error ? "border-destructive" : ""}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormField>
  );
}

interface FormNativeSelectProps {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  hint?: string;
  children: ReactNode;
}

export function FormNativeSelect({
  label,
  name,
  placeholder,
  error,
  required,
  value,
  onChange,
  disabled,
  hint,
  children,
}: FormNativeSelectProps) {
  return (
    <FormField label={label} name={name} error={error} required={required} hint={hint}>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-destructive" : ""
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
    </FormField>
  );
}
