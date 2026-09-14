import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); dotenv.config({ path: ".env" }); dotenv.config({ path: "../.env.shared" });
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const s = await db.settings.findFirst({ select: { id: true, orgLegalName: true, orgCommercialRegistrationNumber: true, orgUnifiedNationalNumber: true, orgLegalForm: true } });
console.log(JSON.stringify(s, null, 1));
const url = process.env.DATABASE_URL || "";
console.log("DB:", url.split("/").pop()?.split("?")[0]);
await db.$disconnect();
