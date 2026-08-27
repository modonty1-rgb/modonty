export type ClientEventCategory = 'article-review' | 'visitor-question' | 'article-revision' | 'media-processing';

export type ClientEvent = {
  id: string;
  category: ClientEventCategory;
  title: string;
  detail: string;
  occurredAt: string;
  actionLabel: string;
  isUnread: boolean;
};

export const mockClientEvents: ClientEvent[] = [
  { id: 'article-88', category: 'article-review', title: 'مقال ينتظر موافقتك', detail: 'كيف تبني حضورًا رقميًا يثق به عملاؤك', occurredAt: 'منذ 18 دقيقة', actionLabel: 'مراجعة', isUnread: true },
  { id: 'question-19', category: 'visitor-question', title: 'سؤال جديد من زائر', detail: 'هل تقدمون استشارة أولية قبل البدء؟', occurredAt: 'منذ ساعة', actionLabel: 'رد', isUnread: true },
  { id: 'revision-13', category: 'article-revision', title: 'تم تعديل المقال', detail: 'دليل اختيار الشركة المناسبة أصبح جاهزًا لمراجعتك', occurredAt: 'أمس', actionLabel: 'فتح', isUnread: false },
  { id: 'media-3', category: 'media-processing', title: 'جاري تجهيز الفيديو', detail: 'فيديو التعريف بالخدمة اكتمل الرفع', occurredAt: 'أمس', actionLabel: 'متابعة', isUnread: false },
];

export const mockReviewArticle = {
  title: 'كيف تبني حضورًا رقميًا يثق به عملاؤك؟',
  status: 'مقال جديد · بانتظار مراجعتك',
  readingTime: '4 دقائق قراءة',
  excerpt: 'الثقة لا تبدأ عند أول مكالمة؛ بل تبدأ من التفاصيل التي يراها العميل قبل أن يتواصل معك. في هذا المقال نعرض خطوات عملية لبناء حضور رقمي واضح، صادق، وسهل الفهم.',
};
