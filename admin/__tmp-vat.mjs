import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); dotenv.config({ path: ".env" }); dotenv.config({ path: "../.env.shared" });
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const url = process.env.DATABASE_URL || "";
const dbName = url.split("/").pop()?.split("?")[0];
if (dbName !== "modonty_dev") { console.error("REFUSED — not modonty_dev:", dbName); process.exit(1); }
const s = await db.settings.findFirst({ select: { id: true } });
await db.settings.update({
  where: { id: s.id },
  data: {
    orgVatNumber: "311021705709003",
    orgLegalName: "شركة جبر الجنوبية للمقاولات",
    orgCommercialRegistrationNumber: "4030524305",
    orgUnifiedNationalNumber: "7036024383",
  },
});
const after = await db.settings.findFirst({ select: { orgLegalName: true, orgVatNumber: true, orgCommercialRegistrationNumber: true, orgUnifiedNationalNumber: true } });
console.log("DB:", dbName);
console.log(JSON.stringify(after, null, 1));
await db.$disconnect();
