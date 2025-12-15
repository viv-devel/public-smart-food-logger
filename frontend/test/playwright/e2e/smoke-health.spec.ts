import { expect, test } from "@playwright/test";

test.describe("バックエンドヘルスチェック", () => {
  test("GCPバックエンドが正常に応答すること", async ({ request }) => {
    const apiEndpoint = process.env.FOOD_LOG_URL;

    if (!apiEndpoint || apiEndpoint.startsWith("http://localhost")) {
      test.skip();
      return;
    }

    // ヘルスチェックエンドポイントを叩く（codeパラメータなしのGETリクエスト）
    const response = await request.get(apiEndpoint);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("status", "OK");
    expect(body).toHaveProperty("message");
  });
});
