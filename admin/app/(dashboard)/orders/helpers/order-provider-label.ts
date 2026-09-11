import type { PaymentProvider } from "@prisma/client";

const LABELS: Record<PaymentProvider, string> = {
  NGENIUS: "بطاقة",
  TAMARA: "تمارا",
  BANK_TRANSFER: "تحويل بنكي",
};

export function orderProviderLabel(provider: PaymentProvider): string {
  return LABELS[provider];
}
