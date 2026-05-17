export async function pushToSheetDB(data: Record<string, string | number | undefined>) {
  const apiKey = process.env.SHEETDB_API_KEY;
  if (!apiKey) return;
  try {
    const res = await fetch(`https://sheetdb.io/api/v1/${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ data: [data] }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[sheetdb] Non-OK response:", res.status, body);
    } else {
      console.info("[sheetdb] Row pushed OK");
    }
  } catch (err) {
    console.error("[sheetdb] Failed to push:", (err as Error).message);
  }
}
