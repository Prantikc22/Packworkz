import express, { type Express } from "express";
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
