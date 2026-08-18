/**
 * A 24-hex-character id in MongoDB's ObjectId shape, so it fits the `@db.ObjectId` column.
 * Minted on the server for the first turn and echoed back to the client, which returns it on
 * every later turn — that is what ties the turns of one conversation together.
 */
export function newConversationId(now: number, random: () => number): string {
  const timestamp = Math.floor(now / 1000)
    .toString(16)
    .padStart(8, "0")
    .slice(-8);

  let rest = "";
  while (rest.length < 16) {
    rest += Math.floor(random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0");
  }

  return timestamp + rest.slice(0, 16);
}
