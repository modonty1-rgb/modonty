import { mobileRequest } from '@/src/services/mobile-api';
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
  metaLabel: string | null;
};

export type BookingsScreen = {
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

export async function getBookings(accessToken: string): Promise<BookingsScreen> {
  return mobileRequest<BookingsScreen>('/bookings', accessToken, bookingFallbackText.loadFailed);
}


export { networkCopy };
