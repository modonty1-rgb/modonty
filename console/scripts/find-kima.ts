import { db } from "../lib/db";

async function main() {
  const c = await db.client.findFirst({
    where: { name: { contains: "كيما" } },
    select: {
      id: true,
      name: true,
      slug: true,
      telegramChatId: true,
      telegramEventPreferences: true,
    },
  });
  console.log(JSON.stringify(c, null, 2));
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
