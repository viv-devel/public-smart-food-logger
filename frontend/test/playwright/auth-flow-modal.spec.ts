import { test, expect } from "@playwright/test";

test.describe("Auth Flow & Redirect Modal", () => {
  test("Authenticated user sees modal and can remember redirect", async ({
    page,
  }) => {
    // 1. Simulate Authenticated State
    await page.addInitScript(() => {
      localStorage.setItem("fitbitAuthCompleted", "true");
      localStorage.removeItem("autoRedirectToRegister");
      localStorage.removeItem("redirectRemembered");
    });

    await page.goto("/");

    // 2. Click "食事の記録を登録する" button
    const registerButton = page.getByRole("button", {
      name: "食事の記録を登録する",
    });
    await expect(registerButton).toBeVisible();
    await registerButton.click();

    // 3. Verify Modal appears
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(page.getByText("次回以降もこの設定を記憶する")).toBeVisible();

    // 4. Check "Remember" checkbox
    const checkbox = page.getByLabel("次回以降もこの設定を記憶する");
    await checkbox.check();

    // 5. Confirm
    const confirmButton = modal.getByRole("button", {
      name: "食事の記録を登録する",
    });
    await confirmButton.click();

    // 6. Verify Redirect
    await expect(page).toHaveURL(/\/register/);

    // 7. Verify Persistence
    const remembered = await page.evaluate(() =>
      localStorage.getItem("redirectRemembered"),
    );
    expect(remembered).toBe("true");

    // 8. Go back to home and verify auto-redirect (or immediate push logic)
    // Note: The implemented logic uses `router.push` in `handleStartFlow` if remembered.
    await page.goto("/");

    // Logic: If remembered, clicking start should redirect immediately WITHOUT modal.
    await registerButton.click();
    await expect(page).toHaveURL(/\/register/);
    await expect(modal).not.toBeVisible();
  });

  test("Shows success message after auth flow", async ({ page }) => {
    // 1. Simulate Auth Success Redirect (session flag set)
    await page.addInitScript(() => {
      localStorage.setItem("fitbitAuthCompleted", "true");
      sessionStorage.setItem("showAuthSuccessModal", "true");
    });

    await page.goto("/");

    // 2. Verify Modal Auto-Opens with Success Message
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(page.getByText("登録ありがとうございます")).toBeVisible();
    await expect(
      page.getByText("✅ Fitbitの認証が確認できました！"),
    ).toBeVisible();

    // 3. Close modal
    const closeButton = page.getByRole("button", { name: "閉じる" });
    await closeButton.click();
    await expect(modal).not.toBeVisible();

    // 4. Reload and verify modal does NOT auto-open (flag cleared)
    await page.reload();
    await expect(modal).not.toBeVisible();
  });

  test("A11Y: Modal Focus Management", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("fitbitAuthCompleted", "true");
    });
    await page.goto("/");

    // Open modal
    await page.getByRole("button", { name: "食事の記録を登録する" }).click();

    // Verify focus is inside modal (on the container with tabIndex=-1)
    // Note: In JSDOM/headless this can be tricky, but we can check activeElement
    const modalContent = page.locator('div[role="dialog"] > div');
    await expect(modalContent).toBeFocused();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
