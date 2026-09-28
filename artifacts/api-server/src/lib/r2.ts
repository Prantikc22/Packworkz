import { createHash, createHmac } from "node:crypto";

// Minimal SigV4 query-string presigner for Cloudflare R2 (S3-compatible).
// Kept dependency-free so the serverless bundle stays small.

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET || "packworkz-artwork";

export const r2Enabled = Boolean(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY);

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const hmac = (key: Buffer | string, value: string) => createHmac("sha256", key).update(value).digest();
const encodeSegment = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

type PresignInput = {
  method: "GET" | "PUT";
  host: string;
  path: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  expiresSeconds: number;
  date: Date;
  contentLength?: number;
};

/** Pure SigV4 query presigning (exported for tests). */
export function buildPresignedUrl(input: PresignInput): string {
  const amzDate = input.date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${input.region}/s3/aws4_request`;
  const signLength = input.method === "PUT" && typeof input.contentLength === "number";
  const signedHeaders = signLength ? "content-length;host" : "host";
  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${input.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(input.expiresSeconds),
    "X-Amz-SignedHeaders": signedHeaders,
  };
  const canonicalQuery = Object.keys(query).sort()
    .map((name) => `${encodeSegment(name)}=${encodeSegment(query[name])}`)
    .join("&");
  const canonicalHeaders = `${signLength ? `content-length:${input.contentLength}\n` : ""}host:${input.host}\n`;
  const canonicalRequest = [input.method, input.path, canonicalQuery, canonicalHeaders, signedHeaders, "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${input.secretAccessKey}`, dateStamp), input.region), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  return `https://${input.host}${input.path}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

/**
 * Returns a presigned URL for a single R2 object.
 * For PUT, the exact byte length is signed, so the upload must match the size
 * the server approved — callers cannot exceed the declared limit.
 */
export function presignR2(method: "GET" | "PUT", key: string, expiresSeconds: number, contentLength?: number): string {
  if (!r2Enabled) throw new Error("R2 is not configured");
  return buildPresignedUrl({
    method,
    host: `${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    path: `/${BUCKET}/${key.split("/").map(encodeSegment).join("/")}`,
    region: "auto",
    accessKeyId: ACCESS_KEY_ID!,
    secretAccessKey: SECRET_ACCESS_KEY!,
    expiresSeconds,
    date: new Date(),
    contentLength,
  });
}
