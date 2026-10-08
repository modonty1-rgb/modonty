import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

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
import { reelActionsApi } from '@/services/api-actions';
import { moreContentApi } from '@/services/api-content';
import type { ReelComment } from '@/services/api-types-content';
import { toApiError } from '@/services/errors';
import { space } from '@/theme/tokens';

function thread(comments: ReelComment[]): CommentModel[] {
  const replies = new Map<string, ReelComment[]>();
  const roots: ReelComment[] = [];
  for (const c of comments) {
    if (c.parentId) replies.set(c.parentId, [...(replies.get(c.parentId) ?? []), c]);
    else roots.push(c);
  }
  const out: CommentModel[] = [];
  const walk = (c: ReelComment) => {
    out.push({ id: c.id, author: c.author?.name ?? 'قارئ', avatar: c.author?.image ?? null, content: c.content, when: dateTime(c.createdAt), likes: c.likesCount, liked: c.likedByMe, isReply: !!c.parentId, replyingTo: c.replyingTo?.authorName ?? null, pending: false });
    for (const r of replies.get(c.id) ?? []) walk(r);
  };
  roots.forEach(walk);
  // ردود يتيمة (أصلها لم يُعتمد) تُعرض في آخر القائمة بدل أن تختفي.
  const placed = new Set(out.map((c) => c.id));
  for (const c of comments) if (!placed.has(c.id)) walk(c);
  return out;
}

/** S10c — تعليقات الريل (C17 قراءة مع «أعجبني» الخاصّ بك · E18 تعليق/ردّ/إعجاب). */
export default function ReelCommentsScreen() {
  const { id } = useLocalSearchParams<{ slug: string; id: string }>();
  const { requireAuth, status } = useAuth();
  const toast = useToast();
  const res = useResource(async (signal) => thread((await moreContentApi.reelComments(id, signal)).comments), [id, status]);
  const [mine, setMine] = useState<CommentModel[]>([]);
  const [replyTo, setReplyTo] = useState<CommentModel | null>(null);

  const like = useCallback(
    (commentId: string) =>
      requireAuth(async () => {
        try {
          const r = await reelActionsApi.likeComment(commentId);
          res.setData((list) => list?.map((c) => (c.id === commentId ? { ...c, liked: r.liked, likes: r.likesCount } : c)) ?? null);
        } catch (error) {
          toast.show(toApiError(error).message, 'error');
        }
      }),
    [requireAuth, res, toast],
  );

  const send = useCallback(
    async (text: string) => {
      if (status !== 'signedIn') {
        requireAuth(() => undefined);
        return false;
      }
      try {
        const r = replyTo ? await reelActionsApi.reply(replyTo.id, text) : await reelActionsApi.comment(id, text);
        const newId = 'replyId' in r ? r.replyId : r.commentId;
        setMine((m) => [...m, { id: newId, author: 'أنت', avatar: null, content: text, when: null, likes: 0, liked: false, isReply: !!replyTo, replyingTo: replyTo?.author ?? null, pending: true }]);
        toast.show(r.message, 'success');
        setReplyTo(null);
        return true;
      } catch (error) {
        toast.show(toApiError(error).message, 'error');
        return false;
      }
    },
    [id, replyTo, status, requireAuth, toast],
  );

  const data = [...(res.data ?? []), ...mine];
  return (
    <Screen>
      <Header back title="تعليقات الريل" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.flex}>
          {res.status === 'loading' ? (
            <ListSkeleton kind="row" />
          ) : res.status === 'error' ? (
            <ErrorState error={res.error} onRetry={res.reload} what="التعليقات" />
          ) : data.length === 0 ? (
            <StateView icon="comment" title="لا تعليقات بعد" body="كن أوّل من يعلّق." />
          ) : (
            <FlashList data={data} keyExtractor={(c) => c.id} contentContainerStyle={styles.list} renderItem={({ item }) => <CommentItem item={item} onLike={like} onReply={(c) => requireAuth(() => setReplyTo(c))} />} />
          )}
        </View>
        <Composer placeholder={replyTo ? 'اكتب ردّك' : 'اكتب تعليقك'} onSend={send} replyTo={replyTo?.author} onCancelReply={() => setReplyTo(null)} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 }, list: { paddingHorizontal: space.screen, paddingVertical: space.sm } });
