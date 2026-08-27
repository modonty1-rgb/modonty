import { Image } from 'expo-image';
import RenderHtml, { type CustomBlockRenderer } from '@native-html/render';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { EmptyState } from '@/src/components/ui/MobileUI';
import { approveArticle, getArticle, MobileArticleDetail } from '@/src/services/mobile-api';
import { colors, control, fonts, media, radii, spacing, typography } from '@/src/theme/tokens';

type Props = { accessToken: string; articleId: string; onDone: () => void };

function ArticleImage({ uri, accessibilityLabel }: { uri: string; accessibilityLabel: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.imageFrame}>
      {isLoading ? <View accessibilityElementsHidden style={styles.imageSkeleton} /> : null}
      <Image
        accessibilityLabel={accessibilityLabel}
        contentFit="cover"
        onDisplay={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        onLoadStart={() => setIsLoading(true)}
        source={{ uri }}
        style={isLoading ? styles.imageHidden : styles.image}
      />
    </View>
  );
}

const HtmlImage: CustomBlockRenderer = ({ tnode }) => {
  const uri = tnode.attributes.src;
  if (!uri) return null;

  return <ArticleImage accessibilityLabel={tnode.attributes.alt ?? ''} uri={uri} />;
};

const htmlRenderers = { img: HtmlImage };

function ArticleReviewSkeleton() {
  return <View style={styles.state}><View style={styles.titleSkeleton} /><View style={styles.imageSkeleton} /><View style={styles.bodySkeleton} /></View>;
}

export function ArticleReviewApiRoute({ accessToken, articleId, onDone }: Props) {
  const [article, setArticle] = useState<MobileArticleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { width } = useWindowDimensions();
  const contentWidth = width - spacing.md - spacing.md;
  const load = () => { setError(null); setArticle(null); void getArticle(accessToken, articleId).then(setArticle).catch((reason) => setError(reason instanceof Error ? reason.message : 'تعذّر تحميل المقال.')); };
  useEffect(load, [accessToken, articleId]);
  const confirmApprove = () => Alert.alert('تأكيد اعتماد المقال', article?.title ?? '', [{ text: 'إلغاء', style: 'cancel' }, { text: 'اعتماد المقال', onPress: () => { setSubmitting(true); void approveArticle(accessToken, articleId).then(onDone).catch((reason) => setError(reason instanceof Error ? reason.message : 'تعذّر اعتماد المقال.')).finally(() => setSubmitting(false)); } }]);
  if (error) return <View style={styles.state}><EmptyState icon="articles" title="تعذّر تحميل المقال" copy={error} actionLabel="إعادة المحاولة" onAction={load} /></View>;
  if (!article) return <ArticleReviewSkeleton />;
  return <ScrollView contentContainerStyle={styles.screen}><Text style={styles.title}>{article.title}</Text>{article.featuredImage?.bunnyUrl ?? article.featuredImage?.url ? <ArticleImage accessibilityLabel={article.featuredImage.altText ?? article.title} uri={article.featuredImage.bunnyUrl ?? article.featuredImage.url} /> : null}{article.category ? <Text style={styles.category}>{article.category.name}</Text> : null}{article.content ? <RenderHtml baseStyle={styles.htmlBase} contentWidth={contentWidth} renderers={htmlRenderers} source={{ html: article.content }} tagsStyles={htmlTagsStyles} /> : null}<Pressable disabled={submitting} accessibilityRole="button" accessibilityLabel="اعتماد المقال" onPress={confirmApprove} style={[styles.approve, submitting && styles.disabled]}><Text style={styles.approveText}>{submitting ? 'يُعتمد المقال…' : 'اعتماد المقال'}</Text></Pressable></ScrollView>;
}

const styles = StyleSheet.create({ screen: { padding: spacing.md, paddingBottom: spacing.xxl }, state: { flex: 1, padding: spacing.md }, titleSkeleton: { height: typography.lineHeightPageTitle, borderRadius: radii.field, backgroundColor: colors.surfaceRaised, marginBottom: spacing.md }, imageSkeleton: { height: media.articleHeroHeight, borderRadius: radii.field, backgroundColor: colors.surfaceRaised, marginBottom: spacing.md }, bodySkeleton: { height: typography.lineHeightBody, borderRadius: radii.field, backgroundColor: colors.surfaceRaised }, title: { color: colors.text, fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, writingDirection: 'rtl', textAlign: 'right' }, imageFrame: { height: media.articleHeroHeight, borderRadius: radii.field, marginTop: spacing.md, overflow: 'hidden' }, image: { height: media.articleHeroHeight, width: '100%' }, imageHidden: { height: media.articleHeroHeight, opacity: 0, width: '100%' }, category: { color: colors.primary, fontFamily: fonts.medium, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, writingDirection: 'rtl', textAlign: 'right', marginTop: spacing.sm }, htmlBase: { color: colors.text, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl', textAlign: 'right' }, htmlHeading: { color: colors.textStrong, fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' }, htmlParagraph: { marginTop: spacing.md, textAlign: 'right', writingDirection: 'rtl' }, htmlLink: { color: colors.textInteractive }, htmlList: { marginTop: spacing.md, writingDirection: 'rtl' }, htmlListItem: { marginBottom: spacing.xs, textAlign: 'right', writingDirection: 'rtl' }, approve: { minHeight: control.buttonHeight, borderRadius: radii.button, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl }, disabled: { opacity: 0.6 }, approveText: { color: colors.textOnPrimary, fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' } });

const htmlTagsStyles = {
  a: styles.htmlLink,
  h1: styles.htmlHeading,
  h2: styles.htmlHeading,
  h3: styles.htmlHeading,
  li: styles.htmlListItem,
  ol: styles.htmlList,
  p: styles.htmlParagraph,
  ul: styles.htmlList,
};
