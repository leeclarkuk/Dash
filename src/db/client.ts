import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import path from "node:path";
import fs from "node:fs";
import { schema } from "./schema";
import { INIT_SQL } from "./sql";
import { seedIfEmpty } from "./seed";
import { env } from "@/lib/env";

type PostgresJs = ReturnType<typeof postgres>;
type PgliteDb = ReturnType<typeof drizzlePglite<typeof schema>>;
type PostgresDb = ReturnType<typeof drizzlePostgres<typeof schema>>;
export type Database = PgliteDb | PostgresDb;

type Handle = {
  db: Database;
  close?: () => Promise<void>;
};

const globalForDb = globalThis as unknown as {
  dashDb?: Promise<Handle>;
};

async function applySchema(run: (sql: string) => Promise<unknown>) {
  const statements = INIT_SQL.split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await run(`${statement};`);
  }
}

async function createHandle(): Promise<Handle> {
  const databaseUrl = env().databaseUrl;
  if (databaseUrl) {
    const client: PostgresJs = postgres(databaseUrl, { max: 4 });
    await applySchema((sql) => client.unsafe(sql));
    const db = drizzlePostgres(client, { schema });
    await seedIfEmpty(db);
    return {
      db,
      close: async () => {
        await client.end({ timeout: 2 });
      },
    };
  }

  const dataDir = path.join(process.cwd(), ".data", "dash");
  fs.mkdirSync(dataDir, { recursive: true });
  const pglite = new PGlite(dataDir);
  await pglite.waitReady;
  await applySchema((sql) => pglite.exec(sql));
  const db = drizzlePglite(pglite, { schema });
  await seedIfEmpty(db);
  return {
    db,
    close: async () => {
      await pglite.close();
    },
  };
}

export async function getDb(): Promise<Database> {
  if (!globalForDb.dashDb) {
    globalForDb.dashDb = createHandle();
  }
  const handle = await globalForDb.dashDb;
  return handle.db;
}
