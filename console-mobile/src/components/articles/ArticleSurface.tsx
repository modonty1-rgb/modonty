import { Image } from 'expo-image';
import RenderHtml, { defaultSystemFonts, type CustomBlockRenderer } from '@native-html/render';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { DecisionBar } from '@/src/components/articles/DecisionBar';
import { useKeyboardInset } from '@/src/components/ui/useKeyboardInset';
import { StatusBadge } from '@/src/components/ui/Nabd';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ArticleReviewDetail } from '@/src/services/articles-api';
import { articleContent, darkColors, fonts, lightColors, media, nabd, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ArticleSurfaceProps = {
  article: ArticleReviewDetail;
  isSubmitting: boolean;
  /** فشل الاعتماد أو طلب التعديل — يُعرض فوق الزرّين نفسيهما. */
  errorMessage: string | null;
  changesOpen: boolean;
  feedback: string;
  onApprove: () => void;
  onOpenChanges: () => void;
  onCancelChanges: () => void;
  onFeedbackChange: (value: string) => void;
  onSubmitChanges: () => void;
};

const HtmlImage: CustomBlockRenderer = ({ tnode }) => {
  const uri = tnode.attributes.src;
  if (!uri) return null;
  return <Image accessibilityLabel={tnode.attributes.alt ?? ''} contentFit="cover" source={uri} style={htmlImageStyles.image} transition={200} />;
};

const htmlImageStyles = StyleSheet.create({ image: { aspectRatio: media.cardImageAspectRatio, borderRadius: radii.field, marginTop: spacing.md, width: '100%' } });
const htmlRenderers = { img: HtmlImage };

/**
 * تسجيل خطوط الماركة عند المكتبة — بدونه **يسقط الخطّ صامتاً**.
 *
 * التوثيق الرسمي صريح: «Any `fontFamily` used must be registered with `systemFonts`»
 * (meliorence.github.io/react-native-render-html — `baseStyle` و`tagsStyles`). وكان
 * `baseStyle` يطلب Tajawal بلا تسجيل، فتتجاهله المكتبة وتقع على خطّ النظام:
 * **٢٨٤ عقدة نصّية من ٢٩٥ ترسم بـ`-apple-system`** — أي أنّ الشيء الذي يقرأه العميل فعلاً
 * (٢٬٠٤٢ كلمة) كان خارج هويّة التطبيق كلّها، بينما رأس الشاشة وحده بخطّ الماركة.
 */
const articleSystemFonts = [...defaultSystemFonts, fonts.regular, fonts.medium, fonts.bold];

export function ArticleSurface({ article, isSubmitting, errorMessage, changesOpen, feedback, onApprove, onOpenChanges, onCancelChanges, onFeedbackChange, onSubmitChanges }: ArticleSurfaceProps) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const htmlStyles = mode === 'dark' ? darkHtmlStyles : lightHtmlStyles;
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = width - spacing.screenHorizontal * 2;
  const scrollStyle = useMemo(() => [styles.scroll, { paddingBottom: spacing.xxl + insets.bottom }], [insets.bottom, styles.scroll]);
  const heroUri = article.featuredImage?.bunnyUrl ?? article.featuredImage?.url;
  const canDecide = article.status === 'AWAITING_APPROVAL';
  /**
   * فتح محرّر «طلب تعديل» يزيد ارتفاع المحتوى ≈١٠٠dp، والتمرير يبقى مكانه — فقِيس أنّ زرّ
   * «إرسال» يسقط **٦٨ بكسل تحت الطيّة**: العميل يضغط «طلب تعديل» فلا يرى ما يُرسل به.
   * فتحُ محرّرٍ وعدٌ بأن تُكمل فيه، والوعد يقتضي أن يكون كامله مرئياً.
   */
  useEffect(() => { if (changesOpen) scrollRef.current?.scrollToEnd({ animated: true }); }, [changesOpen]);
  /**
   * وفتح اللوحة نفسها يقصّر العرض: الشاشة تحجز ارتفاعها (`useKeyboardInset` — النافذة لا تنكمش
   * في edge-to-edge)، ثم ينزل التمرير إلى المحرّر كي يبقى الحقل وزرّ الإرسال فوقها.
   */
  const keyboardInset = useKeyboardInset();
  // بعد أن يقصر العرض فعلاً لا قبله: النزول قبل إعادة التخطيط لا يجد ما يمرّره (قِيس: بقي الزرّ تحت اللوحة).
  const followKeyboard = useCallback(() => { if (changesOpen && keyboardInset > 0) scrollRef.current?.scrollToEnd({ animated: true }); }, [changesOpen, keyboardInset]);

  /**
   * `h2` و`h3` نمطان لا نمط واحد.
   *
   * هذا المقال وحده فيه **١٦ عنوان قسم و٣١ عنواناً فرعياً** كانت تُرسم متطابقة تماماً —
   * فبنية نصّ من عشرين ألف حرف مسطَّحة، والقارئ لا يعرف أين ينتهي قسم ويبدأ آخر. والعنوان
   * الفرعي أصغر ووزنه أخفّ، فالتدرّج يُقرأ بلا شرح.
   */
  const tagsStyles = useMemo(() => ({ a: htmlStyles.link, blockquote: htmlStyles.quote, h1: htmlStyles.heading, h2: htmlStyles.heading, h3: htmlStyles.subheading, li: htmlStyles.listItem, ol: htmlStyles.list, p: htmlStyles.paragraph, strong: htmlStyles.strong, ul: htmlStyles.list }), [htmlStyles]);
  return <View style={[styles.surface, { paddingBottom: keyboardInset }]}>
    <ScrollView ref={scrollRef} contentContainerStyle={scrollStyle} keyboardShouldPersistTaps="handled" onLayout={followKeyboard}>
      {heroUri ? <Image accessibilityLabel={article.featuredImage?.altText ?? article.title} contentFit="cover" source={heroUri} style={styles.heroImage} transition={200} /> : null}
      {/* «نبض»: الشارة تحت الصورة على سطح نعرفه — فوق صورة العميل كان تباينها رهن البانر. */}
      <View style={styles.headBlock}>
        <StatusBadge label={article.review.article.heroBadgeLabel} tone={article.status === 'AWAITING_APPROVAL' ? 'warning' : 'positive'} />
        <Text style={styles.title}>{article.title}</Text>
        {article.review.article.headLabel ? <Text style={styles.head}>{article.review.article.headLabel}</Text> : null}
      </View>
      <View style={styles.contentCard}>
        {article.content
          ? <RenderHtml baseStyle={htmlStyles.base} contentWidth={contentWidth - spacing.md * 2} renderers={htmlRenderers} source={{ html: article.content }} systemFonts={articleSystemFonts} tagsStyles={tagsStyles} />
          : <Text style={styles.empty}>{article.review.article.emptyContentLabel}</Text>}
      </View>
      {article.review.ymyl ? <View style={styles.ymyl}>
        <Text style={styles.ymylTitle}>{article.review.ymyl.title}</Text>
        <Text style={styles.ymylBody}>{article.review.ymyl.description}</Text>
      </View> : null}
      {canDecide ? <DecisionBar review={article.review} isSubmitting={isSubmitting} errorMessage={errorMessage} changesOpen={changesOpen} feedback={feedback} onApprove={onApprove} onOpenChanges={onOpenChanges} onCancelChanges={onCancelChanges} onFeedbackChange={onFeedbackChange} onSubmitChanges={onSubmitChanges} /> : null}
    </ScrollView>
  </View>;
}

const shared = {
  surface: { flex: 1 },
  scroll: { paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  heroImage: { aspectRatio: media.cardImageAspectRatio, borderRadius: radii.field, width: '100%' as const },
  headBlock: { gap: spacing.xs, marginTop: spacing.md },
  head: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  title: { fontFamily: fonts.bold, fontSize: spacing.xl, lineHeight: spacing.xxl, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  contentCard: { borderRadius: nabd.cardRadius, marginTop: spacing.md, paddingBottom: spacing.md, paddingHorizontal: spacing.md },
  empty: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, marginTop: spacing.md, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  ymyl: { borderRadius: nabd.cardRadius, marginTop: spacing.md, padding: spacing.md },
  ymylTitle: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  ymylBody: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.xs, textAlign: 'right' as const, writingDirection: 'rtl' as const },
};

function stylesFor(palette: typeof darkColors) {
  return StyleSheet.create({
    ...shared,
    head: { ...shared.head, color: palette.muted },
    contentCard: { ...shared.contentCard, backgroundColor: palette.surface },
    title: { ...shared.title, color: palette.text },
    empty: { ...shared.empty, color: palette.muted },
    ymyl: { ...shared.ymyl, backgroundColor: palette.warningContainer },
    ymylTitle: { ...shared.ymylTitle, color: palette.onWarningContainer },
    ymylBody: { ...shared.ymylBody, color: palette.onWarningContainer },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);

/**
 * أنماط الـHTML **كائنات صريحة لا `StyleSheet.create`** — بأمر التوثيق الرسمي:
 * «Do NOT use the `StyleSheet` API to create those styles» (`baseStyle`/`tagsStyles`).
 * المكتبة تقرأ قيم النمط لتدمجها بأنماط الوسم، ومُعرِّف `StyleSheet` المُسجَّل ليس قيماً تُقرأ.
 */
function htmlStylesFor(palette: typeof darkColors) {
  return {
    base: { color: palette.text, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right' as const, writingDirection: 'rtl' as const },
    heading: { color: palette.textStrong, fontFamily: fonts.bold, fontSize: typography.title, lineHeight: typography.lineHeightTitle, marginTop: spacing.xl, textAlign: 'right' as const, writingDirection: 'rtl' as const },
    subheading: { color: palette.textStrong, fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, marginTop: spacing.md, textAlign: 'right' as const, writingDirection: 'rtl' as const },
    paragraph: { fontFamily: fonts.regular, marginTop: spacing.sm, textAlign: 'right' as const, writingDirection: 'rtl' as const },
    strong: { fontFamily: fonts.bold },
    /**
     * الرابط مسطَّر لا ملوَّناً فقط.
     *
     * WCAG 1.4.1 «Use of Color»: اللون وحده لا يجوز أن يكون الحامل الوحيد للمعلومة. وقارئ
     * المقال يراجع روابطه الخارجية — إلى أين تذهب ومن تُحيل — فإخفاؤها خلف فرق لونيّ فقط
     * يُفوّت جزءاً من المراجعة على من لا يميّز الألوان.
     */
    link: { color: palette.textInteractive, textDecorationLine: 'underline' as const },
    /**
     * الاقتباس كان يُرسم فقرةً عادية فيضيع معناه — الآن شريط جانبي وميل ولون أخفّ.
     *
     * والشريط `borderRight` **فيزيائيّ عن قصد**: التطبيق لا يعمل تحت `I18nManager.forceRTL`،
     * فـ`borderStart` كان سيُحسب يساراً — أي على الطرف الخطأ من نصّ عربي. وهذا نفس سبب
     * `textAlign: 'right'` في هذا الملفّ كلّه.
     */
    quote: { borderRightColor: palette.textInteractive, borderRightWidth: articleContent.quoteBarWidth, color: palette.muted, fontStyle: 'italic' as const, marginTop: spacing.md, paddingRight: spacing.md, textAlign: 'right' as const, writingDirection: 'rtl' as const },
    list: { marginTop: spacing.sm, writingDirection: 'rtl' as const },
    listItem: { marginBottom: spacing.xxs, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  };
}

const darkHtmlStyles = htmlStylesFor(darkColors);
const lightHtmlStyles = htmlStylesFor(lightColors);
