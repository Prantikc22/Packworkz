import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, generateToken, createSession, deleteSession } from "../lib/auth";

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
    user: {
      ...userWithoutPassword,
      credit_limit: Number(userWithoutPassword.credit_limit ?? 0),
    },
  });
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
