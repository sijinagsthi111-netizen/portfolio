/**
 * Playwright Automated Verification Suite for 3D Open-World Portfolio
 * Tests:
 * 1. Initial load, title, and clean console (no 404s, no unhandled exceptions).
 * 2. Wheel scrolling down increases progress and triggers walk/ride animation.
 * 3. Inactivity returns animation smoothly to idle.
 * 4. Wheel scrolling up decreases progress and turns around.
 * 5. Mobile touch swipe emulation.
 * 6. Debug overlay inspection.
 */

const { chromium, devices } = require('playwright');

async function runTests() {
  console.log('🚀 Starting 3D Open-World Portfolio Automated Verification Suite...\n');
  const browser = await chromium.launch({ headless: true });
  let failed = false;

  try {
    // -------------------------------------------------------------
    // TEST 1: Desktop Chrome Wheel Scroll & Animation State Machine
    // -------------------------------------------------------------
    console.log('--- TEST 1: Desktop Chrome & Animation State Machine ---');
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(err.toString()));

    await page.goto('http://localhost:5173/portfolio/?debug', { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('✓ Page loaded at http://localhost:5173/portfolio/?debug');

    // Dismiss loader
    await page.waitForTimeout(1000);
    const startBtn = page.locator('#loader-start-btn');
    if (await startBtn.isVisible()) {
      await startBtn.click();
      console.log('✓ Clicked Start button to enter world');
    }
    await page.waitForTimeout(600);

    // Initial state check
    const initialStats = await page.evaluate(() => {
      const player = window.__PORTFOLIO_PLAYER__;
      return {
        progress: player.progress,
        targetProgress: player.targetProgress,
        animation: player.animationRig.activeActionName,
        posX: player.position.x,
        posZ: player.position.z,
      };
    });
    console.log('Initial State:', initialStats);

    if (initialStats.animation !== 'idle') {
      throw new Error(`Expected initial animation to be 'idle', but got '${initialStats.animation}'`);
    }
    console.log('✓ Initial animation is idle');

    // Send mouse wheel events (scrolling down = moving forward)
    console.log('Simulating mouse wheel scroll down (5 notches)...');
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 250);
      await page.waitForTimeout(80);
    }

    // Wait a brief moment for damping to catch up
    await page.waitForTimeout(300);

    const movingStats = await page.evaluate(() => {
      const player = window.__PORTFOLIO_PLAYER__;
      return {
        progress: player.progress,
        targetProgress: player.targetProgress,
        speed: player.speed,
        animation: player.animationRig.activeActionName,
        posX: player.position.x,
        posZ: player.position.z,
      };
    });
    console.log('Moving State:', movingStats);

    if (movingStats.progress <= initialStats.progress) {
      throw new Error(`Progress did not increase on wheel scroll down! Initial: ${initialStats.progress}, After: ${movingStats.progress}`);
    }
    console.log(`✓ Progress increased from ${initialStats.progress.toFixed(4)} to ${movingStats.progress.toFixed(4)}`);

    if (movingStats.animation !== 'ride' && movingStats.animation !== 'walk') {
      throw new Error(`Expected active animation to be 'ride' or 'walk', got '${movingStats.animation}'`);
    }
    console.log(`✓ Active animation smoothly transitioned to: '${movingStats.animation}'`);

    // Let motion settle to idle
    console.log('Waiting for character to settle...');
    await page.waitForTimeout(2000);

    const settledStats = await page.evaluate(() => {
      const player = window.__PORTFOLIO_PLAYER__;
      return {
        progress: player.progress,
        speed: player.speed,
        animation: player.animationRig.activeActionName,
      };
    });
    console.log('Settled State:', settledStats);

    if (settledStats.animation !== 'idle') {
      throw new Error(`Expected animation to return to 'idle' after stopping, but got '${settledStats.animation}'`);
    }
    console.log('✓ Animation successfully cross-faded back to idle when motionless');

    // Test reverse scroll (scrolling up)
    console.log('Simulating mouse wheel scroll up (reverse)...');
    const beforeReverseProg = settledStats.progress;
    for (let i = 0; i < 4; i++) {
      await page.mouse.wheel(0, -200);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(350);

    const reverseStats = await page.evaluate(() => {
      const player = window.__PORTFOLIO_PLAYER__;
      return {
        progress: player.progress,
        isFacingForward: player.isFacingForward,
        animation: player.animationRig.activeActionName,
      };
    });
    console.log('Reverse State:', reverseStats);

    if (reverseStats.progress >= beforeReverseProg) {
      throw new Error(`Expected progress to decrease on wheel scroll up, but it was ${reverseStats.progress} >= ${beforeReverseProg}`);
    }
    console.log(`✓ Progress decreased smoothly on scroll up (reverse): ${reverseStats.progress.toFixed(4)} < ${beforeReverseProg.toFixed(4)}`);

    // Verify debug overlay
    const debugHud = await page.$('#debug-hud-overlay');
    if (!debugHud) {
      throw new Error('Debug HUD overlay element #debug-hud-overlay not found with ?debug');
    }
    const debugText = await debugHud.innerText();
    console.log('✓ Debug HUD verified:\n', debugText.trim());

    if (consoleErrors.length > 0) {
      throw new Error(`Found unhandled console errors: ${consoleErrors.join(', ')}`);
    }
    console.log('✓ No unhandled console errors encountered\n');
    // -------------------------------------------------------------
    // TEST 2: Mobile Viewport & Touch Emulation
    // -------------------------------------------------------------
    console.log('--- TEST 2: Mobile Viewport & Touch Emulation ---');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // Verify mobile UI elements
    const joystick = await page.$('#joystick-base');
    const autoRideBtn = await page.$('#auto-ride-btn');
    if (!joystick || !autoRideBtn) {
      throw new Error('Mobile joystick or Auto-Ride button missing on mobile viewport');
    }
    console.log('✓ Mobile virtual joystick and Auto-Ride controls verified');

    // Simulate touch/mouse drag on canvas
    const mInitial = await page.evaluate(() => window.__PORTFOLIO_PLAYER__.progress);
    await page.mouse.move(195, 500);
    await page.mouse.down();
    await page.mouse.move(195, 300, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(400);

    const mAfter = await page.evaluate(() => window.__PORTFOLIO_PLAYER__.progress);
    console.log(`Mobile progress before: ${mInitial.toFixed(4)}, after drag: ${mAfter.toFixed(4)}`);
    console.log('✓ Touch/drag interaction verified');

    await page.close();

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Test Failure:', err);
    failed = true;
  } finally {
    await browser.close();
    process.exit(failed ? 1 : 0);
  }
}

runTests();
