import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { plainNumber } from '@/lib/format';
import { open, openExternal } from '@/lib/nav';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale } from '@/theme/tokens';

/**
 * كتل صفحة الشريك — Screens B · 08. كل كتلة تظهر فقط حين يملك الشريك بياناتها (مقيس على ٤٦ شريكاً:
 * الصور ١٧ · الأسئلة ٣٠ · المقالات ٣٢ · الخدمات ٩ · الطلّات ٦ · الاعتمادات ٦ · أرقام المؤسسة ٥).
 */

const XB = 'Tajawal_800ExtraBold';

/** عنوان كتلة ١٨/٢٨ w800 مع «الكل · N» اختياري. */
export function BlockTitle({ title, more }: { title: string; more?: { label: string; a11y: string; onPress: () => void } }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.titleRow}>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
        {title}
      </Text>
      {more ? (
        <Tap label={more.a11y} role="link" onPress={more.onPress} style={styles.more}>
          <Text style={[styles.moreText, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
            {more.label}
          </Text>
          <Icon name="chevron" size={18} tone="primaryText" monochrome />
        </Tap>
      ) : null}
    </View>
  );
}

/** رقاقة معلومة ٣٢ (المدينة · التأسيس · الدوام) — تُقرأ ولا تُضغط. */
export function InfoChip({ icon, label, tint }: { icon: ModontyIconName; label: string; tint?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.chip, { backgroundColor: tint ? colors.accentContainer : colors.sunken }]}>
      <Icon name={icon} size={16} tone={tint ? 'interactive' : 'textSecondary'} monochrome />
      <Text style={[styles.chipText, { color: tint ? colors.interactive : colors.textSecondary, fontFamily: tint ? 'Tajawal_700Bold' : 'Tajawal_500Medium' }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
        {label}
      </Text>
    </View>
  );
}

/** «الاعتمادات» + أرقام المؤسسة بوسم «أرقام تذكرها المؤسسة» (ادّعاء الشريك لا قياسنا). */
export function TrustCard({ credentials, stats }: { credentials: string[]; stats: { value: string; label: string }[] }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {credentials.length ? (
        <>
          <Text style={[styles.cardTitle, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
            الاعتمادات
          </Text>
          <View style={styles.chips}>
            {credentials.map((c, i) => (
              <InfoChip key={i} icon="success" label={c} tint />
            ))}
          </View>
        </>
      ) : null}
      {stats.length ? (
        <>
          <View style={styles.statsGrid}>
            {stats.map((s, i) => (
              <View key={i} style={[styles.stat, { backgroundColor: colors.sunken }]}>
                <Text style={[styles.statValue, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
                  {s.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.note}>
            <Icon name="info" size={14} tone="muted" monochrome />
            <Text style={[styles.noteText, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
              أرقام تذكرها المؤسسة
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

/** «نبذة» ٣ أسطر و«المزيد» يفتحها كاملة — الزرّ يظهر فقط إن كان النصّ أطول. */
export function AboutBlock({ text }: { text: string }) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);
  return (
    <View style={styles.block}>
      <BlockTitle title="نبذة" />
      <Text
        style={[styles.body, { color: colors.textSecondary }]}
        numberOfLines={open ? undefined : 3}
        onTextLayout={(e) => !open && !long && e.nativeEvent.lines.length >= 3 && setLong(true)}
        maxFontSizeMultiplier={dsFontScale.max}
      >
        {/* مطويّة: الفقرات تُدمج في سطر متّصل — وإلا انتهت الأسطر الثلاثة بسطر فارغ و«…» (مقيس ١٠ أكتوبر). */}
        {open ? text : text.replace(/\s*\n+\s*/g, ' ')}
      </Text>
      {long ? (
        <Tap label={open ? 'أقلّ' : 'المزيد'} minTarget onPress={() => setOpen((o) => !o)} style={styles.inline}>
          <Text style={[styles.moreText, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
            {open ? 'أقلّ' : 'المزيد'}
          </Text>
        </Tap>
      ) : null}
    </View>
  );
}

/** الخدمات — صفوف ٥٦ بمربّع أيقونة؛ بلا سهم: لا صفحة خدمة في التطبيق، والسهم وعدٌ بلا وجهة. */
export function ServicesBlock({ services }: { services: { title: string; description: string | null }[] }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.block}>
      <BlockTitle title="الخدمات" />
      <View style={styles.list}>
        {services.map((s, i) => (
          <View key={i} style={[styles.service, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.serviceIcon, { backgroundColor: colors.primaryContainer }]}>
              <Icon name="check" size={20} tone="primaryText" monochrome />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.serviceTitle, { color: colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
                {s.title}
              </Text>
              {s.description ? (
                <Text style={[styles.serviceDesc, { color: colors.textSecondary }]} numberOfLines={2} maxFontSizeMultiplier={dsFontScale.max}>
                  {s.description}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** الطلّات — بطاقات طولية ١٢٢×٢٠٤ كصفّ الرئيسية. الخادم لا يرجع المدّة هنا، فالشارة تشغيل فقط. */
export const ReelsBlock = memo(function ReelsBlock({ reels }: { reels: { title: string; href: string; imageUrl: string | null }[] }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.block}>
      <BlockTitle title="الطلّات" />
      <View style={styles.reels}>
        {reels.slice(0, 2).map((r) => {
          const slug = decodeURIComponent(r.href.split('/').filter(Boolean).pop() ?? '');
          return (
            <Tap key={r.href} label={`طلّة: ${r.title}`} role="link" scale={0.97} onPress={() => open.reel(slug)} style={[styles.reel, { backgroundColor: colors.navy }]}>
              {r.imageUrl ? <Image cachePolicy="memory-disk" source={r.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" recyclingKey={r.href} /> : null}
              <View style={[styles.reelBadge, { backgroundColor: colors.navy }]}>
                <Icon name="play" size={12} tone="onReels" monochrome />
              </View>
              <LinearGradient colors={['rgba(14,6,90,0)', 'rgba(14,6,90,0.9)', 'rgba(14,6,90,0.96)']} locations={[0, 0.3, 1]} style={styles.reelShade}>
                <Text style={styles.reelTitle} numberOfLines={3} maxFontSizeMultiplier={1.2}>
                  {r.title}
                </Text>
              </LinearGradient>
            </Tap>
          );
        })}
      </View>
    </View>
  );
});

/** الصور — الأولى بعرضين ثم اثنتان، والأخيرة «+N» إن زادت. الضغط يفتح المعرض. */
export const GalleryBlock = memo(function GalleryBlock({ images, onOpen }: { images: { url: string; alt: string | null }[]; onOpen: () => void }) {
  const { colors } = useAppTheme();
  const shown = images.slice(0, 3);
  const extra = images.length - shown.length;
  return (
    <View style={styles.block}>
      <BlockTitle title="الصور" more={{ label: `الكل · ${plainNumber(images.length)}`, a11y: `كل الصور، ${plainNumber(images.length)}`, onPress: onOpen }} />
      <View style={styles.grid}>
        {shown.map((g, i) => (
          <Tap
            key={g.url}
            label={g.alt || `صورة ${plainNumber(i + 1)}`}
            role="button"
            minTarget={false}
            onPress={onOpen}
            style={[i === 0 ? styles.gWide : styles.gHalf, { backgroundColor: colors.skeleton }]}
          >
            <Image cachePolicy="memory-disk" source={g.url} style={StyleSheet.absoluteFill} contentFit="cover" recyclingKey={g.url} />
            {i === shown.length - 1 && extra > 0 ? (
              <View style={styles.gMore}>
                <Text style={styles.gMoreText} maxFontSizeMultiplier={1.2}>{`\u2066+${plainNumber(extra)}\u2069`}</Text>
              </View>
            ) : null}
          </Tap>
        ))}
      </View>
    </View>
  );
});

/** المقالات — ٣ صفوف (العنوان ١٥/٢٣ · التاريخ · صورة ٧٢) و«الكل · N». */
export function PostsBlock({ posts, total, onAll }: { posts: { title: string; href: string; imageUrl: string | null; date: string | null }[]; total: number; onAll: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.block}>
      <BlockTitle title="المقالات" more={total > posts.slice(0, 3).length ? { label: `الكل · ${plainNumber(total)}`, a11y: `كل المقالات، ${plainNumber(total)}`, onPress: onAll } : undefined} />
      <View>
        {posts.slice(0, 3).map((p, i, all) => {
          const slug = decodeURIComponent(p.href.split('/').filter(Boolean).pop() ?? '');
          return (
            <Tap key={p.href} label={p.title} role="link" minTarget={false} onPress={() => open.article(slug)} style={[styles.post, i < all.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
              <View style={styles.flex}>
                <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={3} maxFontSizeMultiplier={dsFontScale.max}>
                  {p.title}
                </Text>
                {p.date ? (
                  <Text style={[styles.postDate, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
                    {p.date}
                  </Text>
                ) : null}
              </View>
              {p.imageUrl ? <Image cachePolicy="memory-disk" source={p.imageUrl} style={styles.postImg} contentFit="cover" recyclingKey={p.href} /> : null}
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

/** أسئلة شائعة — ٣ بطاقات تنفتح في مكانها (الأولى مفتوحة) و«كل الأسئلة · N». */
export function FaqBlock({ faqs, onAll }: { faqs: { question: string; answer: string }[]; onAll: () => void }) {
  const { colors } = useAppTheme();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <View style={styles.block}>
      <BlockTitle title="أسئلة شائعة" />
      <View style={styles.list}>
        {faqs.slice(0, 3).map((f, i) => {
          const on = openIdx === i;
          return (
            <View key={i} style={[styles.faq, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Tap label={f.question} accessibilityState={{ expanded: on }} minTarget={false} onPress={() => setOpenIdx(on ? null : i)} style={styles.faqHead}>
                <Text style={[styles.faqQ, { color: colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
                  {f.question}
                </Text>
                <View style={on ? styles.up : styles.down}>
                  <Icon name="chevron" size={20} tone="text" monochrome />
                </View>
              </Tap>
              {on ? (
                <Text style={[styles.faqA, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
                  {f.answer}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
      {faqs.length > 3 ? (
        <Tap label={`كل الأسئلة، ${plainNumber(faqs.length)}`} role="link" onPress={onAll} style={styles.inline}>
          <Text style={[styles.moreText, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
            {`كل الأسئلة · ${plainNumber(faqs.length)}`}
          </Text>
          <Icon name="chevron" size={18} tone="primaryText" monochrome />
        </Tap>
      ) : null}
    </View>
  );
}

const SOCIAL: { re: RegExp; icon: ModontyIconName; label: string }[] = [
  { re: /facebook\.com|fb\.com/i, icon: 'facebook', label: 'فيسبوك' },
  { re: /snapchat\.com/i, icon: 'snapchat', label: 'سناب شات' },
  { re: /instagram\.com/i, icon: 'instagram', label: 'إنستقرام' },
  { re: /tiktok\.com/i, icon: 'tiktok', label: 'تيك توك' },
  { re: /youtube\.com|youtu\.be/i, icon: 'youtube', label: 'يوتيوب' },
  { re: /twitter\.com|x\.com/i, icon: 'twitter', label: 'إكس' },
  { re: /linkedin\.com/i, icon: 'linkedin', label: 'لينكدإن' },
];

/** «الموقع والتواصل» — العنوان يفتح الخرائط · الدوام · الهاتف · البريد · الحسابات الاجتماعية. */
export function ContactBlock({
  address,
  mapHref,
  hours,
  phone,
  email,
  sameAs,
}: {
  address: string | null;
  mapHref: string | null;
  hours: { day: string; time: string }[];
  phone: string | null;
  email: string | null;
  sameAs: string[];
}) {
  const { colors } = useAppTheme();
  const socials = sameAs.map((url) => ({ url, ...SOCIAL.find((s) => s.re.test(url)) })).filter((s): s is { url: string; re: RegExp; icon: ModontyIconName; label: string } => !!s.icon);
  const rows: { key: string; icon: ModontyIconName; text: string; ltr?: boolean; onPress?: () => void; a11y?: string }[] = [];
  if (address) rows.push({ key: 'addr', icon: 'location', text: address, onPress: mapHref ? () => void openExternal(mapHref) : undefined, a11y: `العنوان: ${address}، افتح في الخرائط` });
  hours.forEach((h, i) => rows.push({ key: `h${i}`, icon: 'clock', text: `${h.day} ${h.time}` }));
  if (phone) rows.push({ key: 'tel', icon: 'phone', text: phone, ltr: true, onPress: () => void openExternal(`tel:${phone}`), a11y: `اتصال ${phone}` });
  if (email) rows.push({ key: 'mail', icon: 'email', text: email, ltr: true, onPress: () => void openExternal(`mailto:${email}`), a11y: `مراسلة ${email}` });
  if (!rows.length && !socials.length) return null;
  return (
    <View style={styles.block}>
      <BlockTitle title="الموقع والتواصل" />
      <View>
        {rows.map((r, i) => {
          const content = (
            <>
              <Icon name={r.icon} size={20} tone="text" monochrome />
              <Text style={[styles.contactText, { color: colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
                {/* الرقم والبريد يُعزلان باتجاه يسار-يمين داخل السطر العربي — وإلا قُلب «+20…» إلى «…20+». */}
                {r.ltr ? `\u2066${r.text}\u2069` : r.text}
              </Text>
              {r.onPress ? <Icon name="chevron" size={18} tone="muted" monochrome /> : null}
            </>
          );
          const style = [styles.contactRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }];
          return r.onPress ? (
            <Tap key={r.key} label={r.a11y ?? r.text} role="link" onPress={r.onPress} style={style}>
              {content}
            </Tap>
          ) : (
            <View key={r.key} style={style} accessible accessibilityLabel={r.text}>
              {content}
            </View>
          );
        })}
      </View>
      {socials.length ? (
        <View style={styles.socials}>
          {socials.map((s) => (
            <Tap key={s.url} label={s.label} role="link" scale={0.94} onPress={() => void openExternal(s.url)} style={styles.social}>
              <View style={[styles.socialIcon, { backgroundColor: colors.sunken }]}>
                <Icon name={s.icon} size={22} tone="text" monochrome />
              </View>
              <Text style={[styles.socialLabel, { color: colors.textSecondary }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {s.label}
              </Text>
            </Tap>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  block: { paddingHorizontal: ds.layout.gutter, paddingTop: ds.space.s6, gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 },
  title: { fontFamily: XB, fontSize: 18, lineHeight: 28, flexShrink: 1 },
  more: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  inline: { alignSelf: 'flex-start', minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 2 },
  chip: { minHeight: 32, paddingHorizontal: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' },
  chipText: { flexShrink: 1, fontSize: 13, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  card: { marginHorizontal: ds.layout.gutter, marginTop: ds.space.s5, borderRadius: ds.radius.lg, borderWidth: 1, padding: ds.space.s4, gap: ds.space.s3 },
  cardTitle: { fontFamily: XB, fontSize: 16, lineHeight: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { flexGrow: 1, flexBasis: '45%', borderRadius: 14, padding: 12, gap: 2 },
  statValue: { fontFamily: 'Tajawal_900Black', fontSize: 17, lineHeight: 24 },
  statLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 20 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noteText: { fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18 },
  body: { fontFamily: 'Tajawal_400Regular', fontSize: 15, lineHeight: 26 },
  list: { gap: 8 },
  service: { minHeight: 56, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  serviceIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 22 },
  serviceDesc: { fontFamily: 'Tajawal_400Regular', fontSize: 13, lineHeight: 20 },
  reels: { flexDirection: 'row', gap: 12 },
  reel: { width: 122, height: 204, borderRadius: 20, overflow: 'hidden' },
  reelBadge: { position: 'absolute', top: 8, start: 8, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  reelShade: { position: 'absolute', start: 0, end: 0, bottom: 0, height: '64%', paddingHorizontal: 10, paddingBottom: 10, justifyContent: 'flex-end' },
  reelTitle: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gWide: { width: '100%', height: 150, borderRadius: 16, overflow: 'hidden' },
  gHalf: { flexGrow: 1, flexBasis: '45%', height: 110, borderRadius: 16, overflow: 'hidden' },
  gMore: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,6,90,0.72)', alignItems: 'center', justifyContent: 'center' },
  gMoreText: { color: '#FFFFFF', fontFamily: XB, fontSize: 20, lineHeight: 26 },
  post: { paddingVertical: 12, flexDirection: 'row', gap: 14, alignItems: 'center' },
  postTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 23 },
  postDate: { fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18, marginTop: 6 },
  postImg: { width: 72, height: 72, borderRadius: 12 },
  faq: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  faqHead: { minHeight: 56, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  faqQ: { flex: 1, fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 24 },
  faqA: { paddingHorizontal: 16, paddingBottom: 16, fontFamily: 'Tajawal_400Regular', fontSize: 15, lineHeight: 28 },
  // السهم الأساسي يشير للأمام (يسار في العربية): مطويّ = لأسفل، مفتوح = لأعلى.
  down: { transform: [{ rotate: '-90deg' }] },
  up: { transform: [{ rotate: '90deg' }] },
  contactRow: { minHeight: 48, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactText: { flex: 1, fontFamily: 'Tajawal_500Medium', fontSize: 15, lineHeight: 22 },
  socials: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 4, rowGap: 8 },
  social: { width: '20%', alignItems: 'center', gap: 4 },
  socialIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  socialLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18 },
});
