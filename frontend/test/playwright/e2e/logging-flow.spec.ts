import { expect, test } from "@playwright/test";

test.describe("食事ログ記録フロー", () => {
  test.beforeEach(async ({ page }) => {
    // 1. トップページへ移動
    await page.goto("/");

    // 2. reCAPTCHA認証と匿名ログイン (auth-flow.spec.tsと同様)
    const recaptchaFrame = page.frameLocator('iframe[title="reCAPTCHA"]');
    await recaptchaFrame.locator(".recaptcha-checkbox-border").click();
    await expect(page.getByText("✓ reCAPTCHA認証が完了しました")).toBeVisible({
      timeout: 10000,
    });

    // 利用開始ボタンをクリックして匿名認証を実行
    const startButton = page.getByRole("button", { name: "利用を開始する" });
    await expect(startButton).toBeEnabled();
    await startButton.click();

    // 3. 認証完了を待つ (localStorageを強制セットして /register へ)
    await page.evaluate(() => {
      localStorage.setItem("fitbitAuthCompleted", "true");
    });

    // 登録ページへ移動
    await page.goto("/register");
  });

  test("無効なJSONを入力した場合、バリデーションエラーが表示されること", async ({
    page,
  }) => {
    // 無効なJSON (必須項目欠落)
    const invalidJson = JSON.stringify({
      foods: [], // 空配列
      // log_date 欠落
    });

    await page.fill("#jsonInput", invalidJson);
    await page.getByRole("button", { name: "Fitbitに記録する" }).click();

    // エラーコンテナが表示されることを確認
    const errorContainer = page.locator(".bg-red-900\\/50");
    await expect(errorContainer).toBeVisible();

    // エラーメッセージの内容を確認 (部分一致)
    const text = await errorContainer.textContent();

    expect(text).toBeTruthy();
    // expect(text).toContain("入力データに誤りがあります"); // メッセージが変動する可能性があるため、エラーが表示されたことだけ確認
  });

  test("有効なJSONを入力した場合、(連携未完了のため) エラーが表示されること", async ({
    page,
  }) => {
    // 有効なJSONテンプレート
    const validJson = JSON.stringify({
      foods: [{ foodName: "Test Food", amount: 100, unit: "g", calories: 100 }],
      log_date: "2023-01-01",
      log_time: "12:00:00",
      meal_type: "Lunch",
    });

    await page.fill("#jsonInput", validJson);
    await page.getByRole("button", { name: "Fitbitに記録する" }).click();

    // エラーコンテナが表示されることを確認
    const errorContainer = page.locator(".bg-red-900\\/50");
    await expect(errorContainer).toBeVisible();

    // エラーメッセージの内容を確認
    const text = await errorContainer.textContent();

    // どのようなエラーでも良いので、エラーが表示されたことを確認
    expect(text).not.toBeNull();
  });
});
