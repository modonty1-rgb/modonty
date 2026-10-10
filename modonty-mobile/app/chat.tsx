import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { Tap } from '@/components/ui/Tap';
import { useResource } from '@/hooks/useResource';
import { haptic } from '@/lib/haptics';
import { open } from '@/lib/nav';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { contentApi } from '@/services/api';
import { miscApi } from '@/services/api-actions';
import type { IndustryListItem } from '@/services/api-types';
import type { ChatArticleRef, ChatPartner } from '@/services/api-types-actions';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale } from '@/theme/tokens';

/** وجه مودو — المصدر الواحد `BRAND_CHARACTER_URL` (shared/lib/brand-assets.ts:18). */
const MODO = 'https://modonty-asset.b-cdn.net/brand/modonty-avatar.webp';

type Scope = { slug: string; name: string; art: string | null };
type Bubble =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; text: string; partners?: ChatPartner[]; article?: ChatArticleRef; pick?: boolean };

/** صورة المنصّة الافتراضية ليست رسماً للمجال. */
const art = (i: IndustryListItem) => (i.socialImage && !i.socialImage.includes('platform-default-logo') ? i.socialImage : null);

/**
 * مودو — Screens B · 12 (الترحيب) و13 (المحادثة)، على `/chat` نفسه (V3) بلا بثّ.
 * الخادم يشترط مجالاً لكل سؤال (`answer-chat-turn.ts:82` «لازم تحدّد مجالاً أو موضوعاً»)، ولا نقطة في واجهة
 * التطبيق تخمّن المجال (الويب يستعمل `suggest-industry` بكوكيه) — فمن يكتب بلا مجال يُطلب منه اختياره،
 * ويُرسل سؤاله فور الاختيار. «الشريك المناسب لسؤالك» من `partners` الجواب · «اسأل الشريك مباشرة» · نسخ.
 */
export default function ChatScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { status, user, requireAuth } = useAuth();
  const toast = useToast();
  const signedIn = status === 'signedIn';
  const industries = useResource(async (signal) => [...(await contentApi.industries({ page: 1 }, signal)).items].sort((a, b) => b.clientCount - a.clientCount), []);

  const [scope, setScope] = useState<Scope | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const pending = useRef<string | null>(null);
  const scroller = useRef<ScrollView>(null);

  const ask = useCallback(
    async (question: string, s: Scope, prior: Bubble[]) => {
      setBusy(true);
      try {
        // آخر ١٠ أدوار فقط (الخادم يقبل ١–٢٠) — بلا رسائل «اختر مجالاً» التي يكتبها التطبيق لا مودو.
        const turns = [...prior.filter((b) => !(b.role === 'assistant' && b.pick)), { id: 'q', role: 'user' as const, text: question }]
          .slice(-10)
          .map((b) => ({ role: b.role, content: b.text }));
        const r = await miscApi.chat({ messages: turns, conversationId, industrySlug: s.slug });
        setConversationId(r.conversationId);
        setBubbles((l) => [
          ...l,
          r.type === 'message'
            ? { id: `a-${Date.now()}`, role: 'assistant', text: r.text, partners: r.partners }
            : { id: `a-${Date.now()}`, role: 'assistant', text: r.message, partners: r.partners, article: r.suggestedArticle },
        ]);
      } catch (error) {
        setBubbles((l) => [...l, { id: `e-${Date.now()}`, role: 'assistant', text: toApiError(error).message }]);
      } finally {
        setBusy(false);
      }
    },
    [conversationId],
  );

  const send = () => {
    const q = text.trim();
    if (!q || busy) return;
    if (!signedIn) return requireAuth(() => undefined);
    setText('');
    const mine: Bubble = { id: `q-${Date.now()}`, role: 'user', text: q };
    if (!scope) {
      // بلا مجال: يُحفظ السؤال ويُطلب المجال — يُرسل فور اختياره.
      pending.current = q;
      setBubbles((l) => [...l, mine, { id: `p-${Date.now()}`, role: 'assistant', text: 'اختر مجال سؤالك من تحت، وأرسله لك فوراً.', pick: true }]);
      return;
    }
    const prior = bubbles;
    setBubbles((l) => [...l, mine]);
    void ask(q, scope, prior);
  };

  const pickScope = (i: IndustryListItem) => {
    haptic.selection();
    const s = { slug: i.slug, name: i.name, art: art(i) };
    setScope(s);
    if (pending.current) {
      const q = pending.current;
      pending.current = null;
      setBubbles((l) => l.filter((b) => !(b.role === 'assistant' && b.pick)));
      void ask(q, s, bubbles.filter((b) => !(b.role === 'assistant' && b.pick)).slice(0, -1));
    }
  };

  useEffect(() => {
    if (bubbles.length) requestAnimationFrame(() => scroller.current?.scrollToEnd({ animated: true }));
  }, [bubbles.length, busy]);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const welcome = bubbles.length === 0;
  const needsPick = bubbles.some((b) => b.role === 'assistant' && b.pick);
  const list = (industries.status === 'success' ? industries.data : null) ?? [];

  return (
    <Screen>
      <View style={[styles.top, { paddingTop: insets.top, backgroundColor: colors.page, borderBottomColor: welcome ? 'transparent' : colors.border }]}>
        <Tap label="رجوع" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.icon48}>
          <Icon name="back" size={24} tone="text" monochrome />
        </Tap>
        <View style={styles.topTitle}>
          <Image cachePolicy="memory-disk" source={MODO} style={styles.topFace} contentFit="cover" />
          <Text style={[styles.topName, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
            مودو
          </Text>
        </View>
        <Tap label="محادثاتي السابقة" onPress={() => (signedIn ? setHistoryOpen(true) : requireAuth(() => undefined))} style={styles.icon48}>
          <Icon name="clock" size={22} tone="text" monochrome />
        </Tap>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scroller} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {welcome ? (
            <View style={styles.hello}>
              <View style={styles.faceWrap}>
                <View style={[styles.faceBg, { backgroundColor: colors.accentContainer }]} />
                <View style={[styles.faceRing, { borderColor: colors.accent }]} />
                <Image cachePolicy="memory-disk" source={MODO} style={styles.face} contentFit="cover" accessibilityLabel="مودو" />
                <View style={[styles.spark, { backgroundColor: colors.primary, borderColor: colors.page }]}>
                  <Icon name="ai" size={14} tone="onPrimary" monochrome />
                </View>
              </View>
              <View style={[styles.speech, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.speechTip, { backgroundColor: colors.surface, borderColor: colors.border }]} />
                <Text style={[styles.helloTitle, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
                  {firstName ? `أهلاً ${firstName}` : 'أهلاً بك'}
                </Text>
                <Text style={[styles.helloText, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
                  {signedIn ? 'اختر مجال سؤالك من تحت، ثم اكتب سؤالك.' : 'مودو للقرّاء المسجّلين — ادخل واسأله عن أي مجال في مدونتي.'}
                </Text>
              </View>
            </View>
          ) : (
            bubbles.map((b) => (b.role === 'user' ? <Mine key={b.id} text={b.text} /> : <Answer key={b.id} b={b} />))
          )}
          {busy ? (
            <View style={styles.answerRow} accessibilityLabel="مودو يكتب">
              <Image cachePolicy="memory-disk" source={MODO} style={styles.answerFace} contentFit="cover" />
              <View style={[styles.typing, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.typingText, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
                  مودو يكتب…
                </Text>
              </View>
            </View>
          ) : null}
          {(welcome || needsPick) && !scope && list.length ? (
            <View style={styles.grid}>
              {list.map((i) => (
                <Tap key={i.id} label={i.name} scale={0.97} onPress={() => pickScope(i)} style={[styles.ind, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.indArt, { backgroundColor: colors.surfaceHigh }]}>{art(i) ? <Image cachePolicy="memory-disk" source={art(i)!} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Icon name="industries" size={20} />}</View>
                  <Text style={[styles.indName, { color: colors.text }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
                    {i.name}
                  </Text>
                </Tap>
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.foot, { paddingBottom: insets.bottom + 14, backgroundColor: colors.page, borderTopColor: colors.border }]}>
          {scope ? (
            <View style={[styles.scope, { backgroundColor: colors.primaryContainer }]}>
              {scope.art ? <Image cachePolicy="memory-disk" source={scope.art} style={styles.scopeArt} contentFit="cover" /> : null}
              <Text style={[styles.scopeText, { color: colors.primaryText }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {scope.name}
              </Text>
              <Tap label={`إزالة مجال ${scope.name}`} minTarget={false} hitSlop={10} onPress={() => setScope(null)} style={styles.scopeX}>
                <Icon name="close" size={16} tone="primaryText" monochrome />
              </Tap>
            </View>
          ) : null}
          <View style={[styles.composer, { backgroundColor: colors.inputSurface, borderColor: colors.borderStrong }]}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={scope ? `اسأل في ${scope.name}…` : 'اكتب سؤالك لمودو'}
              placeholderTextColor={colors.placeholder}
              multiline
              maxLength={2000}
              editable={!busy}
              accessibilityLabel="سؤالك لمودو"
              maxFontSizeMultiplier={1.2}
              style={[styles.input, { color: colors.text }]}
            />
            <Tap label="إرسال" disabled={!text.trim() || busy} onPress={send} style={[styles.send, { backgroundColor: text.trim() && !busy ? colors.primary : colors.surfaceHigh }]}>
              <Icon name="arrow" size={22} tone={text.trim() && !busy ? 'onPrimary' : 'muted'} monochrome />
            </Tap>
          </View>
          <Text style={[styles.disclaimer, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
            {'مودو مساعد ذكاء اصطناعي — ممكن يخطئ، وكلامه '}
            <Text maxFontSizeMultiplier={1.2} style={[styles.bold, { color: colors.text }]}>ليس استشارة مهنية</Text>
            {'. راجِع الشريك المختصّ قبل أي قرار.'}
          </Text>
        </View>
      </KeyboardAvoidingView>

      <HistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onPick={(m) => {
          setHistoryOpen(false);
          const ind = list.find((i) => i.slug === m.industrySlug);
          setScope(ind ? { slug: ind.slug, name: ind.name, art: art(ind) } : null);
          setConversationId(m.conversationId ?? undefined);
          setBubbles([
            { id: `${m.id}-q`, role: 'user', text: m.userQuery },
            { id: `${m.id}-a`, role: 'assistant', text: m.assistantResponse },
          ]);
        }}
        onNew={() => {
          setHistoryOpen(false);
          setBubbles([]);
          setConversationId(undefined);
          setScope(null);
          toast.show('محادثة جديدة', 'success');
        }}
      />
    </Screen>
  );
}

/** سؤال القارئ — فقاعة زرقاء في جهة النهاية (Screens B · 13). */
function Mine({ text: t }: { text: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.mine, { backgroundColor: colors.primary }]}>
      <Text style={[styles.mineText, { color: colors.onPrimary }]} maxFontSizeMultiplier={dsFontScale.max}>
        {t}
      </Text>
    </View>
  );
}

function Answer({ b }: { b: Extract<Bubble, { role: 'assistant' }> }) {
  const { colors } = useAppTheme();
  const toast = useToast();
  const partner = b.partners?.[0];
  return (
    <View style={styles.answerRow}>
      <Image cachePolicy="memory-disk" source={MODO} style={styles.answerFace} contentFit="cover" />
      <View style={styles.answerCol}>
        <View style={[styles.theirs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.theirsText, { color: colors.text }]} selectable maxFontSizeMultiplier={dsFontScale.max}>
            {b.text}
          </Text>
        </View>
        {!b.pick ? (
          <View style={styles.tools}>
            <View style={styles.flex} />
            <Tap
              label="نسخ الجواب"
              onPress={() => {
                void Clipboard.setStringAsync(b.text).then(() => toast.show('نُسخ الجواب', 'success'));
              }}
              style={styles.icon48}
            >
              <Icon name="copy" size={20} tone="text" monochrome />
            </Tap>
          </View>
        ) : null}
        {b.article ? (
          <Tap label={`اقرأ: ${b.article.title}`} role="link" onPress={() => open.article(b.article!.slug)} style={[styles.source, { backgroundColor: colors.sunken }]}>
            <Icon name="articles" size={16} tone="textSecondary" monochrome />
            <Text style={[styles.sourceText, { color: colors.textSecondary }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {`اقرأ: ${b.article.title}`}
            </Text>
          </Tap>
        ) : null}
        {partner ? (
          <>
            <View style={[styles.partner, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
              <Text style={[styles.partnerKicker, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
                الشريك المناسب لسؤالك
              </Text>
              <View style={styles.partnerRow}>
                <View style={[styles.partnerLogo, { borderColor: colors.border }]}>{partner.logo ? <Image cachePolicy="memory-disk" source={partner.logo} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Icon name="company" size={22} tone="muted" />}</View>
                <View style={styles.flex}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.partnerName, { color: colors.text }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
                      {partner.name}
                    </Text>
                    {partner.isVerified ? <Icon name="trust" size={16} tone="interactive" /> : null}
                  </View>
                  <Text style={[styles.partnerWhy, { color: colors.textSecondary }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
                    {partner.whyRecommended || [partner.city, partner.credential].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </View>
              <View style={styles.partnerActions}>
                {partner.canBook ? (
                  <Tap label={`احجز مع ${partner.name}`} scale={0.97} onPress={() => router.push({ pathname: '/partners/[slug]/book', params: { slug: partner.slug, name: partner.name, source: 'client_page' } })} style={[styles.bookBtn, { backgroundColor: colors.primary }]}>
                    <Icon name="booking" size={18} tone="onPrimary" monochrome />
                    <Text style={[styles.btnText, { color: colors.onPrimary }]} maxFontSizeMultiplier={1.2}>
                      احجز الآن
                    </Text>
                  </Tap>
                ) : null}
                <Tap label={`صفحة ${partner.name}`} role="link" scale={0.97} onPress={() => open.partner(partner.slug)} style={[styles.pageBtn, !partner.canBook && styles.flex, { borderColor: colors.borderStrong }]}>
                  <Text style={[styles.btnText, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
                    الصفحة
                  </Text>
                </Tap>
              </View>
            </View>
            <Tap
              label={`اسأل ${partner.name} مباشرة`}
              scale={0.97}
              onPress={() => router.push({ pathname: '/partners/[slug]/faqs', params: { slug: partner.slug, name: partner.name, ask: '1' } })}
              style={[styles.askBtn, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}
            >
              {partner.logo ? <Image cachePolicy="memory-disk" source={partner.logo} style={styles.askLogo} contentFit="cover" /> : null}
              <Text style={[styles.btnText, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
                اسأل الشريك مباشرة
              </Text>
            </Tap>
          </>
        ) : null}
      </View>
    </View>
  );
}

type HistoryItem = { id: string; conversationId: string | null; userQuery: string; assistantResponse: string; industrySlug: string | null; scopeLabel: string | null; createdAt: string };

/** «محادثاتي السابقة» — آخر ٢٠ سؤالاً (`/chat/history`)؛ الضغط يفتح السؤال وجوابه ويكمل في نفس المحادثة. */
function HistorySheet({ open: isOpen, onClose, onPick, onNew }: { open: boolean; onClose: () => void; onPick: (m: HistoryItem) => void; onNew: () => void }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const res = useResource(async (signal) => (isOpen ? (await miscApi.chatHistory(null, signal)).messages : null), [isOpen]);
  const items = res.data ?? [];
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={[styles.scrim, { backgroundColor: colors.scrim }]} onPress={onClose} accessibilityLabel="إغلاق" />
      <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 12 }]}>
        <View style={[styles.grab, { backgroundColor: colors.borderStrong }]} />
        <View style={styles.sheetHead}>
          <Text style={[styles.sheetTitle, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
            محادثاتي السابقة
          </Text>
          <Tap label="محادثة جديدة" onPress={onNew} style={[styles.newBtn, { backgroundColor: colors.primaryContainer }]}>
            <Icon name="add" size={18} tone="primaryText" monochrome />
            <Text style={[styles.newText, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
              جديدة
            </Text>
          </Tap>
        </View>
        {res.status === 'loading' ? (
          <ActivityIndicator style={styles.sheetLoad} color={colors.primary} />
        ) : res.status === 'error' ? (
          <Text maxFontSizeMultiplier={1.2} style={[styles.sheetEmpty, { color: colors.danger }]}>{res.error?.message}</Text>
        ) : items.length === 0 ? (
          <Text maxFontSizeMultiplier={1.2} style={[styles.sheetEmpty, { color: colors.muted }]}>لا محادثات بعد — اسأل مودو أوّل سؤال.</Text>
        ) : (
          <ScrollView>
            {items.map((m) => (
              <Tap key={m.id} label={m.userQuery} onPress={() => onPick(m)} style={[styles.histRow, { borderBottomColor: colors.border }]}>
                <View style={styles.flex}>
                  <Text style={[styles.histQ, { color: colors.text }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
                    {m.userQuery}
                  </Text>
                  {m.scopeLabel ? (
                    <Text style={[styles.histScope, { color: colors.muted }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                      {m.scopeLabel}
                    </Text>
                  ) : null}
                </View>
                <Icon name="chevron" size={18} tone="muted" monochrome />
              </Tap>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const XB = 'Tajawal_800ExtraBold';
const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  icon48: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  topTitle: { flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  topFace: { width: 32, height: 32, borderRadius: 16 },
  topName: { fontFamily: XB, fontSize: 18, lineHeight: 28 },
  body: { padding: ds.layout.gutter, paddingTop: 12, gap: 12 },
  hello: { alignItems: 'center' },
  faceWrap: { width: 120, height: 120, marginTop: 8 },
  faceBg: { ...StyleSheet.absoluteFillObject, borderRadius: 60 },
  faceRing: { position: 'absolute', top: -8, start: -8, end: -8, bottom: -8, borderRadius: 68, borderWidth: 2, borderStyle: 'dashed' },
  face: { position: 'absolute', top: 6, start: 6, width: 108, height: 108, borderRadius: 54 },
  spark: { position: 'absolute', bottom: 4, end: 6, width: 30, height: 30, borderRadius: 15, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  speech: { marginTop: 18, alignSelf: 'stretch', borderRadius: 24, borderWidth: 1, paddingVertical: 16, paddingHorizontal: 18, alignItems: 'center', gap: 6 },
  speechTip: { position: 'absolute', top: -8, alignSelf: 'center', width: 16, height: 16, borderTopWidth: 1, borderStartWidth: 1, transform: [{ rotate: '45deg' }] },
  helloTitle: { fontFamily: 'Tajawal_900Black', fontSize: 26, lineHeight: 36, textAlign: 'center' },
  helloText: { fontFamily: 'Tajawal_400Regular', fontSize: 15, lineHeight: 26, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  ind: { flexGrow: 1, flexBasis: '45%', minHeight: 60, borderRadius: 18, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  indArt: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  indName: { flex: 1, fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  mine: { alignSelf: 'flex-end', maxWidth: '78%', borderRadius: 20, borderBottomEndRadius: 6, paddingVertical: 12, paddingHorizontal: 16 },
  mineText: { fontFamily: 'Tajawal_500Medium', fontSize: 16, lineHeight: 26 },
  answerRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  answerFace: { width: 32, height: 32, borderRadius: 16 },
  answerCol: { flex: 1, gap: 10 },
  theirs: { borderRadius: 20, borderTopStartRadius: 6, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 16 },
  theirsText: { fontFamily: 'Tajawal_400Regular', fontSize: 16, lineHeight: 28 },
  typing: { borderRadius: 20, borderTopStartRadius: 6, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { fontFamily: 'Tajawal_500Medium', fontSize: 14, lineHeight: 20 },
  tools: { flexDirection: 'row', alignItems: 'center', marginTop: -6 },
  source: { alignSelf: 'flex-start', maxWidth: '100%', minHeight: 36, paddingHorizontal: 12, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sourceText: { flexShrink: 1, fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18 },
  partner: { borderRadius: 20, borderWidth: 1.5, padding: 14, gap: 12 },
  partnerKicker: { fontFamily: XB, fontSize: 13, lineHeight: 18 },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  partnerLogo: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, overflow: 'hidden', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  partnerName: { flexShrink: 1, fontFamily: XB, fontSize: 15, lineHeight: 22 },
  partnerWhy: { fontFamily: 'Tajawal_400Regular', fontSize: 13, lineHeight: 20 },
  partnerActions: { flexDirection: 'row', gap: 8 },
  bookBtn: { flex: 1, height: 48, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  pageBtn: { height: 48, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: XB, fontSize: 15, lineHeight: 20 },
  askBtn: { minHeight: 52, borderRadius: 26, borderWidth: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  askLogo: { width: 28, height: 28, borderRadius: 14 },
  foot: { paddingTop: 10, paddingHorizontal: ds.layout.gutter, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
  scope: { alignSelf: 'flex-start', maxWidth: '100%', height: 36, paddingStart: 6, paddingEnd: 6, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 6 },
  scopeArt: { width: 24, height: 24, borderRadius: 12 },
  scopeText: { flexShrink: 1, fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18 },
  scopeX: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  composer: { minHeight: 56, borderRadius: 28, borderWidth: 1, paddingStart: 16, paddingEnd: 4, paddingVertical: 4, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: { flex: 1, maxHeight: 120, minHeight: 48, paddingVertical: 12, fontFamily: 'Tajawal_500Medium', fontSize: 16, textAlign: 'right', writingDirection: 'rtl' },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { fontFamily: 'Tajawal_400Regular', fontSize: 12, lineHeight: 19, textAlign: 'center' },
  bold: { fontFamily: 'Tajawal_700Bold' },
  scrim: { flex: 1 },
  sheet: { maxHeight: '75%', borderTopStartRadius: 28, borderTopEndRadius: 28, paddingTop: 8, paddingHorizontal: ds.layout.gutter },
  grab: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2, marginBottom: 8 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  sheetTitle: { fontFamily: XB, fontSize: 18, lineHeight: 28 },
  newBtn: { height: 40, paddingHorizontal: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  newText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  sheetLoad: { marginVertical: 24 },
  sheetEmpty: { paddingVertical: 24, textAlign: 'center', fontFamily: 'Tajawal_500Medium', fontSize: 14, lineHeight: 22 },
  histRow: { minHeight: 64, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  histQ: { fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 22 },
  histScope: { fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18 },
});
