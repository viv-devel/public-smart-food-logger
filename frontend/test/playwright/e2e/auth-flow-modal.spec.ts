import { test, expect } from "@playwright/test";

test.describe("Auth Flow & Redirect Modal", () => {
  test("Authenticated user sees modal and can remember redirect", async ({
    page,
  }) => {
    // 1. Simulate Authenticated State
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("fitbitAuthCompleted", "true");
      localStorage.removeItem("autoRedirectToRegister");
      localStorage.removeItem("redirectRemembered");
    });
    // Reload to apply localStorage state for the first time
    await page.reload();

    // Ensure authentication is recognized
    await expect(page.getByText("Fitbit連携済み")).toBeVisible({
      timeout: 10000,
    });

    // 2. Click "食事の記録を登録する" button
    const registerButton = page.getByRole("button", {
      name: "食事の記録を登録する",
    });
    await expect(registerButton).toBeVisible();
    await registerButton.click({ force: true });

    // 3. Verify Modal appears
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(page.getByText("次回以降もこの設定を記憶する")).toBeVisible();

    // 4. Check "Remember" checkbox
    const checkbox = page.getByLabel("次回以降もこの設定を記憶する");
    await checkbox.check({ force: true });

    // 5. Confirm
    const confirmButton = modal.getByRole("button", {
      name: "食事の記録を登録する",
    });
    await confirmButton.click({ force: true });

    // 6. Verify Redirect
    await expect(page).toHaveURL(/\/register/, { timeout: 10000 });

    // 7. Verify Persistence
    const remembered = await page.evaluate(() =>
      localStorage.getItem("redirectRemembered"),
    );
    expect(remembered).toBe("true");

    // 8. Go back to home and verify auto-redirect
    await page.goto("/");

    // Now that logic supports automatic redirect, we expect to be redirected to /register
    // WITHOUT clicking any button.
    await expect(page).toHaveURL(/\/register/, { timeout: 10000 });
  });

  test("Shows success message after auth flow", async ({ page }) => {
    // 1. Simulate Auth Success Redirect via actual OAuth Callback Page
    // Navigate to /oauth with uid param to simulate callback
    await page.goto("/oauth?uid=mock-uid-from-provider");

    // The page should redirect to / automatically.
    // Wait for URL to be / (or localhost:3000/)
    await expect(page).toHaveURL("http://localhost:3000/");

    // 2. Wait for Auth and Verify Modal Auto-Opens with Success Message
    // Ensure authentication is recognized before checking for modal
    await expect(page.getByText("Fitbit連携済み")).toBeVisible({
      timeout: 10000,
    });

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Ensure overlay doesn't block visibility check
    await expect(page.getByText("登録ありがとうございます")).toBeVisible();
    await expect(
      page.getByText("✅ Fitbitの認証が確認できました！"),
    ).toBeVisible();

    // 3. Close modal
    const closeButton = page.getByRole("button", { name: "閉じる" });
    await closeButton.click({ force: true });
    await expect(modal).not.toBeVisible();

    // 4. Reload and verify modal does NOT auto-open (flag cleared)
    await page.reload();
    await expect(modal).not.toBeVisible();
  });

  test("A11Y: Modal Focus Management", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("fitbitAuthCompleted", "true");
      // Ensure no success modal interferes
      sessionStorage.removeItem("showAuthSuccessModal");
    });
    await page.reload();

    // Ensure authentication is recognized
    await expect(page.getByText("Fitbit連携済み")).toBeVisible({
      timeout: 10000,
    });

    // Open modal
    await page.getByRole("button", { name: "食事の記録を登録する" }).click({
      force: true,
    });

    // Verify focus is inside modal (on the container with tabIndex=-1)
    const modalContent = page.locator('div[role="dialog"] > div');
    await expect(modalContent).toBeFocused();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
