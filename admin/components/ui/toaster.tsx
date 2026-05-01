"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"

function ToastIcon({ variant }: { variant?: string }) {
  const baseRing = "shrink-0 h-9 w-9 rounded-full flex items-center justify-center ring-1"
  switch (variant) {
    case "success":
      return <div className={`${baseRing} bg-emerald-500/15 ring-emerald-500/30`}><CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
    case "destructive":
      return <div className={`${baseRing} bg-red-500/15 ring-red-500/30`}><XCircle className="h-5 w-5 text-red-600 dark:text-red-400" /></div>
    case "warning":
      return <div className={`${baseRing} bg-amber-500/15 ring-amber-500/30`}><AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
    default:
      return <div className={`${baseRing} bg-blue-500/15 ring-blue-500/30`}><Info className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
  }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3 items-start flex-1 min-w-0">
              <ToastIcon variant={variant as string} />
              <div className="flex-1 min-w-0 pt-0.5">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
                {action && <div className="mt-2">{action}</div>}
              </div>
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
