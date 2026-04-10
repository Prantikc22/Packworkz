import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

export async function generateId(prefix: string, tableName: string, column: string): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-%`;
  
  const result = await db.execute(
    sql`SELECT MAX(${sql.identifier(column)}) as last_id FROM ${sql.identifier(tableName)} WHERE ${sql.identifier(column)} LIKE ${pattern}`
  );
  
  const rows = result.rows as { last_id: string | null }[];
  const lastId = rows[0]?.last_id;
  
  let sequence = 10001;
  if (lastId) {
    const parts = lastId.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }
  
  return `${prefix}-${year}-${sequence}`;
}
