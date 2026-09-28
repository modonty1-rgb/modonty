"use client";

import { useFormStatus } from "react-dom";

import { IconLoading } from "@/lib/icons";

/** The «نبّهني» submit — shows it is working, since the page only changes once the save returns. */
export function NotifyButton({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} gap-2 disabled:opacity-70`}>
      {pending && <IconLoading className="size-4 animate-spin" aria-hidden />}
      {label}
    </button>
  );
}
