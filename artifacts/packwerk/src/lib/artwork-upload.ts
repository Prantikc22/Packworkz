export const ARTWORK_ACCEPT = ".pdf,.ai,.svg,.eps,.cdr,.psd,.tif,.tiff,.png,.jpg,.jpeg,.zip";
export const ARTWORK_MAX_BYTES = 10 * 1024 * 1024;
export const ARTWORK_MAX_LABEL = "10 MB";
// Serverless functions reject request bodies above ~4.5 MB, so the legacy
// multipart route is only a fallback for small files.
const LEGACY_ROUTE_MAX_BYTES = 4 * 1024 * 1024;

export class ArtworkUploadError extends Error {}

async function readError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({})) as { error?: string };
  return payload.error || fallback;
}

/**
 * Uploads artwork and resolves with its stored URL. Never resolves with a
 * placeholder: callers must handle the thrown error and tell the customer.
 */
export async function uploadArtwork(file: File, company = ""): Promise<string> {
  if (file.size > ARTWORK_MAX_BYTES) {
    throw new ArtworkUploadError("This file is over 10 MB. Export a compressed PDF, or choose “Send later” and share a download link after ordering.");
  }

  let signingError = "";
  try {
    const signed = await fetch("/api/upload/artwork-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, size: file.size, company }),
    });
    if (signed.ok) {
      const target = await signed.json() as { provider?: "r2" | "supabase"; uploadUrl?: string; signedUrl?: string; url: string };
      let stored: Response;
      if (target.provider === "r2" && target.uploadUrl) {
        // Raw PUT: the presigned URL is bound to this exact file size.
        stored = await fetch(target.uploadUrl, { method: "PUT", body: file });
      } else {
        const body = new FormData();
        body.append("cacheControl", "3600");
        body.append("", file);
        stored = await fetch(target.signedUrl || "", { method: "PUT", body, headers: { "x-upsert": "false" } });
      }
      if (stored.ok) return target.url;
      signingError = "The file could not be stored.";
    } else {
      signingError = await readError(signed, "The upload could not start.");
      if (signed.status === 400) throw new ArtworkUploadError(signingError);
    }
  } catch (error) {
    if (error instanceof ArtworkUploadError) throw error;
    signingError = "Network error while uploading.";
  }

  if (file.size <= LEGACY_ROUTE_MAX_BYTES) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("company", company);
    formData.append("originalName", file.name);
    const response = await fetch("/api/upload/artwork", { method: "POST", body: formData }).catch(() => null);
    if (response?.ok) {
      const { url } = await response.json() as { url: string };
      if (url) return url;
    }
  }

  throw new ArtworkUploadError(`${signingError} Please retry, or continue and email your artwork after ordering.`);
}
