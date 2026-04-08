'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      dir="rtl"
      theme="light"
      duration={4000}
    />
  );
}
