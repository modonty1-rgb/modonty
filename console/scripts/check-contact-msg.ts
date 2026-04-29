import { db } from "../lib/db";

async function main() {
  // Check the latest contact message
  const msg = await db.contactMessage.findFirst({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      message: true,
      clientId: true,
      createdAt: true,
    },
  });
  console.log("=== Latest ContactMessage ===");
  console.log(JSON.stringify(msg, null, 2));

  // Check Kimazone client telegram state
  const c = await db.client.findUnique({
    where: { id: "69e8927b6a15f350c2158a2e" },
    select: {
      name: true,
      telegramChatId: true,
      telegramEventPreferences: true,
    },
  });
  console.log("\n=== Kimazone Telegram State ===");
  console.log(JSON.stringify(c, null, 2));

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
