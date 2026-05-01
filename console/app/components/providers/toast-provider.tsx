'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand
      visibleToasts={3}
      dir="rtl"
      theme="light"
      duration={5000}
      toastOptions={{
        classNames: {
          toast: 'border-2 shadow-xl !text-sm',
          title: '!font-bold !leading-tight',
          description: '!text-muted-foreground !leading-relaxed',
          closeButton: '!start-auto !end-2 !top-2 !left-auto',
        },
        style: {
          minHeight: '64px',
          padding: '14px 16px',
        },
      }}
    />
  );
}
