"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { IntakeFieldConfig } from "../helpers/intake-questions";

const HELP_TITLE = "كيف  يساعد مودونتي؟";

type IntakeFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  config: IntakeFieldConfig | undefined;
  value: string;
  extraValue?: string;
  onValueChange: (id: string, value: string) => void;
  onExtraChange?: (key: string, value: string) => void;
  isDone: boolean;
  className?: string;
  helpContent?: string;
};

function parseMultiValue(s: string): string[] {
  if (!s?.trim()) return [];
  try {
    const parsed = JSON.parse(s) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // ignore
  }
  return s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
}

function serializeMultiValue(arr: string[]): string {
  return JSON.stringify(arr);
}

function getWrapperClass(isDone: boolean, className: string): string {
  return `rounded-md transition-colors p-3 ${
    isDone
      ? "border-r-4 border-primary bg-primary/5 dark:bg-primary/10"
      : "border-r-4 border-transparent bg-muted/30"
  } ${className}`;
}

function HelpCollapsible({ label, helpContent }: { label: string; helpContent: string }) {
  return (
    <Collapsible className="group w-full">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-start text-sm font-normal text-foreground hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <span className="min-w-0 flex-1">{label}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground text-xs leading-none">
            <span>السبب</span>
            <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden />
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-primary text-right" role="region" aria-label={HELP_TITLE}>
          <p className="font-medium mb-1">{HELP_TITLE}</p>
          <p className="whitespace-pre-wrap">{helpContent}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function QuestionLabel({
  id,
  label,
  helpContent,
  asSpan = false,
}: {
  id: string;
  label: string;
  helpContent?: string;
  asSpan?: boolean;
}) {
  if (helpContent) {
    return <HelpCollapsible label={label} helpContent={helpContent} />;
  }
  if (asSpan) {
    return <span className="text-sm font-normal text-foreground">{label}</span>;
  }
  return (
    <Label htmlFor={id} className="text-sm font-normal text-foreground cursor-pointer">
      {label}
    </Label>
  );
}

function IntakeTextareaField({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  wrapperClass,
  questionLabel,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (id: string, value: string) => void;
  wrapperClass: string;
  questionLabel: React.ReactNode;
}) {
  return (
    <div className={wrapperClass}>
      <div className="w-full">{questionLabel}</div>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onValueChange(id, e.target.value)}
        rows={2}
        className="mt-1.5 resize-y min-h-[4rem]"
        placeholder={placeholder}
        aria-label={label}
      />
    </div>
  );
}

function IntakeInputField({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  wrapperClass,
  labelBlock,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (id: string, value: string) => void;
  wrapperClass: string;
  labelBlock: React.ReactNode;
}) {
  return (
    <div className={wrapperClass}>
      {labelBlock}
      <Input
        id={id}
        value={value}
        onChange={(e) => onValueChange(id, e.target.value)}
        className="mt-1.5"
        placeholder={placeholder}
        aria-label={label}
      />
    </div>
  );
}

function IntakeSelectField({
  id,
  label,
  placeholder,
  config,
  value,
  extraValue,
  onValueChange,
  onExtraChange,
  wrapperClass,
  labelBlock,
}: {
  id: string;
  label: string;
  placeholder: string;
  config: IntakeFieldConfig;
  value: string;
  extraValue: string;
  onValueChange: (id: string, value: string) => void;
  onExtraChange?: (key: string, value: string) => void;
  wrapperClass: string;
  labelBlock: React.ReactNode;
}) {
  const options = config.options ?? [];
  const allowOther = config.allowOther ?? false;
  const isOtherSelected = value === "other" || (value && !options.find((o) => o.value === value));
  return (
    <div className={cn(wrapperClass, "min-w-0")}>
      {labelBlock}
      <Select
        value={value && options.find((o) => o.value === value) ? value : ""}
        onValueChange={(v) => onValueChange(id, v)}
      >
        <SelectTrigger id={id} className="mt-1.5 min-w-0">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {allowOther && isOtherSelected && (
        <Textarea
          value={extraValue}
          onChange={(e) => onExtraChange?.(`${id}_other`, e.target.value)}
          placeholder="تفاصيل إضافية"
          rows={2}
          className="mt-2"
        />
      )}
    </div>
  );
}

function IntakeMultiselectField({
  id,
  label,
  config,
  value,
  onValueChange,
  wrapperClass,
  multiselectLegend,
}: {
  id: string;
  label: string;
  config: IntakeFieldConfig;
  value: string;
  onValueChange: (id: string, value: string) => void;
  wrapperClass: string;
  multiselectLegend: React.ReactNode;
}) {
  const options = config.options ?? [];
  const selected = parseMultiValue(value);
  const toggle = (optValue: string) => {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    onValueChange(id, serializeMultiValue(next));
  };
  const isRowLayout = id === "q9";
  return (
    <fieldset className={wrapperClass}>
      <legend className="mb-2 w-full">{multiselectLegend}</legend>
      <div
        className={
          isRowLayout
            ? "flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-4"
            : "flex flex-col gap-2"
        }
      >
        {options.map((opt) => (
          <div
            key={opt.value}
            className={isRowLayout ? "flex items-center gap-2 md:gap-1" : "flex items-center gap-2"}
          >
            <Checkbox
              id={`${id}-${opt.value}`}
              checked={selected.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
            />
            <Label htmlFor={`${id}-${opt.value}`} className="font-normal cursor-pointer">
              {opt.label}
            </Label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export function IntakeField({
  id,
  label,
  placeholder,
  config,
  value,
  extraValue = "",
  onValueChange,
  onExtraChange,
  isDone,
  className = "",
  helpContent,
}: IntakeFieldProps) {
  const wrapperClass = getWrapperClass(isDone, className);
  const questionLabel = <QuestionLabel id={id} label={label} helpContent={helpContent} />;
  const labelBlock = <div className="w-full">{questionLabel}</div>;

  if (!config || config.type === "textarea") {
    return (
      <IntakeTextareaField
        id={id}
        label={label}
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
        wrapperClass={wrapperClass}
        questionLabel={questionLabel}
      />
    );
  }

  if (config.type === "input") {
    return (
      <IntakeInputField
        id={id}
        label={label}
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
        wrapperClass={wrapperClass}
        labelBlock={labelBlock}
      />
    );
  }

  if (config.type === "select") {
    return (
      <IntakeSelectField
        id={id}
        label={label}
        placeholder={placeholder}
        config={config}
        value={value}
        extraValue={extraValue}
        onValueChange={onValueChange}
        onExtraChange={onExtraChange}
        wrapperClass={wrapperClass}
        labelBlock={labelBlock}
      />
    );
  }

  if (config.type === "multiselect") {
    const multiselectLegend = <QuestionLabel id={id} label={label} helpContent={helpContent} asSpan />;
    return (
      <IntakeMultiselectField
        id={id}
        label={label}
        config={config}
        value={value}
        onValueChange={onValueChange}
        wrapperClass={wrapperClass}
        multiselectLegend={multiselectLegend}
      />
    );
  }

  return null;
}

type IntakeChecklistFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  checked: boolean;
  note: string;
  onCheckedChange: (id: string, checked: boolean) => void;
  onNoteChange: (key: string, value: string) => void;
  isDone: boolean;
};

export function IntakeChecklistField({
  id,
  label,
  placeholder,
  checked,
  note,
  onCheckedChange,
  onNoteChange,
  isDone,
}: IntakeChecklistFieldProps) {
  const wrapperClass = `rounded-md transition-colors p-3 ${
    isDone
      ? "border-r-4 border-primary bg-primary/5 dark:bg-primary/10"
      : "border-r-4 border-transparent bg-muted/30"
  }`;

  return (
    <div className={wrapperClass}>
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(c) => onCheckedChange(id, c === true)}
        />
        <Label htmlFor={id} className="text-sm font-normal text-foreground cursor-pointer">
          {label}
        </Label>
      </div>
      <Input
        value={note}
        onChange={(e) => onNoteChange(`${id}_note`, e.target.value)}
        placeholder={placeholder}
        className="mt-2"
      />
    </div>
  );
}
