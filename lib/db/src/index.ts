import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Connection priority:
// 1. SUPABASE_DATABASE_URL (preferred — production Supabase)
// 2. DATABASE_URL (local Replit PostgreSQL — dev fallback)
//
// Supabase direct TCP (db.*.supabase.co:5432) resolves IPv6-only from Replit dev
// containers and will fail to connect. In that case the local DB is used automatically.

const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
const localUrl = process.env.DATABASE_URL;

if (!supabaseUrl && !localUrl) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set.");
}

// Start with Supabase as primary; fall back to local if Supabase TCP fails
const primaryUrl = (supabaseUrl || localUrl)!;
const fallbackUrl = supabaseUrl ? localUrl : undefined;

const isSupabaseConn = (url: string) => url.includes("supabase.co");

function createPool(url: string): pg.Pool {
  return new Pool({
    connectionString: url,
    ssl: isSupabaseConn(url) ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: isSupabaseConn(url) ? 6000 : 5000,
    max: isSupabaseConn(url) ? 5 : 10,
    idleTimeoutMillis: 30000,
  });
}

// We need a synchronous export, so we create the pool eagerly.
// If Supabase TCP is unreachable (IPv6-only network), queries will fail.
// The API routes should handle DB errors gracefully.
let activePool = createPool(primaryUrl);

// Async connectivity probe — if primary fails and fallback exists, swap to fallback
(async () => {
  let client: pg.PoolClient | null = null;
  try {
    client = await activePool.connect();
    const { rows } = await client.query("SELECT current_database()");
    const label = isSupabaseConn(primaryUrl) ? "Supabase" : "local";
    console.info(`[db] Connected to ${label} PostgreSQL: ${rows[0].current_database}`);
  } catch (err: any) {
    if (fallbackUrl && (err.code === "ENOTFOUND" || err.code === "ENETUNREACH" || err.code === "ECONNREFUSED" || err.message.includes("timeout"))) {
      console.warn(`[db] Primary DB unreachable (${err.code ?? err.message}) — switching to local DATABASE_URL`);
      await activePool.end().catch(() => {});
      activePool = createPool(fallbackUrl);
      // Update the drizzle instance reference
      Object.assign(db, drizzle(activePool, { schema }));
      try {
        const c = await activePool.connect();
        const { rows } = await c.query("SELECT current_database()");
        c.release();
        console.info(`[db] Connected to local PostgreSQL (fallback): ${rows[0].current_database}`);
      } catch (e2: any) {
        console.error(`[db] Fallback DB also failed: ${e2.message}`);
      }
    } else {
      console.error(`[db] DB connection probe failed: ${err.message}`);
    }
  } finally {
    client?.release();
  }
})();

export const db = drizzle(activePool, { schema });

export { activePool as pool };
export * from "./schema";
