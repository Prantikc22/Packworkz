import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";

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
  return crypto.createHash("sha256").update(userId + Date.now() + "packwerk_jwt_secret").digest("hex");
}

const activeSessions = new Map<string, string>();

export function createSession(token: string, userId: string): void {
  activeSessions.set(token, userId);
}

export function getSessionUserId(token: string): string | null {
  return activeSessions.get(token) ?? null;
}

export function deleteSession(token: string): void {
  activeSessions.delete(token);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = getSessionUserId(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }
  (req as Request & { userId: string }).userId = userId;
  next();
}
