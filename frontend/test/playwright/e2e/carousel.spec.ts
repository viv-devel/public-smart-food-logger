import { test, expect } from "@playwright/test";

test.describe("HowItWorks Carousel", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage where the carousel is located
    await page.goto("/");
  });

  test("should display the carousel and allow navigation", async ({ page }) => {
    // Check if homepage loads at all
    // Use first() because there might be multiple headings (e.g. mobile nav and main content)
    await expect(
      page.getByRole("heading", { name: "Smart Food Logger AI" }).first(),
    ).toBeVisible();

    // Check for the section title
    await expect(
      page.getByRole("heading", { name: "How It Works" }),
    ).toBeVisible();

    // Check initial state (Step 1)
    const step1Heading = page.getByRole("heading", {
      name: "AIに食事を伝える",
    });
    await expect(step1Heading).toBeVisible({ timeout: 10000 });
    // Text is split by <strong> tags, so we check for parts
    await expect(
      page.getByText(
        "写真を渡すだけでなく、「今日のお昼はペペロンチーノとサラダ」のように",
      ),
    ).toBeVisible();
    await expect(page.getByText("文章で伝えても")).toBeVisible();

    // Find pagination buttons
    const buttons = page.locator('button[aria-label^="Go to step"]');
    await expect(buttons).toHaveCount(3);

    // Click on Step 2 button
    await buttons.nth(1).click();

    // Check Step 2 content
    await expect(page.getByText("JSONを貼り付けて記録")).toBeVisible();
    await expect(
      page.getByText(
        "カスタムGeminiが生成した栄養情報（JSON）をフォームに貼り付け、",
      ),
    ).toBeVisible();
    await expect(page.getByText("ボタンを押すだけ")).toBeVisible();

    // Click on Step 3 button
    await buttons.nth(2).click();

    // Check Step 3 content
    await expect(page.getByText("Fitbitで栄養をチェック")).toBeVisible();
    await expect(
      page.getByText("記録された食事はFitbitアプリで"),
    ).toBeVisible();
    await expect(page.getByText("消費カロリーと比較")).toBeVisible();
  });

  // Note: Testing swipe gestures in Playwright is possible but can be flaky depending on the implementation details (pointer events vs touch events).
  // For this basic e2e, verifying button navigation confirms the state updates correctly.
});
