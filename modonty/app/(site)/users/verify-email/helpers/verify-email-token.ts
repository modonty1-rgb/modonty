import { db } from "@/lib/db";

export type VerifyEmailTokenResult = "invalid" | "expired" | "verified";

/** Look the token up, drop it when expired, else mark the email verified and consume it. */
export async function verifyEmailToken(token: string): Promise<VerifyEmailTokenResult> {
  const record = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return "invalid";
  }

  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } }).catch(() => null);
    return "expired";
  }

  await Promise.all([
    db.user.updateMany({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    db.verificationToken.delete({ where: { token } }),
  ]);

  return "verified";
}
