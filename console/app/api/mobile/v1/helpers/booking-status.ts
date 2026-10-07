/**
 * الخطوة التالية الوحيدة لطلب تواصل (نموذج) في التطبيق — جديد ← تواصلت معه ← خلص.
 * نفس قيم حالة الكونسول (`/dashboard/bookings`)، فما يحفظه الجوال يقرؤه الويب كما هو.
 * طلب واتساب خبرٌ بلا خطوة، ولا يصله هذا الجدول أصلاً (الشاشة تعرض النموذج وحده).
 */
export const NEXT_BOOKING_STATUS: Record<string, { key: "contacted" | "done"; label: string } | undefined> = {
  new: { key: "contacted", label: "تواصلت معه" },
  contacted: { key: "done", label: "خلص" },
};
