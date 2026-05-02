// Vercel Serverless Function — wraps the Express app
// All /api/* requests are routed here by vercel.json rewrites
import app from "../artifacts/api-server/dist/app.mjs";
export default app;
