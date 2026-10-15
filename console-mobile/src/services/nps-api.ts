import { mobileRequest } from '@/src/services/mobile-api';

/** نصوص استبيان الرضا وهل يحين — كلها من الخادم (`console/app/api/mobile/v1/nps`). */
export type NpsSurveyContract = {
  due: boolean;
  title: string;
  subtitle: string;
  lowLabel: string;
  highLabel: string;
  commentLabel: string;
  commentPlaceholder: string;
  submitLabel: string;
  submitWithoutCommentLabel: string;
  submittingLabel: string;
  closeLabel: string;
  thanksTitle: string;
  thanksBody: string;
  errorLabel: string;
};

export type NpsAnswer = { score: number; comment?: string } | { dismissed: true };

export function getNpsSurvey(accessToken: string): Promise<NpsSurveyContract> {
  return mobileRequest<NpsSurveyContract>('/nps', accessToken, 'تعذّر تحميل الاستبيان.');
}

export function submitNpsAnswer(accessToken: string, answer: NpsAnswer): Promise<{ saved: boolean }> {
  return mobileRequest<{ saved: boolean }>('/nps', accessToken, 'تعذّر إرسال التقييم.', { method: 'POST', body: answer });
}
