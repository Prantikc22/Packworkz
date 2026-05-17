import { Router, type IRouter } from "express";
import { sb } from "../lib/supabase";
import { hashPassword, generateToken, createSession, deleteSession, requireAuth, getSessionUserId } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const { data: user, error } = await sb
    .from("users_profile")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("[auth/login] DB error:", error.message);
    res.status(500).json({ error: "Server error" });
    return;
  }

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
  await createSession(token, user.id);

  const { password_hash: _, ...userWithoutPassword } = user;

  // Check must_change_password flag stored in default_address JSONB
  const mustChangePw = !!(user.default_address as any)?.must_change_password;

  res.json({
    access_token: token,
    must_change_password: mustChangePw,
    user: {
      ...userWithoutPassword,
      credit_limit: Number(userWithoutPassword.credit_limit ?? 0),
    },
  });
});

router.post("/auth/change-password", requireAuth as never, async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7) ?? "";
  const userId = await getSessionUserId(token);

  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { current_password, new_password } = req.body;
  if (!new_password || new_password.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters" });
    return;
  }

  const { data: user } = await sb
    .from("users_profile")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Check must_change_password stored in default_address JSONB
  const mustChangePw = !!(user.default_address as any)?.must_change_password;

  if (!mustChangePw) {
    // Normal password change — current password is required
    if (!current_password) {
      res.status(400).json({ error: "current_password is required" });
      return;
    }
    if (user.password_hash !== hashPassword(current_password)) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
  }

  // Remove must_change_password flag from default_address
  const existingAddress = (user.default_address as Record<string, any>) ?? {};
  const { must_change_password: _removed, ...cleanAddress } = existingAddress;

  await sb
    .from("users_profile")
    .update({
      password_hash: hashPassword(new_password),
      default_address: Object.keys(cleanAddress).length > 0 ? cleanAddress : null,
    })
    .eq("id", userId);

  res.json({ success: true });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await deleteSession(token);
  }
  res.json({ success: true });
});

export default router;
