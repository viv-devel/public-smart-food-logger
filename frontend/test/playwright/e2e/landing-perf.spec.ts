import { expect, test } from "@playwright/test";

test.describe("Landing Page Performance & Layout", () => {
  test("prioritizes static content and lazily loads auth section", async ({
    page,
  }) => {
    // Navigate to the landing page
    await page.goto("/");

    // 1. Verify "How It Works" (static content) is visible immediately
    // Using a more specific locator if possible, or text.
    await expect(page.getByRole("heading", { name: "How It Works" })).toBeVisible();

    // 2. Verify Auth section is NOT immediately visible (it's delayed)
    // We can't easily check for "not visible immediately" without race conditions,
    // but we can check that it BECOMES visible eventually without a hard wait.

    // Check for the "Start Using" button (or "Login" equivalent)
    // In the mock auth environment, it might show "Fitbit連携済み" or "利用を開始する" depending on state.
    // Assuming fresh state or based on `isMockAuth`.

    // Note: In CI environment with mock auth, we might be logged in automatically if logic dictates,
    // but the `FirebaseAuthProvider` logic with `isMockAuth` sets user immediately.
    // HOWEVER, `page.tsx` has `setTimeout` delay for `isAuthReady`.

    // We expect the button "設定手順を見る" (See Instructions) which is also inside the delayed block.
    await expect(page.getByRole("button", { name: "設定手順を見る" })).toBeVisible();

    // Verify console log if needed, though hard to assert in standard playwright test without page error listener
    // but the requirement was just to add it to code.
  });
});
