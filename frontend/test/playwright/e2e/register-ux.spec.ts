import { expect, test } from "@playwright/test";

test.describe("Register Page UX", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route("**/api/auth/**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ user: { uid: "test-user" } }),
      });
    });

    // Visit the register page
    await page.goto("/register");

    // Set localStorage to simulate logged-in state if needed by the app logic
    // (The app uses Firebase Auth listener, but we might need to wait for it)
  });

  test("should show paste button and collapsible template", async ({
    page,
  }) => {
    // Check for Paste button
    const pasteButton = page.getByRole("button", {
      name: "クリップボードから貼り付け",
    });
    await expect(pasteButton).toBeVisible();

    // Check for Template details
    const templateSummary = page.getByText("開発用テンプレートを読み込む");
    await expect(templateSummary).toBeVisible();

    // Click summary to reveal button
    await templateSummary.click();
    const loadTemplateBtn = page.getByRole("button", {
      name: "サンプルデータを挿入する",
    });
    await expect(loadTemplateBtn).toBeVisible();
  });

  test("should show success view and allow logging another meal", async ({
    page,
  }) => {
    // Note: このテストは環境変数 NEXT_PUBLIC_MOCK_AUTH=true によるモックに依存しています
    // Server Action (logToFitbit) 内でAPI呼び出しがスキップされます

    // Fill the Textarea with valid JSON
    const validJson = JSON.stringify({
      meal_type: "Lunch",
      log_date: "2023-10-27",
      log_time: "12:30:00", // Required field
      foods: [
        {
          foodName: "Grilled Chicken",
          amount: 100,
          unit: "g",
          calories: 165,
          protein_g: 31,
        },
        {
          foodName: "Rice",
          amount: 150,
          unit: "g",
          calories: 195,
          totalCarbohydrate_g: 44,
        },
      ],
    });

    await page.fill("#jsonInput", validJson);

    // Click Submit
    await page.click('button[type="submit"]');

    // Expect Success View
    await expect(page.getByText("登録が完了しました！")).toBeVisible();
    await expect(page.getByText("Grilled Chicken")).toBeVisible();
    await expect(page.getByText("Rice")).toBeVisible();

    // Expect Form to be hidden
    await expect(page.locator("#jsonInput")).not.toBeVisible();

    // Click "Log Another Meal"
    await page.click('button:has-text("続けて次の食事を記録する")');

    // Expect Form to be visible again and empty
    await expect(page.locator("#jsonInput")).toBeVisible();
    await expect(page.locator("#jsonInput")).toBeEmpty();
  });
});
