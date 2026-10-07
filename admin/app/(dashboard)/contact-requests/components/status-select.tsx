"use client";

import { useState, useTransition } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CONTACT_REQUEST_STATUSES,
  CONTACT_REQUEST_STATUS_LABEL,
  type ContactRequestStatus,
} from "../helpers/contact-request-statuses";

import { setContactRequestStatus } from "../actions/set-contact-request-status";

const TONE: Record<ContactRequestStatus, string> = {
  new: "border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300",
  contacted: "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
  done: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  archived: "border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
};

/** One select per row — the rep picks what the client told them; the server re-checks scope. */
export function StatusSelect({ id, status }: { id: string; status: ContactRequestStatus }) {
  const [value, setValue] = useState<ContactRequestStatus>(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onChange = (next: string) => {
    const previous = value;
    setValue(next as ContactRequestStatus);
    setError(null);
    startTransition(async () => {
      const result = await setContactRequestStatus({ id, status: next });
      if (!result.ok) {
        setValue(previous);
        setError(result.error ?? "ما انحفظت، جرّب مرّة ثانية");
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <Select value={value} onValueChange={onChange} disabled={pending} dir="rtl">
        <SelectTrigger aria-label="حالة الطلب" className={cn("h-8 w-36 text-xs font-medium", TONE[value])}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONTACT_REQUEST_STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {CONTACT_REQUEST_STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <span role="alert" className="text-[11px] text-rose-700 dark:text-rose-400">
          {error}
        </span>
      ) : null}
    </div>
  );
}
