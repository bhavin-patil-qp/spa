import { test, expect } from '@playwright/test';


test('Sampling check: verify feedback visibility based on text', async ({ page, context }) => {
    test.setTimeout(300_000); // Increased timeout

    const samplingPercentage = 50;
  const iterations = 40;
  let shownCount = 0;
  let hiddenCount = 0;

  for (let i = 0; i < iterations; i++) {
    await context.clearCookies();
    await page.goto('http://localhost:3001');

    try {
      await expect(page.getByText('Feedback')).toBeVisible();
      shownCount++;
    } catch {
      hiddenCount++;
    }
  }

  console.log(`✅ Sampling Report (target: ${samplingPercentage}%)`);
  console.log(`Shown: ${shownCount}`);
  console.log(`Hidden: ${hiddenCount}`);
  console.log(`Actual Sampling: ${(shownCount / iterations * 100).toFixed(2)}%`);

  // Optionally assert the range is within acceptable tolerance
  expect(shownCount).toBeGreaterThanOrEqual(iterations * (samplingPercentage - 10) / 100);
  expect(shownCount).toBeLessThanOrEqual(iterations * (samplingPercentage + 10) / 100);
});
