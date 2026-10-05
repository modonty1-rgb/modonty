import { mobileRequest, type MobileStat } from '@/src/services/mobile-api';
import { networkCopy } from '@/src/services/account-api';

export type BookingStatusTone = 'pending' | 'done' | 'neutral';

export type BookingRequestItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  statusLabel: string;
  statusTone: BookingStatusTone;
  /** الخطوة التالية (جديد ← تواصلت معه ← خلص) — غائبة في الخادم الأقدم فلا زرّ. */
  nextStatus?: { key: 'contacted' | 'done'; label: string } | null;
  metaLabel: string | null;
};

export type BookingsScreen = {
  /** بلاطتا «نبض» (المفتوح · واتساب) — اختيارية كي يبقى الخادم الأقدم يعمل. */
  stats?: MobileStat[];
  screenTitle: string;
  backLabel: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  /** خبرٌ لا مهمّة: زوّار ضغطوا واتساب ولا أرقام محفوظة لهم، فلا فعل في هذا القسم. */
  whatsapp: { title: string; countLabel: string; description: string } | null;
  requests: BookingRequestItem[];
};

export const bookingFallbackText = {
  loadFailed: 'ما قدرنا نجيب طلبات التواصل.',
} as const;

/**
 * تسميات أزرار التواصل في بطاقة الطلب — أفعال الجهاز (اتصال · بريد · واتساب) لا محتوى من
 * الخادم، فمكانها هنا بجانب بقية نصوص الواجهة الثابتة لا داخل المكوّن.
 */
export const bookingContactCopy = {
  callPrefix: 'اتصل على',
  emailPrefix: 'راسل',
  whatsappLabel: 'واتساب',
  whatsappPrefix: 'افتح واتساب مع',
  openFailed: 'ما قدرنا نفتح التطبيق المناسب على جوالك.',
} as const;

export async function getBookings(accessToken: string): Promise<BookingsScreen> {
  return mobileRequest<BookingsScreen>('/bookings', accessToken, bookingFallbackText.loadFailed);
}

export function advanceBooking(accessToken: string, bookingId: string, status: 'contacted' | 'done'): Promise<{ booking: { id: string; status: string } }> {
  return mobileRequest(`/bookings/${bookingId}`, accessToken, 'تعذّر حفظ حالة الطلب.', { method: 'PATCH', body: { status } });
}


export { networkCopy };
