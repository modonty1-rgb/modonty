import { InfoRow } from '@/components/content/InfoRow';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { dateTime, fullDate } from '@/lib/format';
import { open } from '@/lib/nav';
import { meApi } from '@/services/api-actions';
import type { MeBookingsData } from '@/services/api-types-actions';

type Item = MeBookingsData['items'][number];

/** نفس تسميات صفحة الويب للحالة (`users/profile/bookings/page.tsx:21-26`)، وغير المعروف يُعامل «new» كما هناك. */
const STATUS: Record<string, string> = { new: 'بانتظار التواصل', contacted: 'تم التواصل معك', done: 'مكتمل', archived: 'مؤرشف' };

/** S23 — حجوزاتي (getProfileBookings). */
export default function BookingsScreen() {
  return (
    <Screen>
      <Header back title="حجوزاتي" />
      <SimpleList<Item>
        load={async (signal) => (await meApi.bookings(signal)).items}
        renderItem={({ item }) => (
          <InfoRow
            icon="booking"
            title={item.client.name}
            body={item.message ?? item.article?.title}
            badge={STATUS[item.status] ?? STATUS.new}
            meta={[item.preferredAt ? `الموعد المفضّل: ${dateTime(item.preferredAt)}` : null, `أُرسل ${fullDate(item.createdAt)}`].filter(Boolean).join(' · ')}
            onPress={() => open.partner(item.client.slug)}
          />
        )}
        keyOf={(i) => i.id}
        what="حجوزاتك"
        empty={{ icon: 'booking', title: 'لا حجوزات بعد', body: 'اطلب موعداً من صفحة أي شريك يتيح الحجز.' }}
      />
    </Screen>
  );
}
