import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

let instance: DB | null = null;

function init(): DB {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. See .env.example.");
  }
  instance = drizzle(neon(connectionString), { schema });
  return instance;
}

/**
 * Lazily-initialized Drizzle client. Connecting is deferred to first use so
 * `next build` doesn't require DATABASE_URL, while any query throws a clear
 * error if it's still missing at runtime.
 */
export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = instance ?? init();
    return Reflect.get(real, prop, receiver);
  },
});

export { schema };
