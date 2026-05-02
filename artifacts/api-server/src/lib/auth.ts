import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import { db, sessionsTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "packwerk_salt_2024").digest("hex");
}

export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const adminKey = req.headers["x-admin-key"] as string;
  const expectedKey = process.env.ADMIN_KEY || "packwerk-admin-2024";
  
  if (!adminKey || adminKey !== expectedKey) {
    res.status(401).json({ error: "Unauthorized - invalid admin key" });
    return;
  }
  next();
}

export function generateToken(userId: string): string {
  return crypto.randomBytes(32).toString("hex");
}

// Session TTL: 30 days
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function createSession(token: string, userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessionsTable).values({ token, user_id: userId, expires_at: expiresAt })
    .onConflictDoUpdate({ target: sessionsTable.token, set: { expires_at: expiresAt } });
}

export async function getSessionUserId(token: string): Promise<string | null> {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.token, token))
    .limit(1);
  if (!session) return null;
  if (session.expires_at < new Date()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
    return null;
  }
  return session.user_id;
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
}

// Purge expired sessions (call occasionally)
export async function purgeExpiredSessions(): Promise<void> {
  await db.delete(sessionsTable).where(lt(sessionsTable.expires_at, new Date()));
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = await getSessionUserId(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }
  (req as Request & { userId: string }).userId = userId;
  next();
}
