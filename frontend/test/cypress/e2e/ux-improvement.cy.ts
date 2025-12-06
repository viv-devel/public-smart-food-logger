describe("UX Improvement Tests for Smart Food Logger AI", () => {
  context("Landing Page (smart-food-logger)", () => {
    beforeEach(() => {
      cy.visit("/");
    });

    it("【反映後:OK / 反映前:NG】プライバシーに関する文言が簡潔かつ正確になっている", () => {
      cy.contains(
        "食事データはFitbitにのみ記録され、このサイトには残りません。",
      ).should("be.visible");
      cy.contains("いかなるサーバーにも保存されません。").should("not.exist");
    });

    it("【反映後:OK / 反映前:NG】「設定手順を見る」ボタンがゴーストボタンになっている", () => {
      cy.contains("button", "設定手順を見る")
        .should("have.class", "bg-transparent")
        .and("have.class", "border");
    });

    // it('【反映後:OK / 反映前:NG】reCAPTCHA完了後、成功メッセージが表示され、その後消える', () => {
    //   // 1. モック認証が有効なため、ページロード直後にreCAPTCHAコンテナが表示されていることを確認
    //   cy.get('[data-testid="recaptcha-container"]').should('be.visible');

    //   // 2. 自動的にreCAPTCHAが完了し、成功メッセージが表示されることを確認
    //   cy.contains('✓ reCAPTCHA認証が完了しました').should('be.visible');

    //   // 3. アニメーションが完了し、コンテナの高さが0になるのを待つ
    //   cy.get('[data-testid="recaptcha-container"]', { timeout: 2000 }).should('have.class', 'h-0');
    // });
  });

  context("Instructions Page (instructions)", () => {
    beforeEach(() => {
      cy.visit("/instructions");
    });

    it("【反映後:OK / 反映前:NG】Fitbitアカウント作成へのリンクが削除されている", () => {
      // 「準備するもの」セクションのリスト(ul)内に「Fitbitアカウント」の項目があり、
      // その中にアンカータグ(a)が存在しないことを確認する
      cy.get("ul")
        .contains("li", "Fitbitアカウント")
        .within(() => {
          cy.get("a").should("not.exist");
        });
    });

    it("【反映後:OK / 反映前:NG】応用編セクションが存在し、アプリストアへのリンクが正しい", () => {
      cy.get('[data-testid="advanced-usage-section"]').within(() => {
        cy.contains("h2", "応用編：便利な使い方").should("be.visible");
        cy.get('a[href*="apps.apple.com"]').should("have.length.at.least", 2);
        cy.get('a[href*="play.google.com"]').should("have.length.at.least", 2);
      });
    });
  });

  context("Register Page (register)", () => {
    it("【反映後:OK / 反映前:NG】記録成功後、tipsページへのリンクが表示される", () => {
      // API通信をモック
      cy.intercept(
        "POST",
        process.env.BACKEND_FITBIT_WEBHOOK_URL || "**/fitbit-api-logic",
        {
          statusCode: 200,
          body: { message: "Fitbitへの記録が完了しました！" },
        },
      ).as("fitbitApi");

      cy.visit("/register", {
        onBeforeLoad(win) {
          win.localStorage.setItem("fitbitAuthCompleted", "true");
        },
      });

      // ダミーのJSONを入力 (invokeとtypeのハイブリッド)
      const dummyFoodData = {
        foods: [
          { foodName: "test food", amount: 1, unit: "serving", calories: 100 },
        ],
        log_date: "2025-01-01",
        log_time: "12:00:00",
        meal_type: "Lunch",
      };
      const dummyJson = JSON.stringify(dummyFoodData, null, 2);
      const almostAllJson = dummyJson.slice(0, -1); // 最後の文字を除いた部分
      const lastChar = dummyJson.slice(-1); // 最後の文字

      cy.get("textarea#jsonInput")
        .invoke("val", almostAllJson) // まず大部分を高速に設定
        .type(lastChar); // 最後の1文字をtypeで入力してイベントを発火

      // ボタンが有効になるのを待つ
      cy.contains("button", "Fitbitに記録する").should("not.be.disabled");

      // ボタンをクリック
      cy.contains("button", "Fitbitに記録する").click();

      // APIリクエストを待つ
      cy.wait("@fitbitApi");

      // tipsページへのリンクが表示されることを確認
      cy.contains("a", "より便利な使い方のヒントはこちら")
        .should("be.visible")
        .and("have.attr", "href", "/tips");
    });
  });
});
