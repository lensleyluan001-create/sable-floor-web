import { chromium } from "playwright";
const url = process.argv[2] || "https://sable-floor.vercel.app/want";
const out = process.argv[3] || "/tmp/liveqa/want.png";
const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
const consoleErr = [];
const failed = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") consoleErr.push(m.text()); });
page.on("requestfailed", (r) => failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText}`));
const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(6000);
const info = await page.evaluate(() => {
  const tiles = document.querySelectorAll(".tile, [data-sku]");
  const imgs = [...document.querySelectorAll("img")];
  const loadedImgs = imgs.filter(i => i.complete && i.naturalWidth > 0);
  return {
    title: document.title,
    h1: document.querySelector("h1")?.textContent || "",
    bodyStart: (document.body?.innerText || "").slice(0, 350),
    tileCount: tiles.length,
    imgCount: imgs.length,
    loadedImgs: loadedImgs.length,
    scripts: [...document.scripts].map(s => s.src || "(inline)").filter(Boolean).slice(0, 12),
    hasOpening: (document.body?.innerText || "").includes("Opening the collection") || (document.body?.innerText || "").includes("Opening SABLE CRM"),
    gridKids: document.querySelector("#grid")?.children?.length ?? -1,
    sMarks: document.querySelectorAll(".sable-mark, path").length,
  };
});
await page.screenshot({ path: out, fullPage: false });

// golf checks
let golf = {};
try {
  await page.click('[data-sku="45004"]', { timeout: 5000 });
  await page.waitForTimeout(1200);
  golf.g45004 = await page.evaluate(() => ({
    hides: [...document.querySelectorAll("#exrow button, .hide, [data-hide]")].map(b => b.textContent.trim()).slice(0, 12),
    twoTone: /two-tone|body|vamp/i.test(document.body.innerText),
    note: !!document.querySelector(".golf-note"),
  }));
  await page.click("#back, [data-back], .go-back, .back-inline", { timeout: 3000 }).catch(()=>{});
  await page.waitForTimeout(800);
  await page.click('[data-sku="45090"]', { timeout: 5000 });
  await page.waitForTimeout(1200);
  golf.g45090 = await page.evaluate(() => ({
    labels: [...document.querySelectorAll("button, .hide, [data-hide], [data-tone]")].map(b => b.textContent.trim()).filter(t => /tone|body|vamp|tan|olive|black|brown|photo/i.test(t)).slice(0, 16),
    twoTone: /two-tone|body|vamp/i.test(document.body.innerText),
  }));
} catch (e) {
  golf.error = String(e);
}
console.log(JSON.stringify({ status: resp?.status(), url: page.url(), info, golf, errors, consoleErr: consoleErr.slice(0, 20), failed: failed.slice(0, 20) }, null, 2));
await browser.close();
