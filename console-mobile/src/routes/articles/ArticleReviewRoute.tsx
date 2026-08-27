import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { fixtureArticles } from '@/src/data/client-fixtures';
import { Card, PrimaryAction, Screen, StatusPill } from '@/src/components/ui/MobileUI';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export function ArticleReviewRoute({ onDone }: { onDone: () => void }) {
  const { theme } = useAppTheme();
  const article = fixtureArticles[0];
  const [note, setNote] = useState('');
  const approve = () => { Alert.alert('تم اعتماد المقال', 'سيظهر القرار لفريق المحتوى عند ربط مصدر البيانات.'); onDone(); };
  const requestRevision = () => { if (!note.trim()) return Alert.alert('أضف ملاحظتك', 'اكتب التعديل المطلوب قبل الإرسال.'); Alert.alert('تم إرسال طلب التعديل', 'تم حفظ الملاحظة محليًا في هذه النسخة التجريبية.'); onDone(); };
  return <Screen title="مراجعة المقال" icon="articles"><Card><StatusPill>بانتظار اعتمادك</StatusPill><Text style={[styles.title, { color: theme.colors.text }]}>{article.title}</Text><Text style={[styles.meta, { color: theme.colors.muted }]}>مقال جديد · 4 دقائق قراءة</Text><View style={[styles.separator, { backgroundColor: theme.colors.border }]}/><Text style={[styles.articleText, { color: theme.colors.text }]}>هذا نموذج قراءة مريح على الجوال. يظهر الملخص أولًا، ثم يترك مساحة للنص الفعلي عند ربط المقال بالمصدر الحقيقي.</Text><Text style={[styles.articleText, { color: theme.colors.text }]}>نرتب الفكرة بطريقة تساعد العميل على فهم الخدمة واتخاذ خطوة واضحة بثقة، مع المحافظة على لغة النشاط وصوته.</Text></Card><Text style={[styles.label, { color: theme.colors.text }]}>اطلب تعديلًا عند الحاجة</Text><TextInput value={note} onChangeText={setNote} placeholder="اكتب الملاحظة لفريق المحتوى" placeholderTextColor={theme.colors.muted} multiline textAlign="right" style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}/><PrimaryAction label="اعتماد المقال" icon="question" onPress={approve} style={styles.action}/><PrimaryAction label="إرسال طلب التعديل" icon="comment" tone="secondary" onPress={requestRevision} style={styles.action}/></Screen>;
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 28, textAlign: 'right', writingDirection: 'rtl', marginTop: 15 },
  meta: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl', marginTop: 6 },
  separator: { height: 1, marginVertical: 18 },
  articleText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 26, writingDirection: 'rtl', textAlign: 'right', marginBottom: 14 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, writingDirection: 'rtl', textAlign: 'right', marginTop: 24, marginBottom: 8 },
  input: { minHeight: 112, borderWidth: 1, borderRadius: 16, padding: 14, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, writingDirection: 'rtl', textAlignVertical: 'top' },
  action: { marginTop: 12 },
});
