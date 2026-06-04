import { Router, type IRouter } from "express";
import multer from "multer";
import { sb } from "../lib/supabase";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const BUCKET = "artwork";

function sanitize(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").substring(0, 40);
}

router.post("/upload/artwork", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const ext = req.file.originalname.split(".").pop()?.toLowerCase() || "bin";
  const company = sanitize((req.body.company as string) || "unknown");
  const originalBase = sanitize(
    ((req.body.originalName as string) || req.file.originalname).replace(/\.[^.]+$/, "")
  );
  const filename = `${company}_${originalBase}_${Date.now()}.${ext}`;

  // Ensure bucket exists (idempotent)
  const { data: buckets } = await sb.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET);
  if (!exists) {
    await sb.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 20971520 });
  }

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(filename, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error("[upload/artwork] storage error:", error.message);
    res.status(500).json({ error: "Upload failed", detail: error.message });
    return;
  }

  const { data: publicData } = sb.storage.from(BUCKET).getPublicUrl(filename);
  res.json({ url: publicData.publicUrl, filename });
});

export default router;
