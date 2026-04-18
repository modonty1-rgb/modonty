import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Creating TTL index on slug_change_otps.expiresAt ...");

  const result = await db.$runCommandRaw({
    createIndexes: "slug_change_otps",
    indexes: [
      {
        key: { expiresAt: 1 },
        name: "slug_change_otps_expiresAt_ttl",
        expireAfterSeconds: 0,
      },
    ],
  });

  console.log("Result:", JSON.stringify(result));
  console.log("✅ TTL index created — MongoDB will auto-delete expired OTP documents.");
}

main().catch(console.error).finally(() => db.$disconnect());
