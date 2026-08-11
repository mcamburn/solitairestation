/**
 * Takes a 375×812 (iPhone SE) screenshot with the GameSwitcher open.
 * Run: node scripts/screenshot-switcher-mobile.js
 */
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  });

  const page = await context.newPage();

  // Load the app
  await page.goto("http://localhost:5000/klondike", { waitUntil: "networkidle" });

  // Find and click the GameSwitcher trigger button (aria-haspopup="listbox")
  const trigger = page.locator('[aria-haspopup="listbox"]');
  await trigger.waitFor({ state: "visible" });
  await trigger.click();

  // Wait for the dropdown grid to appear
  await page.locator('[role="option"]').first().waitFor({ state: "visible" });

  // Give it a moment to settle
  await page.waitForTimeout(400);

  // Screenshot the full page
  const outPath = path.resolve(__dirname, "../screenshots/switcher-375px.png");
  await page.screenshot({ path: outPath, fullPage: false });

  console.log("Screenshot saved to:", outPath);

  // Also check each tile's title element for overflow
  const titles = await page.locator('[role="option"] span.truncate').all();
  console.log(`\nFound ${titles.length} title/desc spans with truncate class`);

  // Verify each tile: scrollWidth <= clientWidth (no overflow)
  const overflows = await page.evaluate(() => {
    const tiles = document.querySelectorAll('[role="option"]');
    const results = [];
    tiles.forEach((tile) => {
      const titleEl = tile.querySelector("span.truncate");
      if (!titleEl) return;
      const overflows = titleEl.scrollWidth > titleEl.clientWidth + 1;
      results.push({
        text: titleEl.textContent?.trim(),
        scrollWidth: titleEl.scrollWidth,
        clientWidth: titleEl.clientWidth,
        overflows,
      });
    });
    return results;
  });

  console.log("\nTile title overflow check:");
  let anyOverflow = false;
  overflows.forEach((r) => {
    const status = r.overflows ? "⚠ OVERFLOW" : "✓ OK";
    console.log(`  ${status}  "${r.text}"  (scroll:${r.scrollWidth} client:${r.clientWidth})`);
    if (r.overflows) anyOverflow = true;
  });

  if (anyOverflow) {
    console.error("\n❌ Some titles overflow their containers.");
    process.exitCode = 1;
  } else {
    console.log("\n✅ All titles fit within their tile containers (truncate with ellipsis where needed).");
  }

  await browser.close();
})();
