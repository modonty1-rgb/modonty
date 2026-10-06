import type { BadgeTone } from '@/src/components/ui/Nabd';
import type { StatusTone } from '@/src/services/engagement-api';

/** نغمة الخادم ← نغمة الشارة: منشور/معتمد = تمّ · قيد المراجعة = انتظار · مرفوض = خطر. */
const badgeTone: Record<StatusTone, BadgeTone> = { primary: 'positive', warning: 'warning', danger: 'danger', muted: 'neutral' };

export function reelBadgeTone(tone: StatusTone | null): BadgeTone {
  return tone ? badgeTone[tone] : 'neutral';
}
