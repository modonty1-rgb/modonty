/**
 * What a reader can ask to be alerted about, and how.
 *
 * One list for the places that read it: the «التنبيهات» section of the reader's settings, and the
 * registration box a page sends a reader to (`?alert=<id>`). Adding a topic is one line here.
 * The first topic is the prediction contest Khalid is weighing for after Techne Summit
 * (27 Sep 2026) — collecting consent now, deciding the contest later.
 */
export const ALERT_TOPICS = [
  {
    id: "football",
    label: "مسابقة توقّعات الكورة",
    hint: "نبلّغك أول ما تنفتح التوقّعات على مباريات دوري روشن",
    consent: "نبّهني أول ما تنفتح مسابقة توقّعات الكورة",
  },
  // The AI page's weekly digest (Khalid, 28 Sep 2026): consent collected now, sending built later.
  {
    id: "ai",
    label: "ملخّص الذكاء الاصطناعي الأسبوعي",
    hint: "أهم النماذج والأبحاث الجديدة بالعربي، كل أسبوع على إيميلك",
    consent: "أرسل لي ملخّص الذكاء الاصطناعي كل أسبوع",
  },
] as const;

export type AlertTopicId = (typeof ALERT_TOPICS)[number]["id"];

export const ALERT_TOPIC_IDS = ALERT_TOPICS.map((t) => t.id) as [AlertTopicId, ...AlertTopicId[]];

export const ALERT_CHANNELS = [
  { id: "email", label: "الإيميل" },
  { id: "whatsapp", label: "واتساب" },
] as const;
// No SMS (Khalid, 27 Sep 2026): «حنشتغل بس ايميل او واتساب… الواتساب حيكون اي بي اي واتساب».

export type AlertChannelId = (typeof ALERT_CHANNELS)[number]["id"];

/** Channels that reach a phone — choosing one makes the phone number required. */
export const PHONE_CHANNELS: readonly AlertChannelId[] = ["whatsapp"];
