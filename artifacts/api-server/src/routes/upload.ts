import { Router, type IRouter } from "express";
import multer from "multer";
import { randomBytes } from "node:crypto";
import { sb } from "../lib/supabase";
import { presignR2, r2Enabled } from "../lib/r2";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const BUCKET = "artwork";
const ALLOWED_ARTWORK_EXTENSIONS = new Set(["pdf", "ai", "svg", "eps", "png", "jpg", "jpeg", "zip", "cdr", "psd", "tif", "tiff"]);
const MAX_DIRECT_UPLOAD_BYTES = 10 * 1024 * 1024;

async function ensureArtworkBucket() {
  const { data: buckets } = await sb.storage.listBuckets();
  if (!buckets?.some(b => b.name === BUCKET)) {
    await sb.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_DIRECT_UPLOAD_BYTES });
  }
}

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

  await ensureArtworkBucket();

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

// Issues a one-time signed upload URL so the browser sends the file straight to
// storage. This avoids the serverless request-body limit (~4.5 MB) and the
// short server-side storage timeout, which made large print files fail.
router.post("/upload/artwork-url", async (req, res): Promise<void> => {
  const originalName = String(req.body?.filename || "");
  const size = Number(req.body?.size || 0);
  const ext = originalName.split(".").pop()?.toLowerCase() || "";
  if (!originalName || !ALLOWED_ARTWORK_EXTENSIONS.has(ext)) {
    res.status(400).json({ error: "Upload a PDF, AI, EPS, SVG, CDR, PSD, TIFF, PNG, JPG or ZIP file." });
    return;
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_DIRECT_UPLOAD_BYTES) {
    res.status(400).json({ error: "Artwork files must be 10 MB or smaller. For larger files, share a download link in your order note." });
    return;
  }

  const company = sanitize(String(req.body?.company || "unknown"));
  const base = sanitize(originalName.replace(/\.[^.]+$/, ""));
  const path = `${company}_${base}_${Date.now()}.${ext}`;

  if (r2Enabled) {
    // Private R2 object with an unguessable key; read back through a short-lived redirect.
    const key = `artwork/${new Date().toISOString().slice(0, 7)}/${randomBytes(12).toString("hex")}_${base}.${ext}`;
    const origin = `${req.headers["x-forwarded-proto"] || req.protocol}://${req.headers["x-forwarded-host"] || req.headers.host}`;
    res.json({
      provider: "r2",
      uploadUrl: presignR2("PUT", key, 900, size),
      url: `${origin}/api/upload/artwork-file/${key.split("/").map(encodeURIComponent).join("/")}`,
    });
    return;
  }

  try {
    await ensureArtworkBucket();
    const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new Error(error?.message || "No signed URL returned");
    const { data: publicData } = sb.storage.from(BUCKET).getPublicUrl(path);
    res.json({ provider: "supabase", signedUrl: data.signedUrl, path, url: publicData.publicUrl });
  } catch (cause) {
    console.error("[upload/artwork-url] signing error:", cause instanceof Error ? cause.message : cause);
    res.status(502).json({ error: "Artwork storage is unavailable right now. Please try again." });
  }
});

// Artwork stored in R2 stays private. Links in orders point here and redirect
// to a presigned download that expires after 15 minutes.
router.get(/^\/upload\/artwork-file\/(artwork\/[0-9]{4}-[0-9]{2}\/[a-f0-9]{24}_[A-Za-z0-9_-]+\.[a-z0-9]+)$/, (req, res): void => {
  if (!r2Enabled) {
    res.status(404).json({ error: "Artwork storage is not configured." });
    return;
  }
  const key = decodeURIComponent(String((req.params as Record<string, string>)[0] || ""));
  res.redirect(302, presignR2("GET", key, 900));
});

export default router;
