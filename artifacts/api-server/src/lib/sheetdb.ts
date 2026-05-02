export async function pushToSheetDB(data: Record<string, string | number | undefined>) {
  const apiKey = process.env.SHEETDB_API_KEY || "bnbunpp7hb33q";
  if (!apiKey) return;
  try {
    await fetch(`https://sheetdb.io/api/v1/${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ data }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("[sheetdb] Failed to push:", (err as Error).message);
  }
}
