/**
 * أشكال ما يُدخله الشريك في «محتوى الموقع». أنواعٌ فقط، بلا `"use server"`: كانت تسكن
 * مع `updatePageContent` — وهي دالّة «احفظ كل شي» التي حُذفت في ٣١ أغسطس بعدما صار كل
 * قسم يحفظ نفسه من حواره. بقاء الأنواع في ملفّ أكشن محذوف المحتوى يخلق ملفّاً بلا سبب.
 */
export interface ServiceInput {
  title: string;
  description?: string | null;
  icon?: string | null;
}

export interface TeamMemberInput {
  name: string;
  role?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
}

export interface AchievementInput {
  value: string;
  label: string;
  image?: string | null;
  description?: string | null;
}

export interface CredentialInput {
  name: string;
  authority?: string | null;
  year?: string | null;
  url?: string | null;
}
