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

export function FormField({ label, name, error, required, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="cursor-default">
        <span>{label}</span>
        {required && <span className="text-destructive ms-1">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-amber-600 dark:text-amber-500 leading-tight">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
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
        className={error ? "border-destructive" : ""}
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
        className={error ? "border-destructive" : ""}
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
        <SelectTrigger className={error ? "border-destructive" : ""}>
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
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-destructive" : ""
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
    </FormField>
  );
}
