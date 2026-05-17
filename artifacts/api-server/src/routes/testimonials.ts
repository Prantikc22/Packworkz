import { Router, type IRouter } from "express";
import { sb } from "../lib/supabase";

const router: IRouter = Router();

router.get("/testimonials", async (_req, res): Promise<void> => {
  const { data: testimonials, error } = await sb
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[testimonials] error:", error.message);
    res.status(500).json({ error: "Failed to load testimonials" });
    return;
  }

  res.json(testimonials || []);
});

export default router;
