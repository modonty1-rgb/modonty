import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { compactNumber } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

export type CommentModel = {
  id: string;
  author: string;
  avatar: string | null;
  content: string;
  when: string | null;
  likes: number;
  liked: boolean;
  isReply: boolean;
  replyingTo: string | null;
  pending: boolean;
};

/** تعليق أو ردّ: الردود مُزاحة إلى الداخل وتسمّي من تردّ عليه. المعلّق (PENDING) موسوم نصّاً. */
export const CommentItem = memo(function CommentItem({
  item,
  onLike,
  onReply,
}: {
  item: CommentModel;
  onLike: (id: string) => void;
  onReply: (item: CommentModel) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.wrap, item.isReply && styles.reply, item.isReply && { borderStartColor: colors.border }]}>
      <View style={styles.head}>
        {item.avatar ? <Image source={item.avatar} style={styles.avatar} contentFit="cover" /> : <Icon name="profile" size={control.iconSmall} tone="muted" />}
        <AppText variant="label" style={styles.flex} numberOfLines={1}>
          {item.author}
        </AppText>
        {item.when ? (
          <AppText variant="secondary" tone="muted">
            {item.when}
          </AppText>
        ) : null}
      </View>
      {item.replyingTo ? (
        <AppText variant="secondary" tone="muted">
          {`ردّاً على ${item.replyingTo}`}
        </AppText>
      ) : null}
      <AppText variant="body">{item.content}</AppText>
      {item.pending ? (
        <View style={[styles.pending, { backgroundColor: colors.warningContainer }]}>
          <Icon name="clock" size={control.iconInline} tone="onWarningContainer" />
          <AppText variant="secondary" tone="onWarningContainer">
            بانتظار موافقة الشريك — يظهر للجميع بعد اعتماده
          </AppText>
        </View>
      ) : (
        <View style={styles.actions}>
          <Tap label={item.liked ? 'إلغاء الإعجاب بالتعليق' : 'أعجبني التعليق'} accessibilityState={{ selected: item.liked }} onPress={() => onLike(item.id)} style={styles.action}>
            <Icon name="like" size={control.iconInline} tone={item.liked ? 'interactive' : 'muted'} />
            <AppText variant="secondary" tone={item.liked ? 'interactive' : 'muted'}>
              {item.likes > 0 ? compactNumber(item.likes) : 'أعجبني'}
            </AppText>
          </Tap>
          <Tap label={`ردّ على ${item.author}`} onPress={() => onReply(item)} style={styles.action}>
            <Icon name="comment" size={control.iconInline} tone="muted" />
            <AppText variant="secondary" tone="muted">
              ردّ
            </AppText>
          </Tap>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: space.xxs, paddingVertical: space.xs },
  reply: { marginStart: space.xl, paddingStart: space.sm, borderStartWidth: 2 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  avatar: { width: control.iconSmall, height: control.iconSmall, borderRadius: radius.pill },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: space.md },
  action: { flexDirection: 'row', alignItems: 'center', gap: space.xxs, minWidth: 0 },
  pending: { flexDirection: 'row', alignItems: 'center', gap: space.xxs, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: space.xs, paddingVertical: space.xxs },
});
