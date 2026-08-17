import express, { type Express, type RequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({
  limit: "1mb",
  verify(req, _res, buffer) {
    if (req.url?.startsWith("/api/payments/webhook")) (req as any).rawBody = Buffer.from(buffer);
  },
}));
app.use(express.urlencoded({ extended: true }));

// Keep a conventional root health endpoint available for hosts and uptime checks.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "packworkz-api" });
});

// Readiness is intentionally stricter than liveness. A running process should
// not be treated as launch-ready when orders, accounts, or payment callbacks
// cannot be persisted.
const readinessHandler: RequestHandler = async (_req, res) => {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "JWT_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "RESEND_API_KEY",
  ] as const;
  const missing = required.filter((name) => !process.env[name]);
  let databaseReachable = false;

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const response = await fetch(`${process.env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/`, {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        signal: AbortSignal.timeout(5_000),
      });
      databaseReachable = response.ok;
    } catch {
      databaseReachable = false;
    }
  }

  const ready = missing.length === 0 && databaseReachable;
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    service: "packworkz-api",
    checks: {
      configuration: missing.length === 0,
      database: databaseReachable,
      paymentGateway: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      paymentWebhook: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
      accountSessions: Boolean(process.env.JWT_SECRET),
      customerNotifications: Boolean(process.env.RESEND_API_KEY),
      operationsNotifications: Boolean(process.env.RESEND_API_KEY || process.env.SLACK_WEBHOOK_URL || (process.env.SLACK_CHANNEL_ID && process.env.SLACK_BOT_TOKEN) || process.env.WHATSAPP_WEBHOOK_URL),
    },
    missing,
  });
};

app.get("/ready", readinessHandler);
app.get("/api/ready", readinessHandler);

app.use("/api", router);

// Catch unmatched /api/* routes and return JSON 404 instead of falling through to SPA
app.use("/api/*path", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// On Vercel, the CDN serves static files — only serve them when running
// directly (Replit dev/prod, Railway, etc.)
if (!process.env.VERCEL) {
  const frontendDist = path.resolve(__dirname, "../../packwerk/dist/public");
  app.use(express.static(frontendDist));

  // SPA fallback — send index.html for any non-API route
  app.get("/*path", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

export default app;
