import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); dotenv.config({ path: ".env" }); dotenv.config({ path: "../.env.shared" });
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { chromium } from '@playwright/test';
const db = new PrismaClient();
const email = "ui-ux-temp-tester@modonty.local", password = "Temp-UiUx-2026!";
const hash = await bcrypt.hash(password, 10);
await db.staff.upsert({ where: { email }, update: { password: hash, role: "ADMIN", isActive: true }, create: { email, name: "Temp Tester", password: hash, role: "ADMIN", isActive: true } });
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 950 } })).newPage();
try {
  await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);              // hydration
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await Promise.all([
    page.waitForURL(u => !u.pathname.includes('/login'), { timeout: 45000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(2000);
  console.log('after login url:', page.url());
  await page.goto('http://localhost:3001/settings/business', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  console.log('url:', page.url());
  const vat = page.locator('input[placeholder="310000000000003"]');
  const n = await vat.count();
  console.log('VAT field:', n, '· value:', n ? await vat.inputValue() : '-');
  const cr = page.locator('input[placeholder="4030xxxxxx"]');
  console.log('CR field value:', await cr.inputValue().catch(()=>'-'));
  if (n) { await vat.scrollIntoViewIfNeeded(); await page.waitForTimeout(400); }
  await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/vat-page.png' });
} finally {
  await browser.close(); await db.staff.delete({ where: { email } }).catch(()=>{}); await db.$disconnect();
}
