---
trigger: always_on
---

# ワークスペース・アーキテクチャ定義 (グローバル設定)

## 1. モノレポ構造のコンポーネント

| コンポーネント名 | 役割                                            | デプロイ先           |
| :--------------- | :---------------------------------------------- | :------------------- |
| **frontend**     | ユーザーインターフェース（WEBフロントエンド）。 | Netlify              |
| **backend**      | APIおよび認証処理（ビジネスロジック）。         | Cloud Run (Function) |
| **shared**       | 共通の型定義、ユーティリティコード。            | (個別デプロイは無し) |

## 2. CI/CD 環境の定義（5種類）

環境は、ブランチや目的に応じて以下の5種類が存在する。

| 環境名 (Key)    | 役割                                                   | 連携ブランチ     | デプロイサービス (例)         |
| :-------------- | :----------------------------------------------------- | :--------------- | :---------------------------- |
| **Production**  | 安定版。ユーザー利用の最終環境。                       | `main`           | Netlify, Cloud Run            |
| **Staging**     | リリース候補版 (RC)。統合テスト・最終検証用。          | `develop`        | Netlify, Cloud Run            |
| **Preview**     | 個別機能検証用。PR作成時に一時的に生成される。         | Feature ブランチ | Netlify, backendはなし (予定) |
| **CI**          | 継続的インテグレーション専用。テスト・ビルドチェック。 | PR チェック      | GitHub Actions (ランナー)     |
| **Development** | 開発者のローカル環境。                                 | Local Machine    | Local Server                  |

## 3. 外部サービス連携 (Fitbit)

- **サービス:** Fitbit WEBアプリ連携 (OAuth認証を使用)
- **環境依存:** Production、Staging、Development（local）の3環境それぞれで、**異なるコールバックURL**と**クライアント設定**が必要である。

## 4. デプロイ手段

- すべてのデプロイは **GitHub Actions のワークフロー**から実行される。

## 5. リリースフロー (develop -> main)

- **PR作成時**: `develop` から `main` へのプルリクエストを作成してリリースを行う。
- **PR本文 (Body)**:
  - コミットログを羅列するのではなく、**日本語で変更点のサマリ**を作成すること。
  - 変更内容は「機能追加」「バグ修正」「リファクタリング」「その他」などでカテゴライズして記述する。

## 6. AI Agent Ignore Rules

The following file patterns should be ignored by AI agents (Gemini, Sonnet, etc.) to avoid context pollution and security risks, unless explicitly requested.

- **Secrets/Keys**: _.json (GCP keys, credentials), .env_ (except .env.example).
- **Large/Auto-generated**: package-lock.json, pnpm-lock.yaml, plan.txt.
- **Logs/Reports**: \*.log, output/ (raw data), coverage/.
- **Config**: .git/, .vscode/, .gemini/ (unless editing agent config).

## 7. ローカル一時ファイル (Windows対応)

- **推奨ディレクトリ**: .agent/tmp/
- **目的**: Windows環境などで一時的な作業ファイル（ログ、ダウンロードしたJSONなど）を置く場所として使用する。
- **Git管理**: このディレクトリは .gitignore によりデフォルトで無視されるため、Git履歴を汚さずに安全に利用できる。
