describe("静的ページ", () => {
  it("Smart Food Logger AIのメインページが主要なコンテンツと共に読み込まれること", () => {
    cy.visit("");
    cy.get("h1").contains("Smart Food Logger AI").should("be.visible");
    cy.get("button").contains("利用を開始する").should("be.visible");
    cy.get("p").should("contain", "食べたものをAIが解析し、Fitbitへ自動記録。");
    cy.get("p").should(
      "contain",
      "食事データはFitbitにのみ記録され、このサイトには残りません。",
    );
  });

  it("利用手順ページが主要なコンテンツと共に読み込まれること", () => {
    cy.visit("instructions");
    cy.get("h1").contains("カスタムGemini 設定手順").should("be.visible");
    cy.contains("h2", "応用編：便利な使い方").should("be.visible");
  });

  it("データ登録ページが主要なコンテンツと共に読み込まれること", () => {
    cy.visit("register", {
      onBeforeLoad(win) {
        win.localStorage.setItem("fitbitAuthCompleted", "true");
      },
    });
    cy.get("h1").contains("Fitbitに食事を記録 (JSON入力)").should("be.visible");
    cy.get("textarea").should("be.visible");
    cy.get("button").contains("Fitbitに記録する").should("be.visible");
  });

  it("プライバシーポリシーページが主要なコンテンツと共に読み込まれること", () => {
    cy.visit("privacy");
    cy.contains("h2", "Smart Food Logger AI - プライバシーポリシー").should(
      "be.visible",
    );
  });

  it("利用規約ページが主要なコンテンツと共に読み込まれること", () => {
    cy.visit("terms");
    cy.contains("h2", "Smart Food Logger AI - 利用規約").should("be.visible");
  });
});
