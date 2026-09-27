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
};
