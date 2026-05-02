// Vercel Serverless Function entry point (CommonJS)
// Loads the CJS build of the Express app — no ESM involved, no bundler conflicts.
const appModule = require("../artifacts/api-server/dist/app.cjs");
const app = appModule.default || appModule;
module.exports = app;
