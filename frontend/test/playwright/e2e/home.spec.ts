import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the home page correctly", async ({ page }) => {
    // ホームページにアクセス
    await page.goto("/");

    // ページのタイトルに "Smart Food Logger AI" が含まれていることを確認
    await expect(page).toHaveTitle(/Smart Food Logger AI/);

    // h1見出し "Smart Food Logger AI" が表示されていることを確認
    await expect(
      page
        .locator("main")
        .getByRole("heading", { level: 1, name: "Smart Food Logger AI" }),
    ).toBeVisible();
  });
});
