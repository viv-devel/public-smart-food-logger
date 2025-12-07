import { test, expect } from "@playwright/test";

test.describe("Header Menu Navigation", () => {
  test("Navigates to top page with parameter when clicked", async ({
    page,
  }) => {
    // Go to instructions page first to ensure we are not on the landing page
    await page.goto("/instructions");

    // Open menu
    await page.getByTestId("header-menu-button").click();

    // Click App Top link within the drawer
    await page
      .getByTestId("header-menu-drawer")
      .getByRole("link", { name: "アプリトップ" })
      .click();

    // Check URL has parameter
    await expect(page).toHaveURL(/.*show_top=true/);

    // Check we are on the landing page (look for landing page specific text)
    await expect(page.getByTestId("landing-title")).toBeVisible();
  });

  test("Instructions link works", async ({ page }) => {
    await page.goto("/");

    // Open menu
    await page.getByTestId("header-menu-button").click();

    // Click Instructions link within the drawer
    await page
      .getByTestId("header-menu-drawer")
      .getByRole("link", { name: "設定手順" })
      .click();

    // Verify URL
    await expect(page).toHaveURL(/.*\/instructions/);
  });

  test("JSON Register link is hidden when logged out", async ({ page }) => {
    // Disable mock auth for this test to simulate logged out state
    await page.addInitScript(() => {
      window.localStorage.setItem("DISABLE_MOCK_AUTH", "true");
    });

    await page.goto("/");
    await page.getByTestId("header-menu-button").click();
    await expect(
      page
        .getByTestId("header-menu-drawer")
        .getByRole("link", { name: "JSON登録" }),
    ).not.toBeVisible();
  });
});
