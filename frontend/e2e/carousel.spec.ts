import { test, expect } from '@playwright/test';

test.describe('HowItWorks Carousel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage where the carousel is located
    await page.goto('/');
  });

  test('should display the carousel and allow navigation', async ({ page }) => {
    // Check for the section title
    await expect(page.getByRole('heading', { name: 'How It Works' })).toBeVisible();

    // Check initial state (Step 1)
    await expect(page.getByText('食事の写真を送る')).toBeVisible();
    await expect(page.getByText('専用のカスタムGeminiに食事の写真を送ると、AIが自動で栄養情報を分析します。')).toBeVisible();

    // Find pagination buttons
    const buttons = page.locator('button[aria-label^="Go to step"]');
    await expect(buttons).toHaveCount(3);

    // Click on Step 2 button
    await buttons.nth(1).click();

    // Check Step 2 content
    await expect(page.getByText('JSONをコピー')).toBeVisible();
    await expect(page.getByText('Geminiが出力した栄養情報（JSON形式）をクリップボードにコピーします。')).toBeVisible();

    // Click on Step 3 button
    await buttons.nth(2).click();

    // Check Step 3 content
    await expect(page.getByText('貼り付けて記録')).toBeVisible();
    await expect(page.getByText('このサイトの記録ページにJSONを貼り付け、ボタンを押すだけでFitbitに記録が完了します。')).toBeVisible();
  });

  // Note: Testing swipe gestures in Playwright is possible but can be flaky depending on the implementation details (pointer events vs touch events).
  // For this basic e2e, verifying button navigation confirms the state updates correctly.
});
