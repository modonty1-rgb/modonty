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
const firstPlan = await db.commercialPlan.findFirst({ orderBy: { displayOrder: "asc" } });

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[name="email"], input[type="email"]', email);
await page.fill('input[name="password"], input[type="password"]', password);
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);

await page.goto(`${base}/commercial-plans/${firstPlan.id}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200); // allow client-side breadcrumb fetch
const breadcrumbText = await page.locator('nav[aria-label="Breadcrumb"]').innerText();
console.log('breadcrumb text:', JSON.stringify(breadcrumbText));
await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/breadcrumb-fixed.png', clip: { x: 0, y: 0, width: 1280, height: 60 } });

await context.close();
await browser.close();
await db.staff.delete({ where: { email } });
console.log('cleaned up');
