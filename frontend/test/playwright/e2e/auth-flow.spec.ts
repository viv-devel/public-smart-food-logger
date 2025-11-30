import { expect, test } from "@playwright/test";

test.describe("認証フロー", () => {
  test("reCAPTCHA認証後に利用開始ボタンが有効化され、クリックするとFitbit認証へ遷移すること", async ({
    page,
  }) => {
    await page.goto("/");

    // 初期状態ではボタンが無効化されていること
    const startButton = page.getByRole("button", { name: "利用を開始する" });
    await expect(startButton).toBeDisabled();

    // reCAPTCHAのiframeを探してクリック
    // note: テスト用キーを使用しているため、クリックのみで認証が完了する想定
    const recaptchaFrame = page.frameLocator('iframe[title="reCAPTCHA"]');
    await recaptchaFrame.locator(".recaptcha-checkbox-border").click();

    // 認証完了メッセージが表示されるまで待機（少し時間がかかる場合があるため）
    await expect(page.getByText("✓ reCAPTCHA認証が完了しました")).toBeVisible({
      timeout: 10000,
    });

    // レイアウト調整や状態反映のための短い待機
    await page.waitForTimeout(2000);

    // ボタンが有効化されていること
    await expect(startButton).toBeEnabled();

    // ボタンをクリック
    await startButton.click();

    // 期待される動作:
    // 1. Firebase匿名認証 (バックグラウンド)
    // 2. oauth へ遷移
    // 3. Fitbitの認証ページへリダイレクト

    // Fitbitの認証URLに含まれるべきパラメータの一部を確認することで、正しくリダイレクトが開始されたことを検証
    // note: ログインしていない場合は accounts.fitbit.com/login にリダイレクトされる
    await page.waitForURL(
      /.*(fitbit\.com\/oauth2\/authorize|accounts\.fitbit\.com\/login).*/,
      { timeout: 15000 },
    );

    // URLにclient_idが含まれているか確認 (環境変数が正しく読み込まれているかの確認も兼ねる)
    // ログインページにリダイレクトされた場合、元のパラメータは多重にエンコードされている可能性があるため、
    // 単純にパラメータ名が含まれているかを確認する
    const url = page.url();
    expect(url).toContain("client_id");
    expect(url).toContain("response_type");
    expect(url).toContain("scope");
    expect(url).toContain("nutrition");
  });
});
