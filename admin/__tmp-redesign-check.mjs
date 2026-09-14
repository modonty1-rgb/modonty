import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
dotenv.config({ path: "../.env.shared" });
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { chromium } from '@playwright/test';

const db = new PrismaClient();
const email = "ui-ux-temp-tester@modonty.local";
const password = "Temp-UiUx-2026!";
const hash = await bcrypt.hash(password, 10);
await db.staff.create({ data: { email, name: "UI UX Temp Tester", password: hash, role: "ADMIN", isActive: true } });

const base = 'http://localhost:3001';
const browser = await chromium.launch();
for (const scheme of ['dark','light']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, colorScheme: scheme });
  const page = await context.newPage();
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1200);
  await page.goto(`${base}/commercial-plans`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const err = await page.locator('text=Application error').count();
  console.log(scheme, 'app error count:', err);
  await page.locator('button[aria-label="فتح إعدادات الباقة"]').first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `C:/tmp/ultra-ui-evidence/redesign-${scheme}.png`, fullPage: true });
  await context.close();
}
await browser.close();
await db.staff.delete({ where: { email } });
console.log('done, cleaned up');
