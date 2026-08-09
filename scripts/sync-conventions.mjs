import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";
import { chromium } from "playwright";

const calendarUrls = [
  "https://furrycons.com/calendar/calendar.php?loc=us",
  "https://furrycons.com/calendar/"
];
const outputPath = new URL("../conventions.js", import.meta.url);
const stateCodes = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]);

function readExistingShortNames(source) {
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: "conventions.js" });
  return new Map((context.window.rockyConventions || []).map((convention) => [convention.name, convention.short]));
}

function createShortName(name, year, existingNames) {
  if (existingNames.has(name)) return existingNames.get(name);

  const yearSuffix = String(year).slice(-2);
  const baseName = name.replace(/\s+20\d{2}\s*$/, "").trim();
  if (baseName.length <= 24) return `${baseName} ${yearSuffix}`;

  const ignoredWords = new Set(["a", "an", "and", "at", "for", "in", "of", "the", "to"]);
  const initials = baseName
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z0-9]/g, ""))
    .filter((word) => word && !ignoredWords.has(word.toLowerCase()))
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 8);

  return `${initials || baseName.slice(0, 20)} ${yearSuffix}`;
}

function isInFiftyStates(location) {
  const state = location.match(/,\s*([A-Z]{2})$/)?.[1];
  return stateCodes.has(state) && !/\bdeparting\b/i.test(location);
}

async function loadCalendar(page) {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const url = calendarUrls[attempt % calendarUrls.length];

    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      if (!response?.ok()) {
        throw new Error(`FurryCons returned HTTP ${response?.status() ?? "unknown"}.`);
      }

      await page.waitForSelector('article table tbody tr a[href^="/event/"]', { timeout: 30_000 });
      return true;
    } catch (error) {
      lastError = error;
      console.warn(`FurryCons calendar attempt ${attempt + 1} failed: ${error.message}`);

      if (attempt < 2) {
        await page.waitForTimeout(3_000 * (attempt + 1));
      }
    }
  }

  console.warn(
    `Calendar review was safely skipped after three attempts: ${lastError?.message || "unknown error"}. ` +
    "Existing convention data was preserved."
  );
  return false;
}

const existingSource = await readFile(outputPath, "utf8");
const existingShortNames = readExistingShortNames(existingSource);
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36"
  });
  const page = await context.newPage();
  const calendarLoaded = await loadCalendar(page);

  if (calendarLoaded) {
    const sourceRows = await page.locator("article table tbody tr").evaluateAll((rows) =>
      rows.map((row) => {
        const cells = [...row.querySelectorAll(":scope > td")];
        const link = cells[0]?.querySelector('a[href^="/event/"]');
        if (!link || cells.length < 3) return null;

        const locationLines = cells[2].innerText.split(/\n+/).map((line) => line.trim()).filter(Boolean);
        return {
          name: link.textContent.trim(),
          dates: cells[1].innerText.trim(),
          location: locationLines.at(-1) || "",
          url: new URL(link.getAttribute("href"), window.location.origin).href,
          status: cells[0].querySelector("strike, .label-danger") || /cancel/i.test(cells[0].innerText)
            ? "canceled"
            : "active"
        };
      }).filter(Boolean)
    );

    const currentYear = new Date().getUTCFullYear();
    const conventions = sourceRows
      .map((convention) => ({
        ...convention,
        year: Number([...convention.name.matchAll(/\b(20\d{2})\b/g)].at(-1)?.[1])
      }))
      .filter((convention) => convention.year >= currentYear && convention.year <= 2027)
      .filter((convention) => isInFiftyStates(convention.location))
      .filter((convention) => !/\bcruise\b/i.test(convention.name))
      .map((convention) => ({
        name: convention.name,
        short: createShortName(convention.name, convention.year, existingShortNames),
        dates: convention.dates,
        location: convention.location,
        year: convention.year,
        url: convention.url,
        status: convention.status
      }));

    const duplicateUrls = conventions.filter((convention, index) =>
      conventions.findIndex((candidate) => candidate.url === convention.url) !== index
    );
    if (conventions.length < 20) throw new Error(`Only ${conventions.length} valid conventions were found; existing data was preserved.`);
    if (duplicateUrls.length) throw new Error("Duplicate convention URLs were found; existing data was preserved.");
    if (conventions.some((convention) => !isInFiftyStates(convention.location))) {
      throw new Error("A convention outside the 50 U.S. states passed validation; existing data was preserved.");
    }

    const output = `window.rockyConventions = ${JSON.stringify(conventions, null, 2)};\n`;
    await writeFile(outputPath, output, "utf8");
    console.log(`Prepared ${conventions.length} U.S. convention records for review.`);
  }
} finally {
  await browser.close();
}
