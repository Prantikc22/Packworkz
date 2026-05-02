// Vercel Serverless Function entry point
// .mjs = ESM unconditionally. Vercel serves this natively without bundling/transforming it.
import app from "../artifacts/api-server/dist/app.mjs";
export default app;
