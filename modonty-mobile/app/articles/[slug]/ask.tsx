import { useLocalSearchParams } from 'expo-router';

import { AskForm } from '@/components/content/AskForm';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { commentsApi } from '@/services/api-actions';

/** S03c — اسأل الشريك عن هذا المقال (E13 — submitAskClient). */
export default function AskArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen>
      <Header back title="اسأل الشريك" />
      <AskForm intro="سؤالك يصل الشريك صاحب المقال، وقد يُضاف جوابه إلى أسئلة المقال." submit={(question) => commentsApi.askAboutArticle(id, { question })} />
    </Screen>
  );
}
