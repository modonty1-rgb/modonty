import "server-only";
import { MongoClient, Db } from "mongodb";

const globalForJbrseo = globalThis as unknown as {
  jbrseoClient?: MongoClient;
  jbrseoDb?: Db;
};

export async function getJbrseoDb(): Promise<Db> {
  if (globalForJbrseo.jbrseoDb) return globalForJbrseo.jbrseoDb;

  const url = process.env.JBRSEO_DATABASE_URL;
  if (!url) {
    throw new Error("JBRSEO_DATABASE_URL is not set in environment");
  }

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db();

  globalForJbrseo.jbrseoClient = client;
  globalForJbrseo.jbrseoDb = db;

  return db;
}

export async function closeJbrseoConnection(): Promise<void> {
  if (globalForJbrseo.jbrseoClient) {
    await globalForJbrseo.jbrseoClient.close();
    globalForJbrseo.jbrseoClient = undefined;
    globalForJbrseo.jbrseoDb = undefined;
  }
}
