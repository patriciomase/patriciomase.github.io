import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

let instance: DB | null = null;

function init(): DB {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }
  instance = drizzle(neon(connectionString), { schema });
  return instance;
}

export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = instance ?? init();
    return Reflect.get(real, prop, receiver);
  },
});
