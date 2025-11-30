import { expect, test } from "@playwright/test";

test.describe("静的ページ", () => {
  test("Smart Food Logger AIのメインページが主要なコンテンツと共に読み込まれること", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("main h1")).toContainText("Smart Food Logger AI");
    await expect(
      page.getByRole("button", { name: "利用を開始する" }),
    ).toBeVisible();
    await expect(
      page.getByText("食べたものをAIが解析し、Fitbitへ自動記録。"),
    ).toBeVisible();
    await expect(
      page.getByText(
        "食事データはFitbitにのみ記録され、このサイトには残りません。",
      ),
    ).toBeVisible();
  });

  test("利用手順ページが主要なコンテンツと共に読み込まれること", async ({
    page,
  }) => {
    await page.goto("/instructions");
    await expect(page.locator("main h1")).toContainText(
      "カスタムGemini 設定手順",
    );
    await expect(
      page.getByRole("heading", { level: 2, name: "応用編：便利な使い方" }),
    ).toBeVisible();
  });

  test("データ登録ページが主要なコンテンツと共に読み込まれること", async ({
    page,
  }) => {
    // localStorageを事前に設定
    await page.addInitScript(() => {
      localStorage.setItem("fitbitAuthCompleted", "true");
    });

    await page.goto("/register");

    await expect(page.locator("main h1")).toContainText(
      "Fitbitに食事を記録 (JSON入力)",
    );
    await expect(page.locator("textarea")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Fitbitに記録する" }),
    ).toBeVisible();
  });

  test("プライバシーポリシーページが主要なコンテンツと共に読み込まれること", async ({
    page,
  }) => {
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Smart Food Logger AI - プライバシーポリシー",
      }),
    ).toBeVisible();
  });

  test("利用規約ページが主要なコンテンツと共に読み込まれること", async ({
    page,
  }) => {
    await page.goto("/terms");
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Smart Food Logger AI - 利用規約",
      }),
    ).toBeVisible();
  });
});
