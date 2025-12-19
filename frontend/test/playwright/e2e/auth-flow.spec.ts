import { expect, test } from "@playwright/test";

test.describe("認証フロー", () => {
  test("利用開始ボタンをクリックするとreCAPTCHA検証を経てFitbit認証へ遷移すること", async ({
    page,
  }) => {
    // reCAPTCHA検証APIのモック
    await page.route("**/recaptchaVerifier", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // Google reCAPTCHAのスクリプトと実行をモック
    await page.addInitScript(() => {
      (window as any).grecaptcha = {
        ready: (callback: () => void) => callback(),
        execute: async () => {
            await new Promise((resolve) => setTimeout(resolve, 200));
            return "mock-recaptcha-token";
        },
      };
    });

    await page.goto("/");

    // ボタンのロケーターを定義（名前ではなく場所やクラスで特定するか、状態変化に合わせてロケーターを変える）
    // ここでは初期状態の名前で取得
    const startButton = page.getByRole("button", { name: "利用を開始する" });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await expect(startButton).toBeEnabled();

    // ボタンをクリック
    await startButton.click();

    // クリック後、テキストが「検証中...」に変化し、無効化されていることを確認
    // 新しい名前でボタンを探す
    const verifyingButton = page.getByRole("button", { name: "検証中..." });
    await expect(verifyingButton).toBeVisible();
    await expect(verifyingButton).toBeDisabled();

    if (process.env.CI && process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
      console.log(
        "CI environment with Mock Auth detected. Skipping external URL redirect check.",
      );
      return;
    }

    await page.waitForURL(
      /.*(fitbit\.com\/oauth2\/authorize|accounts\.fitbit\.com\/login).*/,
      { timeout: 15000 },
    );

    const url = page.url();
    expect(url).toContain("client_id");

    const expectedRedirectUri =
      process.env.NEXT_PUBLIC_OAUTH_FITBIT_REDIRECT_URI;
    if (expectedRedirectUri) {
      expect(url).toContain(encodeURIComponent(expectedRedirectUri));
    } else {
      expect(url).toContain("redirect_uri");
    }
  });
});
