// Shared by every script of this skill: Prisma from the admin package, env from the repo root,
// and a hard stop on anything that is not modonty_dev — this skill writes test users and
// interactions, and must never reach production (Khalid, 29 Sep 2026: «على الديف»).
import { createRequire } from "module";
import path from "path";

const root = process.cwd();
const req = createRequire(path.join(root, "admin", "package.json"));
req("dotenv").config({ path: path.join(root, ".env.shared") });
req("dotenv").config({ path: path.join(root, "admin", ".env.local") });

const url = process.env.DATABASE_URL ?? "";
const dbName = url.match(/\/([^/?]+)(\?|$)/)?.[1] ?? "";
if (dbName !== "modonty_dev") {
  console.error(`STOP: DATABASE_URL points at «${dbName || "?"}», not modonty_dev. Run from the MODONTY repo root.`);
  process.exit(2);
}

const { PrismaClient } = req("@prisma/client");
export const db = new PrismaClient();
export const bcrypt = req("bcryptjs");
export const DB_NAME = dbName;

/** Test subscribers: qa-sub-01@test.local … — the label is in the name too, so nobody mistakes them for real people. */
export const TEST_EMAIL = (n) => `qa-sub-${String(n).padStart(2, "0")}@test.local`;
export const TEST_EMAIL_RE = /^qa-sub-\d+@test\.local$/;
export const TEST_PASSWORD = "Qa-Sub-2026!";

export function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

export async function testUsers() {
  const rows = await db.user.findMany({ where: { email: { startsWith: "qa-sub-" } }, select: { id: true, email: true, name: true } });
  return rows.filter((u) => TEST_EMAIL_RE.test(u.email ?? ""));
}
