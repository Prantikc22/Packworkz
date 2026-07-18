const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const base = process.env.QA_BASE_URL || "http://127.0.0.1:19798";
const output = path.resolve(process.cwd(), "qa-screenshots");
fs.mkdirSync(output, { recursive: true });

async function inspectPage(browser, route, name, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  await page.goto(`${base}${route}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(900);
  if (route !== "/mockup-studio") {
    await page.evaluate(async () => {
      const max = document.documentElement.scrollHeight;
      for (let y = 0; y < max; y += Math.max(420, window.innerHeight * 0.72)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 45));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
  }
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight,
    title: document.title,
  }));
  await page.screenshot({ path: path.join(output, `${name}-${viewport.width}.png`), fullPage: route !== "/mockup-studio" });
  await page.close();
  return { route, viewport, dimensions, horizontalOverflow: dimensions.width > dimensions.viewport + 2, errors };
}

async function inspectMockup(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/mockup-studio`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForSelector(".pw-mockup-canvas canvas", { timeout: 15000 });
  await page.waitForTimeout(1200);
  const before = await page.evaluate(() => document.querySelector(".pw-mockup-canvas canvas")?.toDataURL().slice(-600));
  await page.getByRole("button", { name: "Stand-up pouch" }).click();
  await page.getByLabel("Brand name").fill("Packworkz Lab");
  await page.getByLabel("Use color #C7432B").click();
  await page.waitForTimeout(700);
  const canvas = await page.evaluate(() => {
    const source = document.querySelector(".pw-mockup-canvas canvas");
    if (!source) return { found: false, coloredPixels: 0, uniqueBuckets: 0 };
    const target = document.createElement("canvas");
    target.width = 80;
    target.height = 80;
    const context = target.getContext("2d", { willReadFrequently: true });
    context.drawImage(source, 0, 0, 80, 80);
    const data = context.getImageData(0, 0, 80, 80).data;
    const colors = new Set();
    let coloredPixels = 0;
    for (let index = 0; index < data.length; index += 4) {
      const r = data[index]; const g = data[index + 1]; const b = data[index + 2];
      colors.add(`${Math.round(r / 16)}-${Math.round(g / 16)}-${Math.round(b / 16)}`);
      if (Math.max(r, g, b) - Math.min(r, g, b) > 18) coloredPixels += 1;
    }
    return { found: true, coloredPixels, uniqueBuckets: colors.size, width: source.width, height: source.height };
  });
  const after = await page.evaluate(() => document.querySelector(".pw-mockup-canvas canvas")?.toDataURL().slice(-600));
  await page.getByRole("button", { name: "Dieline" }).click();
  await page.waitForSelector(".pw-dieline-svg");
  const dieline = await page.evaluate(() => ({ found: Boolean(document.querySelector(".pw-dieline-svg")), cutLines: document.querySelectorAll(".dieline-cut").length, foldLines: document.querySelectorAll(".dieline-fold").length }));
  await page.screenshot({ path: path.join(output, "mockup-interacted-1440.png"), fullPage: false });
  await page.close();
  return { canvas, dieline, changedAfterInteraction: before !== after, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const pages = [];
  const routes = [
    ["/", "home"],
    ["/products", "products"],
    ["/products/printed-paper-carrier-bag", "product-detail"],
    ["/configure?sku=EC-510", "configure"],
    ["/mockup-studio", "mockup"],
  ];
  for (const [route, name] of routes) pages.push(await inspectPage(browser, route, name, { width: 1440, height: 1000 }));
  for (const [route, name] of [["/", "home"], ["/products", "products"], ["/mockup-studio", "mockup"]]) {
    pages.push(await inspectPage(browser, route, name, { width: 390, height: 844 }));
  }
  const mockup = await inspectMockup(browser);
  await browser.close();
  const report = { base, pages, mockup };
  fs.writeFileSync(path.join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (pages.some((page) => page.horizontalOverflow) || !mockup.canvas.found || mockup.canvas.coloredPixels < 150 || !mockup.changedAfterInteraction || mockup.errors.length) process.exitCode = 1;
})();
