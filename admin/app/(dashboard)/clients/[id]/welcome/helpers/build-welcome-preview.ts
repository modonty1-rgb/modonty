import { randomInt } from "node:crypto";

import { db } from "@/lib/db";
import { clientWelcomeEmail } from "@/lib/email/templates/client-welcome";

const CONSOLE_URL = process.env.CONSOLE_URL || "https://console.modonty.com";

/**
 * **يولّد الكلمةَ ويرسم الرسالةَ — قبل أن تُرسَل.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «بيانات الدخول تمرّ بمرحلتين: صفحةٌ أشوف فيها الرسالة، لأنّ
 * فيها باسورد أبغى أشوفها وأشوف التمبلت اللي شغّالة، ومن هناك الإرسال يتمّ».
 *
 * ── ولماذا يُولَّد هنا لا عند الإرسال ──
 * المخزَّنُ **هشٌّ لا يُفكّ**، فلا سبيلَ لعرض كلمةٍ قائمة. وكان التوليدُ داخل الإرسال
 * نفسِه، فالمعاينةُ ستُظهر كلمةً والإرسالُ يبعث غيرَها — وهو الكذبُ الذي أصلحناه صباحاً
 * حين كان يرسل `admin123` الثابتة.
 *
 * فيولَّد هنا مرّةً، ويُعرض، ثمّ يُمرَّر إلى الإرسال كما هو. وكلُّ إعادةِ تحميلٍ تولّد
 * غيرَها — وهذا مقصود: لا شيءَ يُكتب في القاعدة حتّى تُضغط «أرسل».
 *
 * ── والمجموعة بلا أحرفٍ متشابهة ──
 * O/0 و l/1 تُقرأ خطأً حين تُملى بالهاتف. و`randomInt` من `node:crypto` لا
 * `Math.random`: كلمةُ مرورٍ تُحرس بعشوائيّةٍ مؤمَّنة.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function generateWelcomePassword(length = 14): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

export type WelcomePreview = {
  clientId: string;
  clientName: string;
  email: string;
  password: string;
  subject: string;
  html: string;
  hasStoredPassword: boolean;
  blocked: string | null;
};

export async function buildWelcomePreview(clientId: string): Promise<WelcomePreview | null> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, email: true, password: true },
  });
  if (!client) return null;

  const password = generateWelcomePassword();
  const email = client.email?.trim() ?? "";

  // تُرسَم الرسالةُ بنفس الدالّة التي يستعملها الإرسال — فما يُرى هو ما يصل، لا نسخةٌ منه.
  const rendered = email
    ? await clientWelcomeEmail({ clientName: client.name, email, password, consoleUrl: CONSOLE_URL })
    : { subject: "", html: "", text: "" };

  return {
    clientId: client.id,
    clientName: client.name,
    email,
    password,
    subject: rendered.subject,
    html: rendered.html,
    hasStoredPassword: Boolean(client.password),
    blocked: email ? null : "لا بريدَ للعميل — أضفه في «الحساب» واحفظ.",
  };
}
