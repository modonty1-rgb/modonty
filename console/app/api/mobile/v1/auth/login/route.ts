import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { issueMobileToken, mobileTokenTtlSeconds } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";

const loginInput = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(256) });

export async function POST(request: Request) {
  const parsed = await readBody(request as never, loginInput);
  if ("response" in parsed) return parsed.response;
  const { email, password } = parsed.value;
  const client = await db.client.findFirst({ where: { email }, select: { id: true, name: true, slug: true, email: true, password: true } });
  if (!client?.password || !(await bcrypt.compare(password, client.password))) {
    return fail("UNAUTHORIZED", "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  }
  const token = await issueMobileToken({ clientId: client.id, name: client.name, slug: client.slug, email: client.email });
  return ok({ accessToken: token, tokenType: "Bearer", expiresIn: mobileTokenTtlSeconds, client: { id: client.id, name: client.name, slug: client.slug, email: client.email } });
}
