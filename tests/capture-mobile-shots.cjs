/**
 * Captures high-res mobile screenshots across viewports for visual artifact presentation.
 */

const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/sijin.agasthi/.gemini/antigravity/brain/756425bf-8122-4db6-a4c7-f86ee05401bd';

const SHOTS = [
  { name: 'mobile_360x640_portrait.png', width: 360, height: 640, isMobile: true, hasTouch: true },
  { name: 'mobile_390x844_portrait.png', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'mobile_430x932_portrait.png', width: 430, height: 932, isMobile: true, hasTouch: true },
  { name: 'mobile_844x390_landscape.png', width: 844, height: 390, isMobile: true, hasTouch: true },
  { name: 'mobile_menu_overlay.png', width: 390, height: 844, isMobile: true, hasTouch: true, openMenu: true },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });

  for (const shot of SHOTS) {
    const context = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      isMobile: shot.isMobile,
      hasTouch: shot.hasTouch,
      deviceScaleFactor: 2.0,
    });

    const page = await context.newPage();
    await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const startBtn = page.locator('#loader-start-btn');
    if (await startBtn.isVisible()) {
      await startBtn.click();
    }
    await page.waitForTimeout(600);

    if (shot.openMenu) {
      await page.click('#menu-btn');
      await page.waitForTimeout(300);
    }

    const outPath = path.join(ARTIFACTS_DIR, shot.name);
    await page.screenshot({ path: outPath });
    console.log(`Captured: ${shot.name}`);
    await context.close();
  }

  await browser.close();
  console.log('Done capturing screenshots!');
}

capture();
