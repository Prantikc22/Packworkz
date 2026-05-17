import { sb } from "./supabase";

export async function generateId(prefix: string, tableName: string, column: string): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-`;

  const { data } = await sb
    .from(tableName)
    .select(column)
    .like(column, `${pattern}%`)
    .order(column, { ascending: false })
    .limit(1)
    .single();

  let sequence = 10001;
  if (data) {
    const lastId = (data as Record<string, string>)[column];
    if (lastId) {
      const parts = lastId.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
  }

  return `${prefix}-${year}-${sequence}`;
}
