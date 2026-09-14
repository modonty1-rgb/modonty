import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); dotenv.config({ path: ".env" }); dotenv.config({ path: "../.env.shared" });
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { chromium } from '@playwright/test';

const db = new PrismaClient();
const email = "ui-ux-temp-tester@modonty.local", password = "Temp-UiUx-2026!";
await db.staff.upsert({
  where: { email },
  update: { password: await bcrypt.hash(password, 10), role: "ADMIN", isActive: true },
  create: { email, name: "Temp Tester", password: await bcrypt.hash(password, 10), role: "ADMIN", isActive: true },
});

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 950 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e)));
try {
  await page.goto('http://localhost:3001/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"]', email); await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]'); await page.waitForTimeout(2500);
  await page.goto('http://localhost:3001/settings/business', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const vat = page.locator('input[placeholder="310000000000003"]');
  const n = await vat.count();
  console.log('VAT field:', n, '· value:', n ? await vat.inputValue() : 'n/a');
  if (n) { await vat.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/vat-field.png' }); }
  console.log('page errors:', errs.length);
} finally {
  await browser.close();
  await db.staff.delete({ where: { email } }).catch(() => {});
  await db.$disconnect();
  console.log('cleaned up');
}
