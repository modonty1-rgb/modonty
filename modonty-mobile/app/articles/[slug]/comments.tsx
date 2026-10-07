import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, View } from 'react-native';

import { CommentItem, type CommentModel } from '@/components/content/CommentItem';
import { Composer } from '@/components/content/Composer';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, StateView } from '@/components/ui/StateView';
import { useResource } from '@/hooks/useResource';
import { dateTime } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { actionsApi, contentApi } from '@/services/api';
import { commentsApi } from '@/services/api-actions';
import type { ArticleComment } from '@/services/api-types';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

/** الترتيب: كل تعليق رئيسي ثم ردوده تحته — الخادم يرجعها مسطّحة الأقدم أوّلاً (C6). */
function thread(comments: ArticleComment[]): CommentModel[] {
  const toModel = (c: ArticleComment): CommentModel => ({
    id: c.id,
    author: c.author?.name ?? 'قارئ',
    avatar: c.author?.image ?? null,
    content: c.content,
    when: dateTime(c.createdAt),
    likes: c._count.likes,
    liked: false,
    isReply: !!c.parentId,
    replyingTo: c.replyingTo?.authorName ?? null,
    pending: c.status === 'PENDING',
  });
  const replies = new Map<string, ArticleComment[]>();
  const roots: ArticleComment[] = [];
  for (const c of comments) {
    if (c.parentId && !c.isOrphaned) replies.set(c.parentId, [...(replies.get(c.parentId) ?? []), c]);
    else roots.push(c);
  }
  const out: CommentModel[] = [];
  const walk = (c: ArticleComment) => {
    out.push(toModel(c));
    for (const r of replies.get(c.id) ?? []) walk(r);
  };
  roots.forEach(walk);
  return out;
}

/** S03b — تعليقات المقال (C6 قراءة · E4 تعليق · E5 ردّ وإعجاب). المرسَل يظهر لك «بانتظار الشريك». */
export default function CommentsScreen() {
  const { slug, id, title } = useLocalSearchParams<{ slug: string; id: string; title?: string }>();
  const { colors } = useAppTheme();
  const { requireAuth, status } = useAuth();
  const toast = useToast();
  const res = useResource(async (signal) => thread((await contentApi.comments(id, signal)).comments), [id]);
  const [mine, setMine] = useState<CommentModel[]>([]);
  const [replyTo, setReplyTo] = useState<CommentModel | null>(null);

  const like = useCallback(
    (commentId: string) =>
      requireAuth(async () => {
        try {
          const r = await commentsApi.like(commentId, slug);
          res.setData((list) => list?.map((c) => (c.id === commentId ? { ...c, liked: r.liked, likes: r.likesCount } : c)) ?? null);
        } catch (error) {
          toast.show(toApiError(error).message, 'error');
        }
      }),
    [requireAuth, slug, res, toast],
  );

  const send = useCallback(
    async (text: string): Promise<boolean> => {
      if (status !== 'signedIn') {
        requireAuth(() => undefined);
        return false;
      }
      try {
        if (replyTo) {
          const r = await commentsApi.reply(replyTo.id, slug, text);
          setMine((m) => [...m, { id: r.reply.id, author: r.reply.author?.name ?? 'أنت', avatar: r.reply.author?.image ?? null, content: r.reply.content, when: dateTime(r.reply.createdAt), likes: 0, liked: false, isReply: true, replyingTo: replyTo.author, pending: r.reply.status === 'PENDING' }]);
          toast.show(r.message, 'success');
          setReplyTo(null);
        } else {
          const r = await actionsApi.comment(id, slug, text);
          setMine((m) => [...m, { id: r.comment.id, author: r.comment.author?.name ?? 'أنت', avatar: r.comment.author?.image ?? null, content: r.comment.content, when: dateTime(r.comment.createdAt), likes: 0, liked: false, isReply: false, replyingTo: null, pending: r.comment.status === 'PENDING' }]);
          toast.show(r.message, 'success');
        }
        return true;
      } catch (error) {
        toast.show(toApiError(error).message, 'error');
        return false;
      }
    },
    [id, slug, replyTo, status, requireAuth, toast],
  );

  const data = [...(res.data ?? []), ...mine];
  const renderItem = useCallback(
    ({ item }: { item: CommentModel }) => <CommentItem item={item} onLike={like} onReply={(c) => requireAuth(() => setReplyTo(c))} />,
    [like, requireAuth],
  );

  return (
    <Screen>
      <Header back title={title ? `التعليقات · ${title}` : 'التعليقات'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.flex}>
          {res.status === 'loading' ? (
            <ListSkeleton kind="row" />
          ) : res.status === 'error' ? (
            <ErrorState error={res.error} onRetry={res.reload} what="التعليقات" />
          ) : data.length === 0 ? (
            <StateView icon="comment" title="لا تعليقات بعد" body="كن أوّل من يعلّق — يظهر تعليقك بعد موافقة الشريك." />
          ) : (
            <FlashList
              data={data}
              renderItem={renderItem}
              keyExtractor={(c) => c.id}
              contentContainerStyle={styles.list}
              refreshControl={<RefreshControl refreshing={res.refreshing} onRefresh={res.refresh} tintColor={colors.primary} colors={[colors.primary]} />}
            />
          )}
        </View>
        <Composer placeholder={replyTo ? 'اكتب ردّك' : 'اكتب تعليقك'} onSend={send} replyTo={replyTo?.author} onCancelReply={() => setReplyTo(null)} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 }, list: { paddingHorizontal: space.screen, paddingVertical: space.sm } });
