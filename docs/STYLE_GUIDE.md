# スタイルガイド

このリポジトリの開発におけるスタイルガイドとルールを定義します。

## 1. アーキテクチャ

- **Next.js**: App Router を使用する。
- **レンダリングモード**:
  - 基本的に SSR (Server-Side Rendering) または Serverless モードを使用する。
  - 以前は `output: "export"` (Static Export) を推奨していたが、Fitbit連携などの動的機能のために廃止された。
  - 必要な場合のみ `output: "export"` を使用するが、現在は推奨されない。

## 2. テスト

- **E2Eテスト**: 機能変更や新機能追加時には、必ず E2E テスト (Playwright) を追加・更新すること。
- **単体テスト**: ロジックの変更には Vitest による単体テストを追加すること。

## 3. コードスタイル

- **Prettier**: コードフォーマットには Prettier を使用する。
- **ESLint**: 静的解析には ESLint を使用する。
