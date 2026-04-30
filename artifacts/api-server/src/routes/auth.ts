import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, generateToken, createSession, deleteSession, requireAuth, getSessionUserId } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Wrong email or password. Need help? WhatsApp us." });
    return;
  }

  const passwordHash = hashPassword(password);
  if (user.password_hash !== passwordHash) {
    res.status(401).json({ error: "Wrong email or password. Need help? WhatsApp us." });
    return;
  }

  const token = generateToken(user.id);
  createSession(token, user.id);

  const { password_hash: _, ...userWithoutPassword } = user;

  res.json({
    access_token: token,
    must_change_password: !!user.must_change_password,
    user: {
      ...userWithoutPassword,
      credit_limit: Number(userWithoutPassword.credit_limit ?? 0),
    },
  });
});

router.post("/auth/change-password", requireAuth as never, async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7) ?? "";
  const userId = getSessionUserId(token);

  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { current_password, new_password } = req.body;
  if (!new_password || new_password.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // If not first-login, verify current password
  if (!user.must_change_password) {
    if (!current_password) {
      res.status(400).json({ error: "current_password is required" });
      return;
    }
    if (user.password_hash !== hashPassword(current_password)) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
  }

  await db
    .update(usersTable)
    .set({ password_hash: hashPassword(new_password), must_change_password: false })
    .where(eq(usersTable.id, userId));

  res.json({ success: true });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    deleteSession(token);
  }
  res.json({ success: true });
});

export default router;
