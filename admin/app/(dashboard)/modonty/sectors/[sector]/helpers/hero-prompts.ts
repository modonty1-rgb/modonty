export interface HeroPrompt {
  /** The rules the image must keep — the page's text and buttons sit on the calm area. The size
   *  is not repeated here: the slot row shows it. */
  keys: string[];
  /** Paste into an image AI (ChatGPT) as-is. */
  prompt: string;
}

/**
 * The image-AI prompt for each sector hero, shown beside its slot in the admin (Khalid, 27 Sep
 * 2026: the calm area the text is written on comes from the prompt, so the prompt must sit where
 * the image is changed). A sector without an entry shows the slot without one.
 *
 * The ball line is there because the first images drew a ball with warped, irregular panels.
 */
const BALL = "a realistic modern match football with clean, symmetrical, correctly shaped panels (no warped, melted or irregular patterns)";
const RULES = "No text, no letters, no numbers except the \"? - ?\" on the scoreboard, no logos, no club badges, no real team kits, no people's faces.";
const AI_RULES = "No text, no letters, no numbers, no company logos, no robots with human faces, no people.";
const BUSINESS_RULES = "No text, no letters, no numbers, no currency symbols, no company logos, no people's faces.";
const EDUCATION_RULES = "No text, no letters, no numbers, no writing on the book pages, no logos, no people.";
const HEALTH_RULES = "No text, no letters, no numbers, no brand names, no logos, no people, no pills spilling or syringes.";
const OUTING_RULES = "No text, no letters, no numbers, no logos, no people, no musical instruments, no stages or screens.";
const PALETTE = "Color palette: deep navy #0E065A as the dominant background, electric blue #3030FF and bright teal #00D8D8 accents.";

export const HERO_PROMPTS: Record<string, { desktop: HeroPrompt; mobile: HeroPrompt }> = {
  football: {
    desktop: {
      keys: [
        "النصف الأيمن فاضي وهادئ — عليه العنوان والأزرار",
        "الكرة ولوحة النتيجة في الثلث الأيسر · بلا كتابة ولا شعارات",
      ],
      prompt: `Create an image: wide cinematic hero banner, 2048x768 (8:3 landscape), for an Arabic right-to-left page. A modern stadium at night under floodlights, ${BALL} in sharp focus in the LEFT third, a glowing digital scoreboard showing "? - ?" behind it, subtle confetti and light streaks. ${PALETTE} Keep the RIGHT half calm, dark and uncluttered — an Arabic headline and two buttons will be placed there. ${RULES} Premium, energetic, clean, high contrast, photorealistic with a slight illustrative glow.`,
    },
    mobile: {
      keys: [
        "النصف العلوي كاملاً فاضي وهادئ — عليه العنوان والسطر والأزرار",
        "الكرة ولوحة النتيجة في الربع السفلي، صغيرة ومكتملة غير مقصوصة",
      ],
      prompt: `Create an image: square mobile hero, 1080x1080 (1:1), same scene and style as the wide banner. A modern stadium at night, ${BALL} and a glowing "? - ?" scoreboard placed small in the BOTTOM quarter, fully inside the frame (not cropped). Keep the TOP 60% calm, dark navy with a soft glow — an Arabic headline, a line of text and two buttons will be placed there. ${PALETTE} ${RULES}`,
    },
  },
  ai: {
    desktop: {
      keys: [
        "النصف الأيمن فاضي وهادئ — عليه العنوان والسطر",
        "في الثلث الأيسر: شكل مجرّد لشبكة عصبية أو شريحة مضيئة · بلا روبوت بوجه بشري",
        "بلا كتابة ولا حروف ولا شعارات شركات",
      ],
      prompt: `Create an image: wide cinematic hero banner, 2048x768 (8:3 landscape), for an Arabic right-to-left page about artificial intelligence. In the LEFT third, an abstract glowing neural network — luminous nodes and flowing connection lines forming a soft sphere — resting above a sleek chip with fine circuit traces, in sharp focus. ${PALETTE} Keep the RIGHT half calm, dark and uncluttered — an Arabic headline and one line of text will be placed there. ${AI_RULES} Premium, calm, modern, high contrast, subtle depth of field.`,
    },
    mobile: {
      keys: [
        "النصف العلوي كاملاً فاضي وهادئ — عليه العنوان والسطر",
        "الشبكة العصبية المضيئة في الربع السفلي، صغيرة ومكتملة غير مقصوصة",
        "بلا كتابة ولا حروف ولا شعارات شركات",
      ],
      prompt: `Create an image: square mobile hero, 1080x1080 (1:1), same scene and style as the wide banner. An abstract glowing neural network sphere above a sleek chip, placed small in the BOTTOM quarter, fully inside the frame (not cropped). Keep the TOP 60% calm, dark navy with a soft glow — an Arabic headline and a line of text will be placed there. ${PALETTE} ${AI_RULES}`,
    },
  },
  entrepreneurship: {
    desktop: {
      keys: [
        "النصف الأيمن فاضي وهادئ — عليه العنوان والسطر",
        "في الثلث الأيسر: متجر صغير مضيء وسهم نمو صاعد · بلا أشخاص",
        "بلا كتابة ولا أرقام ولا رموز عملات ولا شعارات",
      ],
      prompt: `Create an image: wide cinematic hero banner, 2048x768 (8:3 landscape), for an Arabic right-to-left page about entrepreneurship and small business. In the LEFT third, a small modern glowing storefront with an open door, and a luminous upward growth arrow rising behind it like a path of light, in sharp focus. ${PALETTE} Keep the RIGHT half calm, dark and uncluttered — an Arabic headline and one line of text will be placed there. ${BUSINESS_RULES} Premium, calm, modern, high contrast, subtle depth of field.`,
    },
    mobile: {
      keys: [
        "النصف العلوي كاملاً فاضي وهادئ — عليه العنوان والسطر",
        "المتجر المضيء وسهم النمو في الربع السفلي، صغيرين ومكتملين غير مقصوصين",
        "بلا كتابة ولا أرقام ولا رموز عملات ولا شعارات",
      ],
      prompt: `Create an image: square mobile hero, 1080x1080 (1:1), same scene and style as the wide banner. A small modern glowing storefront with a luminous upward growth arrow behind it, placed small in the BOTTOM quarter, fully inside the frame (not cropped). Keep the TOP 60% calm, dark navy with a soft glow — an Arabic headline and a line of text will be placed there. ${PALETTE} ${BUSINESS_RULES}`,
    },
  },
  education: {
    desktop: {
      keys: [
        "النصف الأيمن فاضي وهادئ — عليه العنوان والسطر",
        "في الثلث الأيسر: كتب مفتوحة وقبعة تخرّج مضيئة · بلا أشخاص",
        "بلا كتابة ولا حروف ولا أرقام ولا شعارات",
      ],
      prompt: `Create an image: wide cinematic hero banner, 2048x768 (8:3 landscape), for an Arabic right-to-left page about school and university education. In the LEFT third, a stack of open books with a glowing graduation cap resting on top and soft light rising from the pages, in sharp focus. ${PALETTE} Keep the RIGHT half calm, dark and uncluttered — an Arabic headline and one line of text will be placed there. ${EDUCATION_RULES} Premium, calm, modern, high contrast, subtle depth of field.`,
    },
    mobile: {
      keys: [
        "النصف العلوي كاملاً فاضي وهادئ — عليه العنوان والسطر",
        "الكتب وقبعة التخرّج في الربع السفلي، صغيرة ومكتملة غير مقصوصة",
        "بلا كتابة ولا حروف ولا أرقام ولا شعارات",
      ],
      prompt: `Create an image: square mobile hero, 1080x1080 (1:1), same scene and style as the wide banner. A stack of open books with a glowing graduation cap on top, placed small in the BOTTOM quarter, fully inside the frame (not cropped). Keep the TOP 60% calm, dark navy with a soft glow — an Arabic headline and a line of text will be placed there. ${PALETTE} ${EDUCATION_RULES}`,
    },
  },
  entertainment: {
    desktop: {
      keys: [
        "النصف الأيمن فاضي وهادئ — عليه العنوان والسطر",
        "في الثلث الأيسر: منظر نزهة عائلية — نخيل وحديقة وأضواء وخريطة بدبوس مكان · بلا أشخاص",
        "بلا كتابة ولا حروف ولا أرقام ولا شعارات ولا آلات موسيقية",
      ],
      prompt: `Create an image: wide cinematic hero banner, 2048x768 (8:3 landscape), for an Arabic right-to-left page about family outings in Saudi cities. In the LEFT third, a calm evening park scene with palm trees, soft string lights and a glowing map pin floating above a winding path, in sharp focus. ${PALETTE} Keep the RIGHT half calm, dark and uncluttered — an Arabic headline and one line of text will be placed there. ${OUTING_RULES} Premium, calm, modern, high contrast, subtle depth of field.`,
    },
    mobile: {
      keys: [
        "النصف العلوي كاملاً فاضي وهادئ — عليه العنوان والسطر",
        "النخيل ودبوس المكان المضيء في الربع السفلي، صغيرة ومكتملة غير مقصوصة",
        "بلا كتابة ولا حروف ولا أرقام ولا شعارات ولا آلات موسيقية",
      ],
      prompt: `Create an image: square mobile hero, 1080x1080 (1:1), same scene and style as the wide banner. Palm trees, soft string lights and a glowing map pin above a winding path, placed small in the BOTTOM quarter, fully inside the frame (not cropped). Keep the TOP 60% calm, dark navy with a soft glow — an Arabic headline and a line of text will be placed there. ${PALETTE} ${OUTING_RULES}`,
    },
  },
  health: {
    desktop: {
      keys: [
        "النصف الأيمن فاضي وهادئ — عليه العنوان والسطر",
        "في الثلث الأيسر: علامة صحة مضيئة مع علبة دواء أنيقة وقارورة عناية · بلا أشخاص",
        "بلا كتابة ولا ماركات ولا شعارات",
      ],
      prompt: `Create an image: wide cinematic hero banner, 2048x768 (8:3 landscape), for an Arabic right-to-left page about health, medicines and personal care. In the LEFT third, a softly glowing medical cross shield beside a sleek plain medicine box and an elegant skincare bottle, with a faint heartbeat line of light behind them, in sharp focus. ${PALETTE} Keep the RIGHT half calm, dark and uncluttered — an Arabic headline and one line of text will be placed there. ${HEALTH_RULES} Premium, calm, modern, high contrast, subtle depth of field.`,
    },
    mobile: {
      keys: [
        "النصف العلوي كاملاً فاضي وهادئ — عليه العنوان والسطر",
        "علامة الصحة وعلبة الدواء وقارورة العناية في الربع السفلي، صغيرة ومكتملة",
        "بلا كتابة ولا ماركات ولا شعارات",
      ],
      prompt: `Create an image: square mobile hero, 1080x1080 (1:1), same scene and style as the wide banner. A softly glowing medical cross shield beside a plain medicine box and a skincare bottle, with a faint heartbeat line of light, placed small in the BOTTOM quarter, fully inside the frame (not cropped). Keep the TOP 60% calm, dark navy with a soft glow — an Arabic headline and a line of text will be placed there. ${PALETTE} ${HEALTH_RULES}`,
    },
  },
};
