import crypto from "crypto";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export type RecoveryCheckoutPayload = {
  quote_id: string;
  quote: Record<string, unknown>;
  issued_at: number;
  expires_at: number;
};

function secret() {
  return process.env.JWT_SECRET || "";
}

function signature(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createRecoveryCheckoutToken(
  quoteId: string,
  quote: Record<string, unknown>,
): string | null {
  if (!secret()) return null;
  const issuedAt = Date.now();
  const payload: RecoveryCheckoutPayload = {
    quote_id: quoteId,
    quote,
    issued_at: issuedAt,
    expires_at: issuedAt + TOKEN_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

export function readRecoveryCheckoutToken(token: unknown): RecoveryCheckoutPayload | null {
  if (!secret() || typeof token !== "string" || token.length > 100_000) return null;
  const [encoded, suppliedSignature, extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra) return null;

  const expectedSignature = signature(encoded);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as RecoveryCheckoutPayload;
    if (!payload.quote_id || !payload.quote || payload.expires_at < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createRecoveryReference(prefix: "PKG" | "ORD") {
  const year = new Date().getUTCFullYear();
  const time = Date.now().toString(36).toUpperCase().slice(-7);
  const entropy = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${year}-${time}${entropy}`;
}
