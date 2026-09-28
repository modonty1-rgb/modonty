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
};
