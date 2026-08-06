"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import { cx } from "../lib/cx";

export interface ConfirmDeleteLabels {
  trigger: string;
  title: string;
  description: string;
  confirm: string;
  cancel: string;
  working: string;
}

const AR: ConfirmDeleteLabels = {
  trigger: "احذف",
  title: "متأكد من الحذف؟",
  description: "الصورة تروح نهائياً وما تقدر ترجّعها.",
  confirm: "نعم، احذف",
  cancel: "رجوع",
  working: "جاري الحذف…",
};

interface Props {
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  labels?: Partial<ConfirmDeleteLabels>;
  /** `icon` = small button meant to sit on a thumbnail corner. `button` = labelled. */
  variant?: "icon" | "button";
  className?: string;
  /** Optional thumbnail shown in the confirm card — the user sees what they're deleting. */
  previewUrl?: string | null;
}

/**
 * Delete with a confirm step, shared across the repo.
 *
 * A one-click permanent delete on a client's own photo is the wrong default: the click
 * target sits on a thumbnail, next to other controls, and there is no undo behind it.
 * The confirm card is `fixed`, not a popover, so it can never be clipped by the
 * `overflow-hidden` image frame it is usually rendered inside.
 */
export function ConfirmDeleteButton({
  onConfirm,
  disabled,
  labels,
  variant = "icon",
  className,
  previewUrl,
}: Props) {
  const t = { ...AR, ...labels };
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !working) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, working]);

  async function confirm() {
    setWorking(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          aria-label={t.trigger}
          title={t.trigger}
          className={cx(
            "inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/90 text-red-600 shadow-sm backdrop-blur transition-colors hover:bg-red-500/10 disabled:opacity-50",
            className
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className={cx(
            "inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-background px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50",
            className
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.trigger}
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => !working && setOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
              </div>
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- may be an object URL
                <img
                  src={previewUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded object-cover ring-1 ring-border"
                />
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={working}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={working}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {working && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {working ? t.working : t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
