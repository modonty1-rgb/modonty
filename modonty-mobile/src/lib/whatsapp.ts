/**
 * رابط `wa.me` من رقم الشريك — أرقام الخادم بصيغة دولية (+966/+20؛ مقيس على الشركاء الـ٤٦ في ١٠ أكتوبر)،
 * فالأرقام وحدها تساوي `getWhatsAppLink` في الويب (`modonty/lib/whatsapp.ts`).
 */
export function whatsappHref(phone: string): string | null {
  const digits = phone.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}
