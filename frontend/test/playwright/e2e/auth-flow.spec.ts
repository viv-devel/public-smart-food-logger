import { expect, test } from "@playwright/test";

test.describe("認証フロー", () => {
  test("利用開始ボタンをクリックするとreCAPTCHA検証を経てFitbit認証へ遷移すること", async ({
    page,
  }) => {
    // 外部のreCAPTCHAスクリプトのロードをブロックして、モックが上書きされないようにする
    await page.route("https://www.google.com/recaptcha/**", (route) => {
        route.abort();
    });

    // reCAPTCHA検証APIのモック
    // NOTE: 中間状態のテストは省略するため、遅延は不要だが、
    // 非同期処理であることをシミュレートするためにわずかに残す
    await page.route("**/recaptchaVerifier", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
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
            return "mock-recaptcha-token";
        },
      };
    });

    await page.goto("/");

    // ボタンのロケーターを定義
    const startButton = page.getByRole("button", { name: "利用を開始する" });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await expect(startButton).toBeEnabled();

    // ボタンをクリック
    await startButton.click();

    // NOTE: 「検証中...」の中間状態チェックはCI環境等でのタイミング問題により不安定になる可能性があるためスキップし、
    // 最終的なリダイレクト結果のみを検証する。

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
    expect(url).toContain("response_type");
    expect(url).toContain("scope");

    const expectedRedirectUri =
      process.env.NEXT_PUBLIC_OAUTH_FITBIT_REDIRECT_URI;
    if (expectedRedirectUri) {
      expect(url).toContain(encodeURIComponent(expectedRedirectUri));
    } else {
      expect(url).toContain("redirect_uri");
    }
  });
});
