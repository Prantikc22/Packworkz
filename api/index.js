// Vercel Serverless Function entry point (CommonJS)
// Vercel's runtime treats .js as CJS — dynamic import() is used to load the ESM Express app.
// The app is cached after first load so Supabase / middleware only initialise once per warm instance.

let _app = null;

async function getApp() {
  if (!_app) {
    const mod = await import("../artifacts/api-server/dist/app.mjs");
    _app = mod.default;
  }
  return _app;
}

module.exports = async (req, res) => {
  const app = await getApp();
  app(req, res);
};
