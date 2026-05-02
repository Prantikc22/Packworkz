import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

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

function getJwtSecret(): string {
  return process.env.JWT_SECRET || "packwerk_jwt_secret_2024_secure";
}

export function generateToken(userId: string): string {
  const payload = { userId, exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getJwtSecret()).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export async function createSession(_token: string, _userId: string): Promise<void> {
  // Stateless JWT — no DB storage needed
}

export async function getSessionUserId(token: string): Promise<string | null> {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const payloadB64 = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expectedSig = crypto.createHmac("sha256", getJwtSecret()).update(payloadB64).digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (!payload.userId || payload.exp < Date.now()) return null;
    return payload.userId;
  } catch {
    return null;
  }
}

export async function deleteSession(_token: string): Promise<void> {
  // Stateless JWT — nothing to delete
}

export async function purgeExpiredSessions(): Promise<void> {
  // Stateless JWT — no-op
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
