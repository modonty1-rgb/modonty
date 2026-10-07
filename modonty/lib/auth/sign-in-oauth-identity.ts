import "server-only";

import { db } from "@/lib/db";
import { recordOAuthSignup } from "./record-oauth-signup";

/** هويّة تحقّق منها الخادم من توكن المزوّد (جوجل/أبل) — لا شيء هنا من جسم الطلب مباشرة. */
export interface VerifiedOAuthIdentity {
  provider: "google" | "apple";
  /** `sub` من التوكن — ثابت للمستخدم عند المزوّد. */
  providerAccountId: string;
  email: string | null;
  /** المزوّد يضمن أن البريد ملك صاحب الحساب. */
  emailVerified: boolean;
  name: string | null;
  image: string | null;
}

export type OAuthSignInResult =
  | { ok: true; userId: string; isNewUser: boolean }
  | { ok: false; reason: "email_missing" | "email_unverified" };

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; message?: string };
  return e?.code === "P2002" || (typeof e?.message === "string" && e.message.includes("Unique constraint failed"));
}

/**
 * دخول تطبيق القارئ بجوجل/أبل — **نفس** ما يفعله Auth.js مع PrismaAdapter على الويب
 * (`@auth/core/lib/actions/callback/handle-login.js` فرع OAuth):
 *
 * ١. `Account(provider, providerAccountId)` موجود → صاحبه.
 * ٢. وإلا مستخدم بنفس البريد → يُربط به حساب المزوّد (سياسة `allowDangerousEmailAccountLinking`
 *    في `auth.config.ts`) — **بشرط** أن المزوّد أكّد البريد. جوجل وأبل كلاهما يؤكّده.
 * ٣. وإلا مستخدم جديد بالشكل الذي يكتبه المحوّل (`name · email · image · emailVerified: null`)
 *    ثم `Account { type: "oidc" }` — ثم أثر `events.createUser` نفسه (`recordOAuthSignup`).
 *
 * فرق واحد مقصود عن الويب: Auth.js ينادي `events.createUser` حتى في فرع الربط بالبريد (فيعدّ
 * SIGNUP لحساب قديم)؛ هنا يُنادى للمستخدم الجديد فقط.
 */
export async function signInOAuthIdentity(identity: VerifiedOAuthIdentity): Promise<OAuthSignInResult> {
  const { provider, providerAccountId } = identity;

  const linked = await db.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    select: { userId: true },
  });
  if (linked) return { ok: true, userId: linked.userId, isNewUser: false };

  if (!identity.email) return { ok: false, reason: "email_missing" };
  if (!identity.emailVerified) return { ok: false, reason: "email_unverified" };

  let user = await db.user.findUnique({ where: { email: identity.email }, select: { id: true, name: true } });
  let isNewUser = false;
  if (!user) {
    try {
      user = await db.user.create({
        data: { name: identity.name, email: identity.email, image: identity.image, emailVerified: null },
        select: { id: true, name: true },
      });
      isNewUser = true;
    } catch (error) {
      // Two first sign-ins racing on the same email: the loser links to the winner's row.
      if (!isUniqueViolation(error)) throw error;
      user = await db.user.findUniqueOrThrow({ where: { email: identity.email }, select: { id: true, name: true } });
    }
  } else if (!user.name && identity.name) {
    // Apple sends the name only on the very first authorization — keep it if the row has none.
    await db.user.update({ where: { id: user.id }, data: { name: identity.name } });
  }

  try {
    await db.account.create({
      data: { userId: user.id, type: "oidc", provider, providerAccountId },
    });
  } catch (error) {
    // The same provider account linked by a parallel request — whoever owns it now wins.
    if (!isUniqueViolation(error)) throw error;
    const owner = await db.account.findUniqueOrThrow({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      select: { userId: true },
    });
    return { ok: true, userId: owner.userId, isNewUser: false };
  }

  if (isNewUser) await recordOAuthSignup(user.id, provider, "app");
  return { ok: true, userId: user.id, isNewUser };
}
