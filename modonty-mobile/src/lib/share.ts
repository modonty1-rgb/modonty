import { Share } from 'react-native';

import { webLink } from '@/services/config';

/**
 * المشاركة عبر ورقة النظام — الرابط رابط صفحة الويب نفسها (المحتوى العامّ المفهرَس). بلا
 * `EXPO_PUBLIC_WEB_URL` يُشارك العنوان وحده بدل رابط مخترَع. يُرجع `true` إن أكمل المستخدم المشاركة.
 */
export async function shareLink(title: string, path: string): Promise<boolean> {
  const url = webLink(path);
  const result = await Share.share(url ? { message: `${title}\n${url}`, url, title } : { message: title, title });
  return result.action === Share.sharedAction;
}
