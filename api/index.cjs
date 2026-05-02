// Vercel Serverless Function entry point
// .cjs extension = CommonJS unconditionally, regardless of any package.json "type" field
const appModule = require("../artifacts/api-server/dist/app.cjs");
const app = appModule.default || appModule;
module.exports = app;
