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
  await page.goto('http://localhost:3001/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"]', email); await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]'); await page.waitForTimeout(3000);
  await page.goto('http://localhost:3001/settings/business', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  console.log('url:', page.url());
  console.log('h1/h2:', await page.locator('h1,h2').first().innerText().catch(()=>'-'));
  console.log('inputs on page:', await page.locator('input').count());
  console.log('VAT label present:', await page.getByText('VAT number').count());
  const byPh = page.locator('input[placeholder="310000000000003"]');
  console.log('by placeholder:', await byPh.count(), await byPh.inputValue().catch(()=>'-'));
  await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/vat-page.png', fullPage: true });
} finally {
  await browser.close(); await db.staff.delete({ where: { email } }).catch(()=>{}); await db.$disconnect();
}
