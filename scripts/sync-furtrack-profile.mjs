import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const profileUrl = "https://www.furtrack.com/user/RockyTheDog/uploads";
const outputPath = new URL("../furtrack-media.js", import.meta.url);
const browser = await chromium.launch({ headless: true });

async function collectThumbnailIds(page) {
  let previousHeight = 0;
  for (let pass = 0; pass < 20; pass += 1) {
    const currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(800);
    if (currentHeight === previousHeight) break;
    previousHeight = currentHeight;
  }

  const sources = await page.locator('img[src*="/thumb/"]').evaluateAll((images) =>
    images.map((image) => image.currentSrc || image.src)
  );
  return sources.flatMap((source) => source.match(/\/thumb\/(\d+)\.jpg/i)?.[1] ?? []);
}

try {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36"
  });
  const page = await context.newPage();
  await page.goto(profileUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector('a[href^="/index/photographer:"]', { timeout: 30_000 });

  const profileTagPaths = await page.locator('a[href^="/index/photographer:"]').evaluateAll((links) =>
    [...new Set(links.map((link) => link.getAttribute("href")).filter(Boolean))]
  );
  if (profileTagPaths.length === 0) {
    throw new Error("The RockyTheDog profile exposed no photography media tags; existing gallery data was preserved.");
  }

  const ids = new Set(await collectThumbnailIds(page));
  for (const tagPath of profileTagPaths) {
    const tagUrl = new URL(tagPath, profileUrl);
    if (tagUrl.origin !== "https://www.furtrack.com" || !tagUrl.pathname.startsWith("/index/photographer:")) {
      throw new Error("The profile exposed an unexpected media tag URL; existing gallery data was preserved.");
    }

    await page.goto(tagUrl.href, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector('img[src*="/thumb/"]', { timeout: 30_000 });
    (await collectThumbnailIds(page)).forEach((id) => ids.add(id));
  }

  const sortedIds = [...ids].sort((left, right) => Number(right) - Number(left));
  if (sortedIds.length === 0) {
    throw new Error("No media connected to the RockyTheDog profile was found; existing gallery data was preserved.");
  }

  const records = sortedIds.map((id) => `  { id: "${id}", thumbnail: "https://orca2.furtrack.com/thumb/${id}.jpg" }`);
  const output = `window.rockyFurtrackMedia = [\n${records.join(",\n")}\n];\n`;
  await writeFile(outputPath, output, "utf8");
  console.log(`Prepared ${sortedIds.length} RockyTheDog profile-linked media items for review.`);
} finally {
  await browser.close();
}
