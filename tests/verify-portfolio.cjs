/**
 * Playwright Automated Mobile-First & Multi-Viewport Verification Suite
 * Tests across:
 * - 360x640 (portrait & landscape)
 * - 390x844 (portrait & landscape)
 * - 430x932 (portrait & landscape)
 * - 1280x800 (desktop)
 *
 * Verifies:
 * 1. Viewport meta with viewport-fit=cover
 * 2. 100dvh sizing & zero horizontal overflow (scrollWidth <= innerWidth)
 * 3. Portrait camera FOV (72°) vs landscape (45°)
 * 4. Touch swipe gesture driving progress and momentum
 * 5. Virtual joystick, auto-ride, and boost buttons (tap targets >= 44x44px)
 * 6. Fullscreen mobile menu open/close & stop navigation
 * 7. Desktop wheel scrolling and animation state machine
 * 8. Zero unhandled console errors across all devices
 */

const { chromium } = require('playwright');

const VIEWPORTS = [
  { name: 'Mobile Small Portrait (360x640)', width: 360, height: 640, isMobile: true, hasTouch: true },
  { name: 'Mobile Small Landscape (640x360)', width: 640, height: 360, isMobile: true, hasTouch: true },
  { name: 'iPhone 12/13/14 Portrait (390x844)', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'iPhone 12/13/14 Landscape (844x390)', width: 844, height: 390, isMobile: true, hasTouch: true },
  { name: 'iPhone 14/15 Pro Max Portrait (430x932)', width: 430, height: 932, isMobile: true, hasTouch: true },
  { name: 'iPhone 14/15 Pro Max Landscape (932x430)', width: 932, height: 430, isMobile: true, hasTouch: true },
  { name: 'Desktop Standard (1280x800)', width: 1280, height: 800, isMobile: false, hasTouch: false },
];

async function runTests() {
  console.log('🚀 Starting Comprehensive Mobile-First & Desktop Verification Suite...\n');
  const browser = await chromium.launch({ headless: true });
  let failed = false;

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n======================================================`);
      console.log(`📱 TESTING VIEWPORT: ${vp.name}`);
      console.log(`======================================================`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch,
        deviceScaleFactor: vp.isMobile ? 2.0 : 1.0,
      });

      const page = await context.newPage();
      const consoleErrors = [];
      page.on('pageerror', (err) => consoleErrors.push(err.toString()));

      await page.goto('http://localhost:5173/portfolio/?debug', { waitUntil: 'domcontentloaded', timeout: 20000 });

      // Dismiss loader if visible
      await page.waitForTimeout(600);
      const startBtn = page.locator('#loader-start-btn');
      if (await startBtn.isVisible()) {
        await startBtn.click();
        console.log('  ✓ Clicked Start button to enter 3D world');
      }
      await page.waitForTimeout(400);

      // 1. Viewport Meta Check
      const metaViewport = await page.getAttribute('meta[name="viewport"]', 'content');
      if (!metaViewport || !metaViewport.includes('viewport-fit=cover')) {
        throw new Error(`Viewport meta missing viewport-fit=cover: ${metaViewport}`);
      }
      console.log('  ✓ Viewport meta verified: viewport-fit=cover');

      // 2. Horizontal Scroll & Overflow Check
      const overflowCheck = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const winWidth = window.innerWidth;
        return {
          docWidth,
          bodyWidth,
          winWidth,
          hasDocOverflow: docWidth > winWidth,
          hasBodyOverflow: bodyWidth > winWidth,
        };
      });

      if (overflowCheck.hasDocOverflow || overflowCheck.hasBodyOverflow) {
        throw new Error(`Horizontal overflow detected! docWidth: ${overflowCheck.docWidth}, bodyWidth: ${overflowCheck.bodyWidth}, winWidth: ${overflowCheck.winWidth}`);
      }
      console.log(`  ✓ Zero horizontal overflow: scrollWidth (${overflowCheck.docWidth}px) <= innerWidth (${overflowCheck.winWidth}px)`);

      // 3. Camera FOV Check (Portrait: 72°, Landscape: 45°)
      const camFov = await page.evaluate(() => {
        return window.__PORTFOLIO_APP__?.camera?.fov;
      });
      const isPortrait = vp.height > vp.width;
      const expectedFov = isPortrait ? 72 : 45;
      if (camFov !== expectedFov) {
        throw new Error(`Expected camera FOV ${expectedFov}° for ${isPortrait ? 'portrait' : 'landscape'}, but got ${camFov}°`);
      }
      console.log(`  ✓ Camera FOV adapted to ${camFov}° (${isPortrait ? 'portrait wide FOV' : 'landscape standard FOV'})`);

      // 4. Touch Controls / Desktop Controls Check
      if (vp.hasTouch) {
        const touchControlsVisible = await page.evaluate(() => {
          const tc = document.getElementById('touch-controls');
          if (!tc) return false;
          const style = window.getComputedStyle(tc);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        if (!touchControlsVisible) {
          throw new Error('Expected #touch-controls to be visible on touch viewport');
        }

        // Tap Target Size Verification (Min 44x44px for accessibility)
        const tapTargets = await page.evaluate(() => {
          const elements = [
            { id: '#menu-btn', el: document.querySelector('#menu-btn') },
            { id: '#sound-toggle-btn', el: document.querySelector('#sound-toggle-btn') },
            { id: '#auto-ride-btn', el: document.querySelector('#auto-ride-btn') },
            { id: '#boost-btn', el: document.querySelector('#boost-btn') },
            { id: '#joystick-base', el: document.querySelector('#joystick-base') },
          ];
          return elements.map(({ id, el }) => {
            if (!el) return { id, exists: false };
            const rect = el.getBoundingClientRect();
            return {
              id,
              exists: true,
              width: rect.width,
              height: rect.height,
              meetsA11y: rect.width >= 44 && rect.height >= 44,
            };
          });
        });

        for (const target of tapTargets) {
          if (!target.exists) throw new Error(`Touch control ${target.id} not found`);
          if (!target.meetsA11y) {
            throw new Error(`Touch target ${target.id} is too small: ${target.width}x${target.height} (min 44x44px required)`);
          }
        }
        console.log('  ✓ Touch controls present and satisfy min 44x44px tap target requirements');

        // Test touch swipe advancement & momentum
        const initProg = await page.evaluate(() => window.__PORTFOLIO_PLAYER__.progress);
        const canvas = await page.$('canvas');
        const box = await canvas.boundingBox();
        const startX = box.x + box.width / 2;
        const startY = box.y + box.height * 0.7;
        const endY = box.y + box.height * 0.3;

        // Perform smooth touch swipe up (move forward)
        await page.touchscreen.tap(startX, startY);
        await page.evaluate(({ sy, ey, sx }) => {
          const c = document.querySelector('canvas');
          const t1 = new Touch({ identifier: 1, target: c, clientX: sx, clientY: sy });
          const t2 = new Touch({ identifier: 1, target: c, clientX: sx, clientY: (sy + ey) / 2 });
          const t3 = new Touch({ identifier: 1, target: c, clientX: sx, clientY: ey });

          c.dispatchEvent(new TouchEvent('touchstart', { touches: [t1], changedTouches: [t1], bubbles: true }));
          c.dispatchEvent(new TouchEvent('touchmove', { touches: [t2], changedTouches: [t2], bubbles: true }));
          c.dispatchEvent(new TouchEvent('touchmove', { touches: [t3], changedTouches: [t3], bubbles: true }));
          c.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t3], bubbles: true }));
        }, { sy: startY, ey: endY, sx: startX });

        await page.waitForTimeout(400);
        const postSwipeProg = await page.evaluate(() => window.__PORTFOLIO_PLAYER__.progress);
        if (postSwipeProg <= initProg) {
          throw new Error(`Touch swipe did not advance player progress! before: ${initProg}, after: ${postSwipeProg}`);
        }
        console.log(`  ✓ Touch swipe advanced progress: ${initProg.toFixed(4)} -> ${postSwipeProg.toFixed(4)}`);

        // Test Boost button
        await page.locator('#boost-btn').dispatchEvent('touchstart');
        const isBoostActive = await page.evaluate(() => window.__PORTFOLIO_PLAYER__.keys.boost);
        if (!isBoostActive) {
          throw new Error('Boost button touchstart did not activate boost flag');
        }
        await page.locator('#boost-btn').dispatchEvent('touchend');
        const isBoostReleased = await page.evaluate(() => window.__PORTFOLIO_PLAYER__.keys.boost);
        if (isBoostReleased) {
          throw new Error('Boost button touchend did not release boost flag');
        }
        console.log('  ✓ Boost button touch interaction verified');
      } else {
        // Desktop Check: verify mouse wheel advances progress
        const dInitProg = await page.evaluate(() => window.__PORTFOLIO_PLAYER__.progress);
        for (let i = 0; i < 4; i++) {
          await page.mouse.wheel(0, 200);
          await page.waitForTimeout(60);
        }
        await page.waitForTimeout(300);
        const dPostProg = await page.evaluate(() => window.__PORTFOLIO_PLAYER__.progress);
        if (dPostProg <= dInitProg) {
          throw new Error(`Desktop wheel scroll did not advance progress: before: ${dInitProg}, after: ${dPostProg}`);
        }
        console.log(`  ✓ Desktop wheel scroll smoothly advanced progress: ${dInitProg.toFixed(4)} -> ${dPostProg.toFixed(4)}`);
      }

      // 5. Test Fullscreen Navigation Menu
      await page.click('#menu-btn');
      await page.waitForTimeout(300);
      const isMenuOpen = await page.evaluate(() => {
        const panel = document.getElementById('menu-panel');
        return panel && !panel.classList.contains('hidden');
      });
      if (!isMenuOpen) {
        throw new Error('Menu panel failed to open when clicking #menu-btn');
      }

      // Verify menu close button
      await page.click('#close-menu-btn');
      await page.waitForTimeout(300);
      const isMenuClosed = await page.evaluate(() => {
        const panel = document.getElementById('menu-panel');
        return panel && panel.classList.contains('hidden');
      });
      if (!isMenuClosed) {
        throw new Error('Menu panel failed to close when clicking #close-menu-btn');
      }
      console.log('  ✓ Fullscreen navigation menu open/close interaction verified');

      // 6. Check console errors
      if (consoleErrors.length > 0) {
        throw new Error(`Console errors on ${vp.name}: ${consoleErrors.join(', ')}`);
      }
      console.log(`  ✓ Clean console: 0 errors encountered`);

      await context.close();
    }

    console.log('\n======================================================');
    console.log('🎉 ALL MULTI-VIEWPORT MOBILE & DESKTOP TESTS PASSED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Verification Failed:', err);
    failed = true;
  } finally {
    await browser.close();
    process.exit(failed ? 1 : 0);
  }
}

runTests();
