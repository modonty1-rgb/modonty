import "server-only";
import { MongoClient, Db } from "mongodb";

const URL = process.env.JBRSEO_DATABASE_URL;
if (!URL) {
  throw new Error("JBRSEO_DATABASE_URL is not set in environment");
}

const OPTIONS = {
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  appName: "modonty-admin-jbrseo",
} as const;

declare global {
  var _jbrseoClientPromise: Promise<MongoClient> | undefined;
}

const clientPromise: Promise<MongoClient> =
  process.env.NODE_ENV === "development"
    ? (globalThis._jbrseoClientPromise ??= new MongoClient(URL, OPTIONS).connect())
    : new MongoClient(URL, OPTIONS).connect();

export async function getJbrseoDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db();
}

export async function closeJbrseoConnection(): Promise<void> {
  if (process.env.NODE_ENV === "development" && globalThis._jbrseoClientPromise) {
    const client = await globalThis._jbrseoClientPromise;
    await client.close();
    globalThis._jbrseoClientPromise = undefined;
  }
}
