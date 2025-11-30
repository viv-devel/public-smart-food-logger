# Backend Configuration Files - 設定ファイル整理

## 概要

このドキュメントは、backend ディレクトリ内の設定ファイルの役割と、フロントエンドと共有可能な設定、バックエンド固有の設定を整理したものです。

## 設定ファイル一覧

### 1. `tsconfig.json` (Backend 固有)

**役割:** TypeScript コンパイラの設定

**Backend 固有の理由:**

- `module: "NodeNext"` - Node.js 環境用の ESM 設定
- `outDir: "./dist"` - コンパイル出力先
- `types: ["node", "jest"]` - Node.js と Jest の型定義
- テスト環境を含む (`test/**/*`)
- `jest.config.ts` を含む (Lintエラー回避のため)

**Frontend との違い:**

- Frontend: `module: "esnext"`, `moduleResolution: "bundler"` (Next.js/Webpack 用)
- Frontend: `jsx: "react-jsx"`, `noEmit: true` (ビルドは Next.js が担当)
- Frontend: `lib: ["dom", "dom.iterable", "esnext"]` (ブラウザ API)

**共有可能な設定:**

- `strict: true`
- `esModuleInterop: true`
- `skipLibCheck: true`
- `forceConsistentCasingInFileNames: true`
- `isolatedModules: true`

### 2. `package.json` (Backend 固有)

**役割:** プロジェクトメタデータと依存関係管理

**Backend 固有の理由:**

- Cloud Functions 用のスクリプト (`start`)
- ビルドスクリプト (`build`): `tsup` を使用してバンドル (Target: Node 20)
- Backend 固有の依存関係 (`@google-cloud/*`, `firebase-admin`, `node-fetch`)
- `type: "module"` - ESM 使用
- `main: "dist/index.js"` - エントリーポイント

**共有不可:** 各プロジェクトで完全に独立した依存関係とスクリプトを持つ

### 3. `eslint.config.mjs` (部分的に共有可能)

**役割:** ESLint の設定

**Backend 固有の設定:**

- Jest 用のルール (`test/**/*.test.ts`)
- TypeScript のみ対象 (`**/*.ts`)
- `globalIgnores: ["dist/**", "build/**"]`

**Frontend 固有の設定:**

- Next.js 用のルール (`eslint-config-next`)
- Cypress 用のルール
- JSX/TSX 対応 (`**/*.{ts,tsx}`)
- `globalIgnores: [".next/**", "out/**"]`

**共有可能な設定:**

- TypeScript 基本ルール (`@typescript-eslint/no-unused-vars`)
- Import sort ルール (`simple-import-sort`)
- Prettier 統合 (`eslint-config-prettier`)

### 4. `jest.config.ts` (Backend 固有)

**役割:** Jest テストランナーの設定

**Backend 固有の理由:**

- `package.json` から切り出し、設定を外部化
- `ts-jest` プリセットを使用
- Backend 特有のパスエイリアス解決 (`@/` -> `src/`, `@shared/` -> `../shared/`)

### 5. `.gitignore` (Backend 固有)

**役割:** Git で無視するファイル/ディレクトリの指定

**Backend 固有の内容:**

- `dist/` - TypeScript コンパイル出力
- `node_modules/`
- `.env*` - 環境変数ファイル
- テスト関連の一時ファイル

**共有不可:** プロジェクトごとに異なる成果物があるため個別管理

### 6. `.gcloudignore` (Backend 固有)

**役割:** Google Cloud Functions デプロイ時に除外するファイル

**Backend 固有の理由:**

- Cloud Functions 特有の設定
- `src/`, `test/`, `tsconfig.json` など開発用ファイルを除外
- `dist/` のみをデプロイ
- `.github`, `coverage`, `CONFIG.md`, `eslint.config.mjs`, `jest.config.ts` など不要なファイルを除外

**共有不可:** Backend 専用

## 設定の整理方針

### 現在の状態 ✅

1. **TypeScript 設定** - Backend と Frontend で独立して管理
2. **ESLint 設定** - Backend と Frontend で独立して管理
3. **Package.json** - 完全に独立
4. **Jest 設定** - `jest.config.ts` に独立化

### 改善済み項目 ✅

1. **ビルドシステム** - `tsc` + `tsc-alias` から `tsup` (esbuild) に移行し、Cloud Functions デプロイの信頼性を向上
2. **インポートパス** - 相対パス (`../../`) に統一し、エイリアス依存を排除
3. **Jest 設定** - `package.json` から `jest.config.ts` へ分離
4. **Node.js バージョン** - ビルドターゲットを Node 20 に更新

### 削除推奨項目

1. **`babel.config.cjs`** - TypeScript + ts-jest 環境では不要 (既に削除済みであれば無視)
2. **`babel-jest`, `@babel/core`, `@babel/preset-env`** (devDependencies) - 使用されていない (既に削除済みであれば無視)

## 共有型定義

### `shared/types.ts` ✅

**役割:** Frontend と Backend で共通の型定義

**内容:**

- `FoodItem`
- `FitbitLogRequest`
- `ErrorDetail`
- `RegisterFoodResponse`

**アクセス方法:**

- Backend: `import { FoodItem } from '../../shared/types.js'`
- Frontend: `import { FoodItem } from '@shared/types'`

Backendではビルドシステムの簡素化（`tsup` 利用）に伴い、`tsconfig.json` の `paths` 設定は削除し、相対パスを使用しています。

## まとめ

### 現在の設定状態

| 設定ファイル        | 状態        | 共有可能性          | 備考                                       |
| ------------------- | ----------- | ------------------- | ------------------------------------------ |
| `tsconfig.json`     | ✅ 正常     | ❌ Backend 固有     | 環境が異なるため個別管理が適切             |
| `package.json`      | ✅ 修正済み | ❌ 完全に独立       | 依存関係とスクリプトが異なる               |
| `eslint.config.mjs` | ✅ 修正済み | △ 部分的            | ルールセットは共有可能だが環境設定は異なる |
| `jest.config.ts`    | ✅ 新規作成 | ❌ Backend 固有     | テスト環境設定                             |
| `.gitignore`        | ✅ 正常     | ❌ プロジェクト固有 | 成果物が異なる                             |
| `.gcloudignore`     | ✅ 正常     | ❌ Backend 固有     | Cloud Functions 専用                       |

### 推奨アクション

1. ✅ **完了:** ESLint 依存関係の追加
2. ✅ **完了:** `package.json` の `main` フィールド修正
3. ✅ **完了:** ESLint TypeScript parser 設定追加
4. ✅ **完了:** `tsup` への移行と相対パス化
5. ✅ **完了:** Jest 設定の切り出し
6. ✅ **完了:** 共有型定義 (`shared/types.ts`) の実装

現在の設定は、フロントエンドとバックエンドの環境の違いを適切に反映しており、共有すべき部分（型定義）は共有され、個別管理すべき部分は分離されています。
