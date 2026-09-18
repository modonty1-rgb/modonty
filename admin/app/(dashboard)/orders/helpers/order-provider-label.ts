import type { PaymentProvider } from "@prisma/client";

const LABELS: Record<PaymentProvider, string> = {
  NGENIUS: "بطاقة",
  TAMARA: "تمارا",
  BANK_TRANSFER: "تحويل بنكي",
  INSTAPAY: "إنستا باي",
  MIGRATED: "مرحَّل",
};

export function orderProviderLabel(provider: PaymentProvider): string {
  return LABELS[provider];
}
