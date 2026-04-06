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
  switch (variant) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
    case "destructive":
      return <XCircle className="h-5 w-5 text-red-500 shrink-0" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
    default:
      return <Info className="h-5 w-5 text-blue-500 shrink-0" />
  }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3 items-start">
              <ToastIcon variant={variant as string} />
              <div className="grid gap-0.5">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
