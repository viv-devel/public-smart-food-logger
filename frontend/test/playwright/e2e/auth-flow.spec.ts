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
    // CI環境（mock auth有効時）では外部サイトへのリダイレクト確認をスキップする場合があるが、
    // ここでは動作確認のため試行し、失敗してもテスト全体は落とさないようにするか、条件分岐する
    // 今回は、CI環境での外部アクセス制限やタイムアウトを考慮し、CI環境かつMock Auth有効時はスキップ可能とする
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

    // URLにclient_idが含まれているか確認 (環境変数が正しく読み込まれているかの確認も兼ねる)
    // ログインページにリダイレクトされた場合、元のパラメータは多重にエンコードされている可能性があるため、
    // 単純にパラメータ名が含まれているかを確認する
    const url = page.url();
    expect(url).toContain("client_id");
    expect(url).toContain("response_type");
    expect(url).toContain("scope");
    expect(url).toContain("nutrition");
    // リダイレクトURIパラメータが含まれていることを確認 (新しい環境変数が使用されているか)
    const expectedRedirectUri =
      process.env.NEXT_PUBLIC_OAUTH_FITBIT_REDIRECT_URI;
    if (expectedRedirectUri) {
      expect(url).toContain(encodeURIComponent(expectedRedirectUri));
    } else {
      // 環境変数が無い場合はキーの存在だけでも確認
      expect(url).toContain("redirect_uri");
    }
  });
});
