/**
 * Arabic text utilities — shared across story components.
 * Tashkeel (diacritics) are useful for TTS pronunciation but visually noisy for readers.
 */

export const TASHKEEL_REGEX = /[\u064B-\u0652\u0670\u0656-\u065F]/g;

export const stripTashkeel = (s: string): string => s.replace(TASHKEEL_REGEX, "");
