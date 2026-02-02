import { ArticleClassification } from "./article-view-types";

export function getArticleLengthClassification(wordCount: number): ArticleClassification {
  if (wordCount < 300) {
    return {
      label: "Very Short",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Quick tips or brief updates",
      range: "أقل من 300 كلمة",
      minimum: "الحد الأدنى الموصى به: 300 كلمة",
      recommended: "المستوى الموصى به: 300-600 كلمة",
      bestPractices: [
        "أضف المزيد من المحتوى - الحد الأدنى الموصى به هو 300 كلمة",
        "قم بتوسيع الموضوع بإضافة أمثلة وتفاصيل إضافية",
        "أضف قوائم منقطة أو مرقمة لتحسين القراءة",
        "تأكد من تغطية الموضوع بشكل كامل",
        "أضف صور أو رسوم توضيحية لدعم المحتوى",
      ],
    };
  } else if (wordCount < 600) {
    return {
      label: "Short",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Quick tips or direct answers",
      range: "300-600 كلمة",
      minimum: "الحد الأدنى: 300 كلمة",
      recommended: "المستوى الموصى به: 600-1000 كلمة",
      bestPractices: [
        "المحتوى جيد للمقالات السريعة والإجابات المباشرة",
        "يمكن تحسينه بإضافة المزيد من التفاصيل والأمثلة",
        "استهدف 600-1000 كلمة لتحسين SEO",
      ],
    };
  } else if (wordCount < 1000) {
    return {
      label: "Medium",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Short blog posts or news updates",
      range: "600-1000 كلمة",
      minimum: "الحد الأدنى: 600 كلمة",
      recommended: "المستوى الموصى به: 1000-2000 كلمة",
      bestPractices: [
        "حجم مناسب للمقالات القصيرة والتحديثات الإخبارية",
        "تأكد من تغطية الموضوع بشكل شامل",
        "أضف عناوين فرعية لتحسين البنية",
      ],
    };
  } else if (wordCount < 2000) {
    return {
      label: "Long",
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Standard blog posts or how-to guides",
      range: "1000-2000 كلمة",
      minimum: "الحد الأدنى: 1000 كلمة",
      recommended: "المستوى المثالي: 1500-2500 كلمة",
      bestPractices: [
        "حجم ممتاز للمقالات القياسية وأدلة التعليمات",
        "هذا الطول يحظى بتفضيل محركات البحث",
        "تأكد من تنظيم المحتوى بعناوين فرعية واضحة",
      ],
    };
  } else if (wordCount < 2500) {
    return {
      label: "Very Long",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "In-depth articles or case studies",
      range: "2000-2500 كلمة",
      minimum: "الحد الأدنى: 2000 كلمة",
      recommended: "المستوى المثالي: 2500+ كلمة",
      bestPractices: [
        "ممتاز للمقالات المتعمقة ودراسات الحالة",
        "هذا الطول يوفر قيمة كبيرة للقراء",
        "تأكد من استخدام فهرس أو قائمة محتويات",
      ],
    };
  } else {
    return {
      label: "Comprehensive",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Pillar content or ultimate guides",
      range: "2500+ كلمة",
      minimum: "الحد الأدنى: 2500 كلمة",
      recommended: "ممتاز - محتوى شامل ومفصل",
      bestPractices: [
        "محتوى شامل - ممتاز للمحتوى الأساسي والأدلة الشاملة",
        "هذا الطول يوفر أقصى قيمة للقراء ومحركات البحث",
        "تأكد من تقسيم المحتوى إلى أقسام واضحة",
      ],
    };
  }
}
